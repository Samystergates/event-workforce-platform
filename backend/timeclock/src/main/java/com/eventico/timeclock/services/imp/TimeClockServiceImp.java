package com.eventico.timeclock.services.imp;

import com.eventico.timeclock.dtos.LinkedDeviceDto;
import com.eventico.timeclock.dtos.PunchEventDetailsDto;
import com.eventico.timeclock.dtos.PunchRequestDto;
import com.eventico.timeclock.dtos.TimeClockDto;
import com.eventico.timeclock.entities.PunchedUserLink;
import com.eventico.timeclock.entities.TimeClock;
import com.eventico.timeclock.entities.User;
import com.eventico.timeclock.event.publisher.PunchEventPublisher;
import com.eventico.timeclock.repositories.PunchedUserLinkRepo;
import com.eventico.timeclock.repositories.LinkedDeviceRepo;
import com.eventico.timeclock.repositories.TimeClockRepo;
import com.eventico.timeclock.repositories.UserRepository;
import com.eventico.timeclock.services.TimeClockService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.transaction.Transactional;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class TimeClockServiceImp implements TimeClockService {

    private final UserRepository userRepository;
    private final TimeClockRepo timeClockRepository;
    private final PunchedUserLinkRepo punchedUserLinkRepo;
    private final PunchEventPublisher punchEventPublisher;
    private final LinkedDeviceRepo linkedDeviceRepo;

    public TimeClockServiceImp(UserRepository userRepository,
                               TimeClockRepo timeClockRepository,
                               PunchedUserLinkRepo punchedUserLinkRepo,
                               PunchEventPublisher punchEventPublisher,
                               LinkedDeviceRepo linkedDeviceRepo) {
        this.userRepository = userRepository;
        this.timeClockRepository = timeClockRepository;
        this.punchedUserLinkRepo = punchedUserLinkRepo;
        this.punchEventPublisher = punchEventPublisher;
        this.linkedDeviceRepo = linkedDeviceRepo;
    }

    @Override
    @Transactional
    public boolean handleClockEvent(PunchRequestDto prd) {

        TimeClockDto dto = prd.getTimeClockDto();
        LinkedDeviceDto ldto = prd.getLinkedDeviceDto();

        Optional<User> userOpt = userRepository.findById(dto.getUserId());
        if (userOpt.isEmpty() || ldto == null || ldto.getId() == null) return false;

        User user = userOpt.get();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !user.getId().toString().equals(authentication.getName())) {
            return false;
        }
        boolean validLink = linkedDeviceRepo.findById(ldto.getId())
                .filter(link -> !Boolean.TRUE.equals(link.getIsExpired())
                        && link.getProjectId().equals(ldto.getProjectId())
                        && link.getDeviceId().equals(ldto.getDeviceId()))
                .isPresent();
        if (!validLink) return false;

        if (!("CLOCK_IN".equals(dto.getAction()) || "CLOCK_OUT".equals(dto.getAction()))) {
            return false;
        }

        Optional<TimeClock> latestOpt = timeClockRepository.findLatestByUserId(user.getId());

        if (latestOpt.isPresent()) {

            TimeClock lastEvent = latestOpt.get();
            String lastAction = lastEvent.getAction();

            Optional<PunchedUserLink> currentLinkValidity = punchedUserLinkRepo.findByPunchIdAndLinkId(lastEvent.getId(), ldto.getId());

            if (currentLinkValidity.isPresent() && ("CLOCK_IN".equals(lastAction) && "CLOCK_IN".equals(dto.getAction()))) {
                return true;
            }

            if (currentLinkValidity.isPresent() && ("CLOCK_OUT".equals(lastAction) && "CLOCK_OUT".equals(dto.getAction()))) {
                return true;
            }
        } else {
            if ("CLOCK_OUT".equals(dto.getAction())) {
                throw new RuntimeException("Not clocked in.");
            }
        }

        TimeClock event = TimeClock.builder()
                .user(user)
                .action(dto.getAction())
                .timestamp(Instant.ofEpochMilli(dto.getTimestamp()))
                .updatedAt(LocalDateTime.now())
                .build();

        TimeClock timeClock = timeClockRepository.save(event);

        PunchedUserLink punchedUserLink = new PunchedUserLink(null, timeClock.getId(), ldto.getId());
        punchedUserLinkRepo.save(punchedUserLink);
        punchEventPublisher.sendPunchEvent(event,ldto);
        return true;
    }

}
