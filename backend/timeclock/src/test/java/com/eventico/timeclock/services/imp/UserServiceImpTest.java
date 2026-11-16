package com.eventico.timeclock.services.imp;

import com.eventico.timeclock.dtos.PinVerificationResponse;
import com.eventico.timeclock.entities.User;
import com.eventico.timeclock.repositories.UserRepository;
import com.eventico.timeclock.services.TimeclockJwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.Base64;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class UserServiceImpTest {
    @Test
    void pinVerificationReturnsSessionWithoutSerializingPin() throws Exception {
        UserRepository repository = mock(UserRepository.class);
        User user = new User();
        user.setId(7L);
        user.setName("Demo User");
        user.setSpId(70L);
        user.setPin("1234");
        when(repository.findByPin("1234")).thenReturn(Optional.of(user));
        TimeclockJwtService jwtService = new TimeclockJwtService(
                Base64.getEncoder().encodeToString(new byte[64]), "timeclock-test");

        PinVerificationResponse response = new UserServiceImp(repository, jwtService).verify("1234", "device-1");
        String json = new ObjectMapper().writeValueAsString(response);

        assertTrue(response.isSuccess());
        assertTrue(response.getAccessToken() != null && !response.getAccessToken().isEmpty());
        assertFalse(json.contains("\"pin\""));
        assertFalse(json.contains("1234"));
    }
}
