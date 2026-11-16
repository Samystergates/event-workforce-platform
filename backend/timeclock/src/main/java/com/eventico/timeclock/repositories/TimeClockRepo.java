package com.eventico.timeclock.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.eventico.timeclock.entities.TimeClock;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface TimeClockRepo extends JpaRepository<TimeClock, Long> {

    @Query("SELECT t FROM TimeClock t WHERE t.user.id = :userId ORDER BY t.updatedAt DESC LIMIT 1")
    Optional<TimeClock> findLatestByUserId(Long userId);

}
