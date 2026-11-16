package com.eventico.finance.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InvoiceUpdateRequest(
        Boolean isValid,
        Boolean isMatched,
        Boolean isPaid,
        String supplierName,
        String supplierAddress,
        String supplierPostalCode,
        String supplierCity,
        String supplierCountry,
        String supplierVatNumber,
        String supplierKvkNumber,
        String customerName,
        String customerAddress,
        String customerPostalCode,
        String customerCity,
        String customerCountry,
        String customerVatNumber,
        BigDecimal amountExclVat,
        BigDecimal vatAmount,
        BigDecimal amountInclVat,
        String currency,
        BigDecimal vatPercentage,
        Boolean vatReverseCharge,
        String vatSpecification,
        String supplierIban,
        String supplierBic,
        String paymentTerms,
        LocalDate dueDate,
        String paymentReference,
        String descriptionSummary,
        LocalDate servicePeriodStart,
        LocalDate servicePeriodEnd,
        String purchaseOrderNumber,
        String projectReference,
        Double extractionConfidence,
        String extractionMethod,
        String typeDetectionMethod,
        String extractionWarnings,
        String validationErrors,
        String missingRequiredFields
) {
}
