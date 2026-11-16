package com.eventico.finance.services;

import com.eventico.finance.dtos.ManualMatchRequest;
import com.eventico.finance.dtos.MatchRecordDto;
import com.eventico.finance.dtos.MatchingSummaryDto;
import com.eventico.finance.entities.MatchRecord;

import java.util.List;

public interface MatchingService {
    MatchingSummaryDto runAutoMatching();

    MatchRecord createManualMatch(ManualMatchRequest request, String user);

    List<MatchRecordDto> listMatchesForInvoice(Long invoiceId);

    MatchRecordDto confirmMatch(Long matchId);

    MatchRecordDto rejectMatch(Long matchId);

    void deleteMatch(Long matchId);
}
