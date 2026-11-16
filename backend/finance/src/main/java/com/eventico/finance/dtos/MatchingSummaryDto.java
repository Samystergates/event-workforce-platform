package com.eventico.finance.dtos;

public record MatchingSummaryDto(
        int confirmedMatches,
        int suggestedMatches,
        int multiInvoiceMatches,
        int errors) {}