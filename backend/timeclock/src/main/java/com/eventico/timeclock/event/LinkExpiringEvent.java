package com.eventico.timeclock.event;

import com.eventico.timeclock.services.LinkingDeviceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class LinkExpiringEvent {

    private static final Logger logger = LoggerFactory.getLogger(LinkExpiringEvent.class);

    private final ObjectMapper objectMapper;

    private final LinkingDeviceService linkingDeviceService;

    public LinkExpiringEvent(ObjectMapper objectMapper, LinkingDeviceService linkingDeviceService) {
        this.objectMapper = objectMapper;
        this.linkingDeviceService = linkingDeviceService;
    }

    @KafkaListener(topics = "job-expire-event", groupId = "main-service-group")
    public void handleExpireJobEvent(String eventJson) {
        try {

            Long event = objectMapper.readValue(eventJson, Long.class);

            logger.info("RECEIVED JOB EXPIRING EVENT");

            linkingDeviceService.updatedExpiredJobDeviceLink(null, event);

        } catch (Exception e) {
            logger.error("Failed to process job-expiring event", e);
            throw new IllegalStateException("Job-expiring event processing failed", e);
        }
    }

}
