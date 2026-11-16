package com.eventico.timeclock.services;

import com.eventico.timeclock.dtos.UserDto;
import com.eventico.timeclock.dtos.PinVerificationResponse;
import com.eventico.timeclock.entities.User;

import java.util.List;

public interface UserService {

    List<UserDto> getAllUsers();

    PinVerificationResponse verify(String pin, String deviceId);

    void createUser(User user);

}
