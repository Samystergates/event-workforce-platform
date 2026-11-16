
package com.eventico.form.controllers;

import com.eventico.form.dtos.FormDto;
import com.eventico.form.services.FormService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/form"})
@CrossOrigin
public class FormController {
    @Autowired
    FormService formService;

    public FormController() {
    }

    @GetMapping({"/validate/{token}"})
    public ResponseEntity<?> validateReviewFormIfFilled(@PathVariable("token") String token) {
        try {
            Boolean isValid = this.formService.validateFilledReviewForm(token);
            return ResponseEntity.ok(Collections.singletonMap("isValid", isValid));
        } catch (Exception var3) {
            Exception e = var3;
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping(value = "/review-form/service-provider", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> postReviewFormServiceProvider(
            @RequestParam("token") String token,
            @RequestPart("form") String formJson,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) throws Exception {

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        FormDto form = objectMapper.readValue(formJson, FormDto.class);

        form.setFiles(files);
        formService.postReviewFormServiceProvider(token, form);
        return ResponseEntity.ok("Success: review form posted successfully");
    }

    @GetMapping("/{jobId}/{serviceProviderId}/files")
    public List<String> getFilePaths(@PathVariable Long jobId, @PathVariable Long serviceProviderId) {
        return formService.getFilePaths(jobId, serviceProviderId);
    }

}
