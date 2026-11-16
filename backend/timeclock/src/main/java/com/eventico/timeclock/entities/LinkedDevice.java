package com.eventico.timeclock.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "linked_device")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LinkedDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "device_id",nullable = false)
    private String deviceId;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_expired")
    private Boolean isExpired;
}
