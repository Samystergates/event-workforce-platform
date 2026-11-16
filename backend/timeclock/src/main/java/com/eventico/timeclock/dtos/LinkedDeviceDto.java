package com.eventico.timeclock.dtos;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LinkedDeviceDto {

    private Long id;

    private Long projectId;

    private String deviceId;

    private LocalDateTime updatedAt;

    private Boolean isExpired;

}
