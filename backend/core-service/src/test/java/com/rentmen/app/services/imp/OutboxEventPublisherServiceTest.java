package com.rentmen.app.services.imp;

import com.rentmen.app.entities.OutboxEvent;
import com.rentmen.app.entities.OutboxStatus;
import com.rentmen.app.repositories.OutboxEventRepo;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.util.concurrent.SettableListenableFuture;

import java.util.Collections;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OutboxEventPublisherServiceTest {
    @Test
    void eventIsNotMarkedPublishedUntilKafkaAcknowledgesIt() throws Exception {
        OutboxEventRepo repository = mock(OutboxEventRepo.class);
        @SuppressWarnings("unchecked")
        KafkaTemplate<String, Object> kafkaTemplate = mock(KafkaTemplate.class);
        OutboxEvent event = new OutboxEvent();
        event.setAggregateType("JOB");
        event.setAggregateId(1L);
        event.setEventType("JOB_UPDATED");
        event.setPayload("{}");
        event.setStatus(OutboxStatus.PENDING);
        when(repository.findReadyEvents(anyList(), any(), any(PageRequest.class)))
                .thenReturn(Collections.singletonList(event));
        SettableListenableFuture<SendResult<String, Object>> brokerAck = new SettableListenableFuture<>();
        when(kafkaTemplate.send(eq("events"), eq("JOB:1"), eq("{}"))).thenReturn(brokerAck);
        when(repository.save(any(OutboxEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OutboxEventPublisherService publisher =
                new OutboxEventPublisherService(repository, kafkaTemplate, new SimpleMeterRegistry());
        ReflectionTestUtils.setField(publisher, "outboxTopic", "events");
        Thread publishingThread = new Thread(publisher::publishPendingEvents);

        publishingThread.start();
        try {
            verify(kafkaTemplate, timeout(1000)).send(eq("events"), eq("JOB:1"), eq("{}"));
            assertEquals(OutboxStatus.PENDING, event.getStatus());
            brokerAck.set(null);
            publishingThread.join(TimeUnit.SECONDS.toMillis(2));
            assertFalse(publishingThread.isAlive());
            assertEquals(OutboxStatus.PUBLISHED, event.getStatus());
        } finally {
            if (!brokerAck.isDone()) {
                brokerAck.set(null);
            }
            publishingThread.join(TimeUnit.SECONDS.toMillis(2));
        }
    }
}
