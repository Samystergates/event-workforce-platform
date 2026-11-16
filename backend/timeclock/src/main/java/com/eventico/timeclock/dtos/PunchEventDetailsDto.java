package com.eventico.timeclock.dtos;

import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PunchEventDetailsDto {

    private Long projectId;
    private Long spId;
    private String action;
    private Instant timestamp;

}
