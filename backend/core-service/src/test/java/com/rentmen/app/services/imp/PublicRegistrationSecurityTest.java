package com.rentmen.app.services.imp;

import com.rentmen.app.DTO.UserDto;
import com.rentmen.app.entities.Client;
import com.rentmen.app.entities.Role;
import com.rentmen.app.exceptions.CustomException;
import com.rentmen.app.repositories.ClientRepo;
import com.rentmen.app.repositories.RoleRepo;
import com.rentmen.app.services.UserService;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.mock;

class PublicRegistrationSecurityTest {
    @Test
    void publicRegistrationUsesOnlyTheDefaultRoleAndRejectsModeratorCreation() {
        UserServiceImp service = new UserServiceImp();
        ClientRepo clientRepo = mock(ClientRepo.class);
        RoleRepo roleRepo = mock(RoleRepo.class);
        Role defaultRole = new Role();
        defaultRole.setId(2);
        defaultRole.setName("ROLE_USER");
        when(roleRepo.findById(2)).thenReturn(Optional.of(defaultRole));
        when(clientRepo.save(any(Client.class))).thenAnswer(invocation -> invocation.getArgument(0));
        ReflectionTestUtils.setField(service, "clientRepo", clientRepo);
        ReflectionTestUtils.setField(service, "roleRepo", roleRepo);
        ReflectionTestUtils.setField(service, "modelMapper", new ModelMapper());
        ReflectionTestUtils.setField(service, "passwordEncoder", new BCryptPasswordEncoder());

        UserDto clientRegistration = new UserDto();
        clientRegistration.setId(7);
        clientRegistration.setEmail("client@example.test");
        clientRegistration.setPassword("example-password");
        clientRegistration.setDepId(1);
        service.registerNewUser(clientRegistration);

        org.mockito.ArgumentCaptor<Client> savedClient = org.mockito.ArgumentCaptor.forClass(Client.class);
        verify(clientRepo).save(savedClient.capture());
        assertTrue(savedClient.getValue().getAuthorities().stream()
                .anyMatch(authority -> "ROLE_USER".equals(authority.getAuthority())));
        verify(roleRepo, never()).findById(1);

        UserDto moderatorRegistration = new UserDto();
        moderatorRegistration.setEmail("moderator@example.test");
        moderatorRegistration.setPassword("example-password");
        moderatorRegistration.setDepId(2);
        assertThrows(CustomException.class, () -> service.registerNewUser(moderatorRegistration));
    }
}
