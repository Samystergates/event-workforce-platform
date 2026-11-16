package com.eventico.finance.controllers;

import com.eventico.finance.dtos.ManualMatchRequest;
import com.eventico.finance.dtos.MatchRecordDto;
import com.eventico.finance.dtos.MatchResponse;
import com.eventico.finance.dtos.MatchingSummaryDto;
import com.eventico.finance.services.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/v1/matching")
@RequiredArgsConstructor
@Validated
public class MatchingController {

    private final MatchingService matchingService;

    @PostMapping("/auto")
    public ResponseEntity<MatchingSummaryDto> autoMatch() {
        return ResponseEntity.ok(matchingService.runAutoMatching());
    }

    @PostMapping("/manual")
    public ResponseEntity<MatchResponse> manualMatch(@RequestBody ManualMatchRequest request) {
        var match = matchingService.createManualMatch(request, "user");
        return ResponseEntity.ok(
                new MatchResponse(match.getId(), match.getConfidenceScore(), match.getMatchStatus().name())
        );
    }

    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<List<MatchRecordDto>> listMatchesForInvoice(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(matchingService.listMatchesForInvoice(invoiceId));
    }

    @PutMapping("/{matchId}/confirm")
    public ResponseEntity<MatchRecordDto> confirmMatch(@PathVariable Long matchId) {
        return ResponseEntity.ok(matchingService.confirmMatch(matchId));
    }

    @PutMapping("/{matchId}/reject")
    public ResponseEntity<MatchRecordDto> rejectMatch(@PathVariable Long matchId) {
        return ResponseEntity.ok(matchingService.rejectMatch(matchId));
    }

    @DeleteMapping("/{matchId}")
    public ResponseEntity<Void> deleteMatch(@PathVariable Long matchId) {
        matchingService.deleteMatch(matchId);
        return ResponseEntity.noContent().build();
    }
}
