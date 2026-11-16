package com.eventico.timeclock.controller;

import com.eventico.timeclock.dtos.UserDto;
import com.eventico.timeclock.dtos.PinVerificationResponse;
import com.eventico.timeclock.services.UserService;
import lombok.Getter;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/list")
    public ResponseEntity<List<UserDto>> getUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/verify")
    public ResponseEntity<PinVerificationResponse> verifyPin(@RequestBody PinRequest request) {
        return ResponseEntity.ok(userService.verify(request.getPin(), request.getDeviceId()));
    }

    @Getter
    public static class PinRequest {
        private String pin;
        private String deviceId;

        public String getDeviceId() {
            return deviceId;
        }
    }
}
