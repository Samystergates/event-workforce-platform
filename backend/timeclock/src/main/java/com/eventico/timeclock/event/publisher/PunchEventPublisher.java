package com.eventico.timeclock.event.publisher;

import com.eventico.timeclock.dtos.LinkedDeviceDto;
import com.eventico.timeclock.dtos.PunchEventDetailsDto;
import com.eventico.timeclock.entities.TimeClock;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class PunchEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public PunchEventPublisher(KafkaTemplate<String, Object> kafkaTemplate){
        this.kafkaTemplate = kafkaTemplate;
    }

    @Async("taskExecutor")
    public void sendPunchEvent(TimeClock data, LinkedDeviceDto ldto) {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        PunchEventDetailsDto punchDetailsDto = new PunchEventDetailsDto(ldto.getProjectId(),
                data.getUser().getSpId(), data.getAction(), data.getTimestamp());
        String message = null;
        try {
            message = mapper.writeValueAsString(punchDetailsDto);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        kafkaTemplate.send("punch-details-event", message);
    }

}
