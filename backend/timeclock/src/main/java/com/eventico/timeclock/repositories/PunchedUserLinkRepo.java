package com.eventico.timeclock.repositories;

import com.eventico.timeclock.entities.PunchedUserLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PunchedUserLinkRepo extends JpaRepository<PunchedUserLink, Long> {

    Optional<PunchedUserLink> findByPunchIdAndLinkId(Long punchId, Long linkId);
}
