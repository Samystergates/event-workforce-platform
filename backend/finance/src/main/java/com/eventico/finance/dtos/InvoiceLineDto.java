package com.eventico.finance.dtos;

import java.math.BigDecimal;

public record InvoiceLineDto(
        Long id,
        String description,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal vatPercentage,
        BigDecimal amountExclVat,
        BigDecimal vatAmount,
        BigDecimal amountInclVat
) {}