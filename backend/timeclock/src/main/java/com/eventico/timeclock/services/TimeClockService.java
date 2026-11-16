package com.eventico.timeclock.services;

import com.eventico.timeclock.dtos.PunchRequestDto;
import com.eventico.timeclock.dtos.TimeClockDto;

public interface TimeClockService {
    boolean handleClockEvent(PunchRequestDto dto);
}
