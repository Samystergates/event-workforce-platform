package com.eventico.timeclock.services;

import com.eventico.timeclock.dtos.LinkedDeviceDto;

public interface LinkingDeviceService {

    LinkedDeviceDto getCurrentLink(String deviceId);

    Boolean verifyAdmin();

    LinkedDeviceDto linkProjectAndDevice(LinkedDeviceDto linkedDeviceDto);

    void updatedExpiredJobDeviceLink(String deviceId, Long jobId);

}
