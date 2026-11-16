package com.eventico.finance.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record MatchRecordDto(
        Long id,
        Long invoiceId,
        String invoiceNumber,
        LocalDate invoiceDate,
        BigDecimal invoiceAmount,
        Long transactionId,
        String transactionReference,
        LocalDate transactionBookingDate,
        BigDecimal transactionAmount,
        String matchStatus,
        String matchType,
        Double confidenceScore,
        Boolean matchedOnAmount,
        Boolean matchedOnIban,
        Boolean matchedOnReference,
        Boolean matchedOnDateRange,
        BigDecimal matchedAmount,
        Boolean partialPayment,
        String paymentGroupId,
        String confirmedByUser,
        OffsetDateTime confirmedAt,
        String notes,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
