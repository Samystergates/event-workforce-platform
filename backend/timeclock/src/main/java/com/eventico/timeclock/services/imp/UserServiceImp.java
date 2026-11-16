package com.eventico.timeclock.services.imp;

import com.eventico.timeclock.dtos.UserDto;
import com.eventico.timeclock.dtos.PinVerificationResponse;
import com.eventico.timeclock.entities.User;
import com.eventico.timeclock.repositories.UserRepository;
import com.eventico.timeclock.services.UserService;
import com.eventico.timeclock.services.TimeclockJwtService;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserServiceImp implements UserService {

    private final UserRepository userRepository;
    private final TimeclockJwtService jwtService;

    public UserServiceImp(UserRepository userRepository, TimeclockJwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @Override
    public List<UserDto> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(u -> new UserDto(u.getId(), u.getName(), u.getSpId()))
                .collect(Collectors.toList());
    }

    @Override
    public PinVerificationResponse verify(String pin, String deviceId) {
        if (pin == null || deviceId == null || deviceId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PIN and device ID are required");
        }
        Optional<User> user = userRepository.findByPin(pin);
        User verified = user.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid PIN"));
        return new PinVerificationResponse(true,
                new UserDto(verified.getId(), verified.getName(), verified.getSpId()),
                jwtService.issuePunchToken(verified, deviceId));
    }

    @Override
    public void createUser(User user) {
        userRepository.save(user);
    }
}
