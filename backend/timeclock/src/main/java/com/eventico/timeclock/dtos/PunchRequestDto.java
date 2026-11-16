package com.eventico.timeclock.dtos;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PunchRequestDto {

    private TimeClockDto timeClockDto;
    private LinkedDeviceDto linkedDeviceDto;

}
