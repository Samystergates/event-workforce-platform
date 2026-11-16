package com.eventico.finance.dtos;

public record MatchResponse(Long matchId, double confidence, String status) {}
