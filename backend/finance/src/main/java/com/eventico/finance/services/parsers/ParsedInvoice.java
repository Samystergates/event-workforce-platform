package com.eventico.finance.services.parsers;

import lombok.Builder;
import lombok.Singular;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Value
@Builder(toBuilder = true)
public class ParsedInvoice {
    String invoiceNumber;
    LocalDate invoiceDate;
    String supplierName;
    String supplierAddress;
    String supplierPostalCode;
    String supplierCity;
    String supplierCountry;
    String supplierVatNumber;
    String supplierKvkNumber;
    String customerName;
    String customerAddress;
    String customerPostalCode;
    String customerCity;
    String customerCountry;
    String customerVatNumber;
    String customerReference;
    BigDecimal amountExclVat;
    BigDecimal vatAmount;
    BigDecimal amountInclVat;
    String currency;
    BigDecimal vatPercentage;
    Boolean vatReverseCharge;
    String vatSpecification;
    String supplierIban;
    String supplierBic;
    String paymentTerms;
    LocalDate dueDate;
    String paymentReference;
    String pdfTextContent;
    Double extractionConfidence;
    String extractionMethod;
    String typeDetectionMethod;
    @Singular
    List<ParsedInvoiceLine> lines;
    @Singular
    Set<String> warnings;
    String descriptionSummary;
    LocalDate servicePeriodStart;
    LocalDate servicePeriodEnd;
    String purchaseOrderNumber;
    String projectReference;
}