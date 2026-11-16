package com.rentmen.app.services.imp;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TwilioMessageService {
    private static final Logger LOGGER = LoggerFactory.getLogger(TwilioMessageService.class);

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.phone-number}")
    private String fromPhoneNumber;

    @Value("${twilio.alert-recipient:}")
    private String alertRecipient;

    @Value("${twilio.enabled:false}")
    private boolean enabled;

    public String sendSMS(String to, String message) {
        if (to == null || to.isBlank()) {
            throw new IllegalArgumentException("SMS recipient is required");
        }
        sendingSms(to, message);
        if (!alertRecipient.isBlank()) {
            sendingSms(alertRecipient, message);
        }

        return "Message sent successfully";
    }

    public void sendProjectInfoSMS(Long projectId, String name) {
        if (!enabled || alertRecipient.isBlank()) {
            LOGGER.info("Skipping project info SMS for project {} because Twilio is disabled or no alert recipient is configured", projectId);
            return;
        }
        sendingSms(alertRecipient, "ProjectID For " + name + " - " + "TimeClock Config: " + projectId);
        LOGGER.info("Sent project info SMS for project {} and name {}", projectId, name);
    }

    private void sendingSms(String to, String message) {
        if (!enabled) {
            throw new IllegalStateException("Twilio SMS delivery is disabled; set TWILIO_ENABLED=true to enable it.");
        }
        if (accountSid.isBlank() || authToken.isBlank() || fromPhoneNumber.isBlank()) {
            throw new IllegalStateException("Twilio account credentials and sender number must be configured.");
        }
        Twilio.init(accountSid, authToken);
        Message.creator(new PhoneNumber(to), new PhoneNumber(fromPhoneNumber), message).create();
    }
}
