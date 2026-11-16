package com.rentmen.app.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.rentmen.app.DTO.FormSubmissionEvent;
import com.rentmen.app.DTO.InvoiceDto;
import com.rentmen.app.configurations.JwtTokenHelper;
import com.rentmen.app.entities.Invoice;
import com.rentmen.app.entities.PunchesDetails;
import com.rentmen.app.services.JobService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;


@Component
public class PunchClockEventListener {
    private static final Logger LOGGER = LoggerFactory.getLogger(PunchClockEventListener.class);

    private final ObjectMapper eventMapper;

    @Autowired
    JobService jobService;

    @Autowired
    JwtTokenHelper jwtTokenHelper;

    public PunchClockEventListener(ObjectMapper objectMapper) {
        this.eventMapper = objectMapper.copy()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @KafkaListener(topics = "punch-details-event", groupId = "main-service-group")
    public void handlePunchDetailsEvent(String eventJson) {
        try {
            PunchesDetails event = eventMapper.readValue(eventJson, PunchesDetails.class);

            jobService.savePunchDetails(event);
            LOGGER.info("Processed punch-details event for project {} and sp {}", event.getProjectId(), event.getSpId());

        } catch (Exception e) {
            LOGGER.error("Failed to process punch-details-event message", e);
            throw new IllegalStateException("Punch event processing failed", e);
        }
    }

}
