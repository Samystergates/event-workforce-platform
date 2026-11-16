package com.eventico.form.servicesImp;

import com.eventico.form.configurations.JwtTokenHelper;
import com.eventico.form.dtos.FormDto;
import com.eventico.form.dtos.FormSubmissionEvent;
import com.eventico.form.dtos.ServiceProviderDto;
import com.eventico.form.entities.Form;
import com.eventico.form.repositories.FormRepo;
import com.eventico.form.services.FormService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class FormServiceImp implements FormService {
    private static final Logger LOGGER = LoggerFactory.getLogger(FormServiceImp.class);

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @Autowired
    FormRepo formRepo;

    @Autowired
    ModelMapper modelMapper;

    @Value("${upload.dir}")
    private String uploadDir;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private JwtTokenHelper jwtTokenHelper;

    @Transactional
    @Override
    public void postReviewFormServiceProvider(String token, FormDto formDto) {
        if (!jwtTokenHelper.validateTokenForReviewForm(token)) {
            throw new IllegalArgumentException("Invalid or expired review form token");
        }

        formDto.setCreatedDate(LocalDateTime.now());
        Form toSaveForm = modelMapper.map(formDto, Form.class);

        List<String> savedPaths = new ArrayList<>();
        if (formDto.getFiles() != null) {
            for (MultipartFile file : formDto.getFiles()) {

                if (!file.isEmpty()) {
                    Path filePath = resolveSafeAttachmentPath(Paths.get(uploadDir), file.getOriginalFilename());
                    String filename = filePath.getFileName().toString();

                    try {
                        Files.createDirectories(filePath.getParent());
                        Files.copy(file.getInputStream(), filePath);
                    } catch (IOException e) {
                        throw new IllegalStateException("Unable to store review attachment " + filename, e);
                    }

                    savedPaths.add(filename);
                }
            }

            toSaveForm.setFilePath(savedPaths);
        }

        Long serviceProviderId = Long.parseLong(this.jwtTokenHelper.getSpIdFromToken(token));
        Long jobId = Long.parseLong(this.jwtTokenHelper.getUsernameFromToken(token));
        toSaveForm.setServiceProviderId(serviceProviderId);
        toSaveForm.setJobId(jobId);
        saveNewForm(toSaveForm);

        formDto.setServiceProvider(new ServiceProviderDto(serviceProviderId));
        try {
            publishFormEvent(token, formDto);
            LOGGER.info("Published form submission event for job {} and serviceProvider {}", jobId, serviceProviderId);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to publish form submission event", e);
        }
    }

    static Path resolveSafeAttachmentPath(Path uploadRoot, String originalFilename) {
        Path normalizedRoot = uploadRoot.toAbsolutePath().normalize();
        String extension = "";
        if (originalFilename != null) {
            int lastSeparator = Math.max(originalFilename.lastIndexOf('/'), originalFilename.lastIndexOf('\\'));
            int dot = originalFilename.lastIndexOf('.');
            if (dot > lastSeparator && dot < originalFilename.length() - 1) {
                String candidate = originalFilename.substring(dot + 1);
                if (candidate.matches("[A-Za-z0-9]{1,10}")) {
                    extension = "." + candidate;
                }
            }
        }

        Path destination = normalizedRoot.resolve(UUID.randomUUID() + extension).normalize();
        if (!destination.startsWith(normalizedRoot)) {
            throw new IllegalArgumentException("Review attachment path is outside the configured upload directory");
        }
        return destination;
    }

    @Override
    public void saveNewForm(Form form) {
        formRepo.save(form);
    }

        @Override
    public Boolean validateFilledReviewForm(String token) {
        if (jwtTokenHelper.validateTokenForReviewForm(token)) {
            Long jobId = jwtTokenHelper.getJobIdFromToken(token);
            Long serviceProviderId = Long.parseLong(this.jwtTokenHelper.getSpIdFromToken(token));
            return validateFilledReviewFormByValues(jobId, serviceProviderId);
        }
        return true;
    }

    public Boolean validateFilledReviewFormByValues(Long jobId, Long serviceProviderId) {
        Form form = formRepo.findByJobIdAndServiceProviderId(jobId, serviceProviderId);
        return form != null;
    }

    @Override
    public List<String> getFilePaths(Long jobId, Long serviceProviderId) {
        Form form = formRepo.findByJobIdAndServiceProviderId(jobId, serviceProviderId);
        return form != null ? form.getFilePath() : Collections.emptyList();
    }

    public void publishFormEvent(String token, FormDto formDto) throws JsonProcessingException {
        FormSubmissionEvent event = new FormSubmissionEvent(token, formDto);
        String payload = objectMapper.writeValueAsString(event);

        kafkaTemplate.send("form-events", payload);
    }
}
