package com.eventico.timeclock.services.imp;

import com.eventico.timeclock.dtos.LinkedDeviceDto;
import com.eventico.timeclock.entities.LinkedDevice;
import com.eventico.timeclock.repositories.LinkedDeviceRepo;
import com.eventico.timeclock.services.LinkingDeviceService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

@Service
public class LinkingDeviceServiceImp implements LinkingDeviceService {

    @Autowired
    LinkedDeviceRepo linkedDeviceRepo;

    @Override
    @PreAuthorize("hasAuthority('SCOPE_admin')")
    public Boolean verifyAdmin() {
        return true;
    }

    @PreAuthorize("hasAnyAuthority('SCOPE_admin', 'SCOPE_timeclock')")
    public LinkedDeviceDto getCurrentLink(String DeviceId) {
        if (SecurityContextHolder.getContext().getAuthentication() instanceof JwtAuthenticationToken) {
            JwtAuthenticationToken authentication = (JwtAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            String tokenDeviceId = authentication.getToken().getClaimAsString("device_id");
            if (!authentication.getAuthorities().stream().anyMatch(a -> "SCOPE_admin".equals(a.getAuthority()))
                    && !DeviceId.equals(tokenDeviceId)) {
                throw new org.springframework.security.access.AccessDeniedException("Device link is not available to this session");
            }
        }
        LinkedDevice linkedDevice = linkedDeviceRepo.findByDeviceIdAndIsExpired(DeviceId, false)
                .orElseThrow(() -> new RuntimeException("No Link Found"));
        return LinkedDeviceDto.builder().deviceId(linkedDevice.getDeviceId()).projectId(linkedDevice.getProjectId())
                .id(linkedDevice.getId()).updatedAt(linkedDevice.getUpdatedAt()).isExpired(linkedDevice.getIsExpired()).build();
    }

    @Transactional
    @Override
    @PreAuthorize("hasAuthority('SCOPE_admin')")
    public LinkedDeviceDto linkProjectAndDevice(LinkedDeviceDto linkedDeviceDto) {
        Optional<LinkedDevice> savedLinked = linkedDeviceRepo.findByDeviceIdAndProjectIdAndIsExpired(linkedDeviceDto.getDeviceId(),
                linkedDeviceDto.getProjectId(), false);

        List<LinkedDevice> otherDeviceLinks = linkedDeviceRepo.findByDeviceIdAndProjectIdNotAndIsExpiredFalse(
                linkedDeviceDto.getDeviceId(),
                linkedDeviceDto.getProjectId());

        if (otherDeviceLinks != null && !otherDeviceLinks.isEmpty()) {
            otherDeviceLinks.forEach(link -> {
                link.setIsExpired(true);
                link.setUpdatedAt(LocalDateTime.now());
                linkedDeviceRepo.save(link);
            });
        }

        if (savedLinked.isPresent()) {
            LinkedDevice currLink = savedLinked.get();
            currLink.setUpdatedAt(LocalDateTime.now());
            LinkedDevice newLink = linkedDeviceRepo.save(currLink);
            return LinkedDeviceDto.builder().deviceId(newLink.getDeviceId()).projectId(newLink.getProjectId())
                    .id(newLink.getId()).updatedAt(newLink.getUpdatedAt()).build();
        } else {
            LinkedDevice linkedDevice = new LinkedDevice(null, linkedDeviceDto.getProjectId(),
                    linkedDeviceDto.getDeviceId(), LocalDateTime.now(), false);
            LinkedDevice newLink = linkedDeviceRepo.save(linkedDevice);
            return LinkedDeviceDto.builder().deviceId(newLink.getDeviceId()).projectId(newLink.getProjectId())
                    .id(newLink.getId()).updatedAt(newLink.getUpdatedAt()).isExpired(newLink.getIsExpired()).build();
        }
    }

    @Transactional
    @Override
    public void updatedExpiredJobDeviceLink(String devideId, Long jobId) {
        List<LinkedDevice> linkedDevices = linkedDeviceRepo.findByProjectIdAndIsExpiredFalse(jobId);
        if (linkedDevices != null && !linkedDevices.isEmpty()) {
            linkedDevices.forEach(link -> {
                link.setIsExpired(true);
                link.setUpdatedAt(LocalDateTime.now());
                linkedDeviceRepo.save(link);
            });
        }
    }


}
