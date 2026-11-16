package com.eventico.form.event;

import com.eventico.form.entities.Form;
import com.eventico.form.services.FormService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class InvoiceSubmittedEventListener {

    @Autowired
    FormService formService;

    @KafkaListener(topics = "invoice-events", groupId = "main-service-group")
    public void handleFormSubmittedEvent(String eventString) {
        String[] array = eventString.split(",");
        Long jobId = Long.parseLong(array[0]);
        Long serviceProviderId = Long.parseLong(array[1]);

        if(!formService.validateFilledReviewFormByValues(jobId,serviceProviderId)){
            Form form = new Form();
            form.setJobId(jobId);
            form.setServiceProviderId(serviceProviderId);
            formService.saveNewForm(form);
        }

    }
}
