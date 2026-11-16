package com.rentmen.app.services.imp;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rentmen.app.configurations.JwtTokenHelper;
import com.rentmen.app.entities.ArchiveJob;
import com.rentmen.app.entities.Invoice;
import com.rentmen.app.entities.Job;
import com.rentmen.app.entities.PunchesDetails;
import com.rentmen.app.repositories.*;
import com.rentmen.app.services.JobService;
import com.rentmen.app.services.MessageService;
import com.rentmen.app.utils.JobStatus;
import com.rentmen.app.utils.MessageTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class JobSchedulerService {
    private static final Logger LOGGER = LoggerFactory.getLogger(JobSchedulerService.class);

    @Value("${form.sp.uri}")
    private String spUI;
    @Value("${form.client.uri}")
    private String clientURI;
    @Value("${eventico.contact-email}")
    private String contactEmail;
    @Autowired
    private JobRepo jobRepo;
    @Autowired
    private JobService jobService;
    @Autowired
    EmailSendingService emailSendingService;
    @Autowired
    private ArchiveRepo archiveJobRepo;
    @Autowired
    private PunchesDetailsRepo punchesDetailsRepo;
    @Autowired
    private JobServiceProviderRepository jobServiceProviderRepository;
    @Autowired
    private PotentialJobOfferRepo potentialJobOfferRepository;
    @Autowired
    private JobRequiredSkillRepository jobRequiredSkillRepository;
    @Autowired
    private JwtTokenHelper jwtTokenHelper;
    @Autowired
    private TwilioMessageService twilioMessageService;
    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;
    @Autowired
    private MessageService messageService;


    public JobSchedulerService(JobRepo jobRepo, ArchiveRepo archiveJobRepo) {
        this.jobRepo = jobRepo;
        this.archiveJobRepo = archiveJobRepo;
    }

    @Scheduled(
            fixedRate = 600000L
    )
    @Transactional
    public void checkAndArchiveExpiredJobs() {
        LocalDate currentDate = LocalDate.now();
        LocalTime currentTime = LocalTime.now();
        List<Job> expiredJobs = this.jobRepo.findRecentlyExpiredJobs(currentDate, currentTime);
        expiredJobs.forEach((job) -> {
            if ((job.getStatus() == JobStatus.ACCEPTED || job.getStatus() == JobStatus.STARTED) && job.getPotentialJobOffers().stream().allMatch((sp) -> {
                return sp.getAccepted() == 1;
            })) {
                job.setStatus(JobStatus.COMPLETED);

                String token = this.jwtTokenHelper.generateTokenForReviewForm(job.getId().toString(), null);
                String clientTinyURL = UrlShortenerService.shortenUrl(this.clientURI + token);

                try {
                    //this.twilioMessageService.sendSMS(job.getProjectLeadNumber(), MessageTemplate.getMessageTemplate(job.getTitle(), job.getEndDate().toString(), job.getEndTime().toString(), job.getDescription(), clientTinyURL));
                } catch (Exception ex) {
                    LOGGER.warn("Failed to send completion SMS for job {}", job.getId(), ex);
                }

                try {
                    this.emailSendingService.sendEmail(contactEmail, "Review Form for Job: " + job.getTitle(), "Dear " + job.getClient().getFirstName() + ",\n \nHet werk is voltooid, vul alstublieft het formulier in via de volgende link: " + clientTinyURL + "\n\nDank u wel", job.getClient().getEmail());
                } catch (Exception ex) {
                    LOGGER.warn("Failed to send completion email for job {}", job.getId(), ex);
                }

                try {
                    messageService.sendMessageToSp(job);
                } catch (Exception ex) {
                    LOGGER.warn("Failed to notify service providers for completed job {}", job.getId(), ex);
                }

                if (job.getEndTime() == null) {
                    job.setEndDate(currentDate);
                    job.setEndTime(currentTime);
                }

                if (job.getStartTime() == null) {
                    job.setStartTime(currentTime);
                }

                ArchiveJob archiveJob = new ArchiveJob(job);
                this.archiveJobRepo.save(archiveJob);

                LocalDate today = LocalDate.now();

                boolean allOlder = false;

                if (job.getProject() != null) {
                    allOlder = punchesDetailsRepo.findByProjectId(job.getProject().getId())
                            .stream()
                            .allMatch(pd ->
                                    pd.getTimestamp()
                                            .atZone(ZoneId.systemDefault())
                                            .toLocalDate()
                                            .isBefore(today)
                            );
                } else {
                    LOGGER.debug("Job {} has no associated project", job.getId());
                }
                if (allOlder) {
                    sendJobExpiringEvent(job.getId());
                }

                try {
                    this.jobService.createInvoice(job.getId());
                    this.jobService.createAllPurchaseOrders(job.getId());
                } catch (Exception e) {
                    LOGGER.error("Failed to create invoices for completed job {}", job.getId(), e);
                }
            }

        });
    }

    public void sendJobExpiringEvent(Long jobId) {
        ObjectMapper mapper = new ObjectMapper();
        String message = null;
        try {
            message = mapper.writeValueAsString(jobId);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        kafkaTemplate.send("job-expire-event", message);
    }

}
