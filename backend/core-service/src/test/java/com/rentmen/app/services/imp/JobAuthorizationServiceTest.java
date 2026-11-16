package com.rentmen.app.services.imp;

import com.rentmen.app.entities.Client;
import com.rentmen.app.entities.Job;
import com.rentmen.app.entities.User;
import com.rentmen.app.repositories.InvoiceRepo;
import com.rentmen.app.repositories.JobRepo;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JobAuthorizationServiceTest {
    private final JobRepo jobRepo = mock(JobRepo.class);
    private final JobAuthorizationService authorization =
            new JobAuthorizationService(jobRepo, mock(InvoiceRepo.class));

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void permitsTheAuthenticatedClientAndDeniesARequestForAnotherClientsJob() {
        User principal = new User();
        principal.setId(5L);
        principal.setDepId(1);
        principal.setRoles(Collections.emptySet());
        Client owner = new Client();
        owner.setId(5L);
        Job ownJob = new Job();
        ownJob.setClient(owner);
        Job foreignJob = new Job();
        Client foreignOwner = new Client();
        foreignOwner.setId(6L);
        foreignJob.setClient(foreignOwner);
        when(jobRepo.findById(10L)).thenReturn(Optional.of(ownJob));
        when(jobRepo.findById(11L)).thenReturn(Optional.of(foreignJob));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));

        assertDoesNotThrow(() -> authorization.assertCanManageJob(10L));
        assertThrows(AccessDeniedException.class, () -> authorization.assertCanManageJob(11L));
    }
}
