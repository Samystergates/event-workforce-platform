package com.eventico.finance.dtos;


import com.eventico.finance.entities.BankTransaction;
import com.eventico.finance.entities.Invoice;
import com.eventico.finance.entities.InvoiceLine;
import com.eventico.finance.entities.MatchRecord;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public final class FinanceDtoMapper {

    private FinanceDtoMapper() {
    }

    public static InvoiceSummaryDto toInvoiceSummaryDto(Invoice invoice) {
        return new InvoiceSummaryDto(
                invoice.getId(),
                invoice.getInvoiceNumber(),
                invoice.getInvoiceDate(),
                invoice.getSupplierName(),
                invoice.getAmountInclVat(),
                invoice.getIsValid(),
                invoice.getIsMatched(),
                invoice.getExtractionConfidence(),
                invoice.getExtractionMethod(),
                invoice.getEmailFolder(),
                invoice.getOriginalFilename(),
                invoice.getImportedAt()
        );
    }

    public static InvoiceDetailDto toInvoiceDetailDto(Invoice invoice) {
        List<InvoiceLineDto> lineDtos = invoice.getInvoiceLines() == null
                ? Collections.emptyList()
                : invoice.getInvoiceLines().stream()
                .map(FinanceDtoMapper::toInvoiceLineDto)
                .collect(Collectors.toList());

        List<MatchRecordDto> matchDtos = invoice.getMatches() == null
                ? Collections.emptyList()
                : invoice.getMatches().stream()
                .map(FinanceDtoMapper::toMatchRecordDto)
                .collect(Collectors.toList());

        return new InvoiceDetailDto(
                invoice.getId(),
                invoice.getInvoiceNumber(),
                invoice.getInvoiceDate(),
                invoice.getSupplierName(),
                invoice.getSupplierAddress(),
                invoice.getSupplierPostalCode(),
                invoice.getSupplierCity(),
                invoice.getSupplierCountry(),
                invoice.getSupplierVatNumber(),
                invoice.getSupplierKvkNumber(),
                invoice.getCustomerName(),
                invoice.getCustomerAddress(),
                invoice.getCustomerPostalCode(),
                invoice.getCustomerCity(),
                invoice.getCustomerCountry(),
                invoice.getCustomerVatNumber(),
                invoice.getAmountExclVat(),
                invoice.getVatAmount(),
                invoice.getAmountInclVat(),
                invoice.getCurrency(),
                invoice.getVatPercentage(),
                invoice.getVatReverseCharge(),
                invoice.getVatSpecification(),
                invoice.getSupplierIban(),
                invoice.getSupplierBic(),
                invoice.getPaymentTerms(),
                invoice.getDueDate(),
                invoice.getPaymentReference(),
                invoice.getDescriptionSummary(),
                invoice.getServicePeriodStart(),
                invoice.getServicePeriodEnd(),
                invoice.getPurchaseOrderNumber(),
                invoice.getProjectReference(),
                invoice.getPdfFilePath(),
                invoice.getEmailMessageId(),
                invoice.getEmailFolder(),
                invoice.getEmailSender(),
                invoice.getOriginalFilename(),
                invoice.getExtractionConfidence(),
                invoice.getExtractionMethod(),
                invoice.getTypeDetectionMethod(),
                invoice.getExtractionWarnings(),
                invoice.getValidationErrors(),
                invoice.getMissingRequiredFields(),
                invoice.getIsValid(),
                invoice.getIsMatched(),
                invoice.getIsPaid(),
                invoice.getImportedAt(),
                invoice.getCreatedAt(),
                invoice.getUpdatedAt(),
                lineDtos,
                matchDtos
        );
    }

    public static InvoiceLineDto toInvoiceLineDto(InvoiceLine line) {
        return new InvoiceLineDto(
                line.getId(),
                line.getDescription(),
                line.getQuantity(),
                line.getUnitPrice(),
                line.getVatPercentage(),
                line.getAmountExclVat(),
                line.getVatAmount(),
                line.getAmountInclVat()
        );
    }

    public static MatchRecordDto toMatchRecordDto(MatchRecord match) {
        BankTransaction transaction = match.getTransaction();
        Invoice invoice = match.getInvoice();

        return new MatchRecordDto(
                match.getId(),
                invoice != null ? invoice.getId() : null,
                invoice != null ? invoice.getInvoiceNumber() : null,
                invoice != null ? invoice.getInvoiceDate() : null,
                invoice != null ? invoice.getAmountInclVat() : null,
                transaction != null ? transaction.getId() : null,
                transaction != null ? transaction.getTransactionId() : null,
                transaction != null ? transaction.getBookingDate() : null,
                transaction != null ? transaction.getAmount() : null,
                match.getMatchStatus() != null ? match.getMatchStatus().name() : null,
                match.getMatchType() != null ? match.getMatchType().name() : null,
                match.getConfidenceScore(),
                match.getMatchedOnAmount(),
                match.getMatchedOnIban(),
                match.getMatchedOnReference(),
                match.getMatchedOnDateRange(),
                match.getMatchedAmount(),
                match.getPartialPayment(),
                match.getPaymentGroupId(),
                match.getConfirmedByUser(),
                match.getConfirmedAt(),
                match.getNotes(),
                match.getCreatedAt(),
                match.getUpdatedAt()
        );
    }

    public static BankTransactionDto toBankTransactionDto(BankTransaction transaction) {
        Objects.requireNonNull(transaction, "transaction");
        return new BankTransactionDto(
                transaction.getId(),
                transaction.getTransactionId(),
                transaction.getBookingDate(),
                transaction.getValueDate(),
                transaction.getAmount(),
                transaction.getCurrency(),
                transaction.getDebtorName(),
                transaction.getDebtorIban(),
                transaction.getCreditorName(),
                transaction.getCreditorIban(),
                transaction.getDescription(),
                transaction.getRemittanceInfo(),
                transaction.getEndToEndId(),
                transaction.getMandateId(),
                transaction.getCamtFileName(),
                transaction.getImportedAt(),
                transaction.getIsMatched(),
                transaction.getMatchConfidence()
        );
    }
}