package com.eventico.finance.dtos;

public record BankImportResponse(
        String fileName,
        int transactionsParsed,
        int transactionsSaved,
        int duplicatesSkipped) {}