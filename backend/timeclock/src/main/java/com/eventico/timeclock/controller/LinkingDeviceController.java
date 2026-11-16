package com.eventico.timeclock.controller;

import com.eventico.timeclock.dtos.LinkedDeviceDto;
import com.eventico.timeclock.services.LinkingDeviceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin-config")
public class LinkingDeviceController {

    private final LinkingDeviceService linkingDeviceService;

    public LinkingDeviceController(LinkingDeviceService linkingDeviceService) {
        this.linkingDeviceService = linkingDeviceService;
    }

    @GetMapping({"/validate"})
    public ResponseEntity<Boolean> verifyAdmin() {
        return ResponseEntity.ok(linkingDeviceService.verifyAdmin());
    }

    @GetMapping({"/get"})
    public ResponseEntity<LinkedDeviceDto> getCurrentLink(@RequestParam String deviceId) {
        return ResponseEntity.ok(linkingDeviceService.getCurrentLink(deviceId));
    }

    @PostMapping("/link")
    public ResponseEntity<LinkedDeviceDto> save(@RequestBody LinkedDeviceDto dto) {
        LinkedDeviceDto linkedDeviceDto = linkingDeviceService.linkProjectAndDevice(dto);
        return ResponseEntity.ok(linkedDeviceDto);
    }
}
