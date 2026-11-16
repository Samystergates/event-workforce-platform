package com.eventico.timeclock.dtos;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeClockDto {
    private Long userId;
    private String action;
    private Long timestamp;
    private String pin;
}