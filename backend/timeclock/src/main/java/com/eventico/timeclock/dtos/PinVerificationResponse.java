package com.eventico.timeclock.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PinVerificationResponse {
    private boolean success;
    private UserDto user;
    private String accessToken;
}
