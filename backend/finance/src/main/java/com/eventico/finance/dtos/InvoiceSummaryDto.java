package com.eventico.finance.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

// InvoiceSummaryDto.java
public record InvoiceSummaryDto(
        Long id,
        String invoiceNumber,
        LocalDate invoiceDate,
        String supplierName,
        BigDecimal amountInclVat,
        Boolean isValid,
        Boolean isMatched,
        Double extractionConfidence,
        String extractionMethod,
        String emailFolder,
        String originalFilename,
        OffsetDateTime importedAt
) {}
