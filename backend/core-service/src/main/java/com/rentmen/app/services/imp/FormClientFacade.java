package com.rentmen.app.services.imp;

import com.rentmen.app.client.FormClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class FormClientFacade {
    private final FormClient formClient;

    public FormClientFacade(FormClient formClient) {
        this.formClient = formClient;
    }

    @Retry(name = "formClient")
    @CircuitBreaker(name = "formClient", fallbackMethod = "fallbackGetFilePaths")
    public List<String> getFilePaths(Long jobId, Long serviceProviderId) {
        return formClient.getFilePaths(jobId, serviceProviderId);
    }

    private List<String> fallbackGetFilePaths(Long jobId, Long serviceProviderId, Throwable throwable) {
        return Collections.emptyList();
    }
}
