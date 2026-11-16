package com.eventico.timeclock.repositories;

import com.eventico.timeclock.entities.LinkedDevice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LinkedDeviceRepo extends JpaRepository<LinkedDevice, Long> {

    Optional<LinkedDevice> findByDeviceIdAndIsExpired(String deviceId, Boolean isExpired);

    List<LinkedDevice> findByProjectIdAndIsExpiredFalse(Long projectId);

    List<LinkedDevice> findByDeviceIdAndProjectIdNotAndIsExpiredFalse(String deviceId, Long projectId);

    Optional<LinkedDevice> findByDeviceIdAndProjectIdAndIsExpired (String deviceId, Long projectId, Boolean isExpired);
}
