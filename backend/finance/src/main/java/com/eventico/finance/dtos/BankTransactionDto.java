package com.eventico.finance.dtos;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record BankTransactionDto(
        Long id,
        String transactionId,
        LocalDate bookingDate,
        LocalDate valueDate,
        BigDecimal amount,
        String currency,
        String debtorName,
        String debtorIban,
        String creditorName,
        String creditorIban,
        String description,
        String remittanceInfo,
        String endToEndId,
        String mandateId,
        String camtFileName,
        OffsetDateTime importedAt,
        Boolean isMatched,
        Double matchConfidence
) {
}