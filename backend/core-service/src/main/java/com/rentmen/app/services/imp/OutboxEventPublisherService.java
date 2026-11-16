package com.rentmen.app.services.imp;

import com.rentmen.app.entities.OutboxEvent;
import com.rentmen.app.entities.OutboxStatus;
import com.rentmen.app.repositories.OutboxEventRepo;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.data.domain.PageRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class OutboxEventPublisherService {
    private final OutboxEventRepo outboxEventRepo;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final Counter publishedCounter;
    private final Counter failedCounter;
    private final Counter dlqCounter;

    @Value("${outbox.topic:eventico.outbox.events}")
    private String outboxTopic;

    @Value("${outbox.dlq.topic:eventico.outbox.events.dlq}")
    private String outboxDlqTopic;

    @Value("${outbox.max-attempts:5}")
    private int maxAttempts;

    @Value("${outbox.base-retry-seconds:10}")
    private int baseRetrySeconds;

    public OutboxEventPublisherService(OutboxEventRepo outboxEventRepo,
                                       KafkaTemplate<String, Object> kafkaTemplate,
                                       MeterRegistry meterRegistry) {
        this.outboxEventRepo = outboxEventRepo;
        this.kafkaTemplate = kafkaTemplate;
        this.publishedCounter = meterRegistry.counter("eventico.outbox.published.count");
        this.failedCounter = meterRegistry.counter("eventico.outbox.failed.count");
        this.dlqCounter = meterRegistry.counter("eventico.outbox.dlq.count");
    }

    @Transactional
    public OutboxEvent saveEvent(String aggregateType, Long aggregateId, String eventType, String payload) {
        OutboxEvent outboxEvent = new OutboxEvent();
        outboxEvent.setAggregateType(aggregateType);
        outboxEvent.setAggregateId(aggregateId);
        outboxEvent.setEventType(eventType);
        outboxEvent.setPayload(payload);
        outboxEvent.setStatus(OutboxStatus.PENDING);
        outboxEvent.setAttempts(0);
        outboxEvent.setNextAttemptAt(LocalDateTime.now());
        return outboxEventRepo.save(outboxEvent);
    }

    @Scheduled(fixedDelayString = "${outbox.publish.fixed-delay-ms:5000}")
    @Transactional
    public void publishPendingEvents() {
        List<OutboxEvent> readyEvents = outboxEventRepo.findReadyEvents(
                Arrays.asList(OutboxStatus.PENDING, OutboxStatus.FAILED),
                LocalDateTime.now(),
                PageRequest.of(0, 50)
        );
        for (OutboxEvent event : readyEvents) {
            try {
                kafkaTemplate.send(outboxTopic, event.getAggregateType() + ":" + event.getAggregateId(), event.getPayload())
                        .get(30, TimeUnit.SECONDS);
                event.setStatus(OutboxStatus.PUBLISHED);
                event.setProcessedAt(LocalDateTime.now());
                event.setLastError(null);
                publishedCounter.increment();
            } catch (Exception ex) {
                int attempts = event.getAttempts() == null ? 0 : event.getAttempts();
                attempts++;
                event.setAttempts(attempts);
                event.setStatus(OutboxStatus.FAILED);
                event.setProcessedAt(LocalDateTime.now());
                event.setLastError(ex.getMessage());
                if (attempts >= maxAttempts) {
                    try {
                        kafkaTemplate.send(outboxDlqTopic, event.getAggregateType() + ":" + event.getAggregateId(), event.getPayload())
                                .get(30, TimeUnit.SECONDS);
                        event.setStatus(OutboxStatus.PUBLISHED);
                        dlqCounter.increment();
                    } catch (Exception dlqFailure) {
                        event.setStatus(OutboxStatus.FAILED);
                        event.setLastError(dlqFailure.getMessage());
                        event.setNextAttemptAt(LocalDateTime.now().plusSeconds((long) baseRetrySeconds * attempts));
                    }
                } else {
                    long backoffSeconds = (long) baseRetrySeconds * attempts;
                    event.setNextAttemptAt(LocalDateTime.now().plusSeconds(backoffSeconds));
                }
                failedCounter.increment();
            }
            outboxEventRepo.save(event);
        }
    }
}
