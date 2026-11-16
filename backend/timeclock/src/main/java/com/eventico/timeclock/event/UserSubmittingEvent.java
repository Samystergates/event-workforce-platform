package com.eventico.timeclock.event;

import com.eventico.timeclock.entities.User;
import com.eventico.timeclock.services.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;


@Component
public class UserSubmittingEvent {

    private static final Logger logger = LoggerFactory.getLogger(UserSubmittingEvent.class);

    private final ObjectMapper objectMapper;

    private final UserService userService;

    public UserSubmittingEvent(ObjectMapper objectMapper, UserService userService) {
        this.objectMapper = objectMapper;
        this.userService = userService;
    }

    @KafkaListener(topics = "user-events", groupId = "main-service-group")
    public void handleUserSubmittedEvent(String eventJson) {
        try {

            User event = objectMapper.readValue(eventJson, User.class);

            logger.info("RECEIVED USER EVENT");

            userService.createUser(event);

        } catch (Exception e) {
            logger.error("Failed to process user event", e);
            throw new IllegalStateException("User event processing failed", e);
        }
    }

}
