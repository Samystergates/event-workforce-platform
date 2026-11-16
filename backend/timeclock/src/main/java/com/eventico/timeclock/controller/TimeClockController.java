package com.eventico.timeclock.controller;

import com.eventico.timeclock.dtos.PunchRequestDto;
import com.eventico.timeclock.dtos.TimeClockDto;
import com.eventico.timeclock.services.TimeClockService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/timeclock")
public class TimeClockController {

    private final TimeClockService timeClockService;

    public TimeClockController(TimeClockService timeClockService) {
        this.timeClockService = timeClockService;
    }

    @PostMapping("/punch")
    @PreAuthorize("hasAnyAuthority('SCOPE_timeclock', 'SCOPE_admin')")
    public ResponseEntity<Map<String, Boolean>> clockEvent(@RequestBody PunchRequestDto dto) {
        boolean success = timeClockService.handleClockEvent(dto);
        return ResponseEntity.ok(Map.of("success", success));
    }

}