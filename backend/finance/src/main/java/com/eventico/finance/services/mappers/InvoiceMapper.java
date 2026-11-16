package com.eventico.finance.services.mappers;

import com.eventico.finance.entities.Invoice;
import com.eventico.finance.entities.InvoiceLine;
import com.eventico.finance.services.parsers.ParsedInvoice;
import com.eventico.finance.services.parsers.ParsedInvoiceLine;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;

@Component
public class InvoiceMapper {

    public Invoice toEntity(ParsedInvoice parsed, String filePath, byte[] fileBytes, String originalFilename) {
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(parsed.getInvoiceNumber());
        invoice.setInvoiceDate(parsed.getInvoiceDate());
        String supplierName = StringUtils.defaultIfBlank(parsed.getSupplierName(), "Onbekend");
        invoice.setSupplierName(supplierName);
        invoice.setSupplierAddress(parsed.getSupplierAddress());
        invoice.setSupplierPostalCode(parsed.getSupplierPostalCode());
        invoice.setSupplierCity(parsed.getSupplierCity());
        invoice.setSupplierCountry(parsed.getSupplierCountry());
        invoice.setSupplierVatNumber(parsed.getSupplierVatNumber());
        invoice.setSupplierKvkNumber(parsed.getSupplierKvkNumber());
        invoice.setCustomerName(parsed.getCustomerName());
        invoice.setCustomerAddress(parsed.getCustomerAddress());
        invoice.setCustomerPostalCode(parsed.getCustomerPostalCode());
        invoice.setCustomerCity(parsed.getCustomerCity());
        invoice.setCustomerCountry(parsed.getCustomerCountry());
        invoice.setCustomerVatNumber(parsed.getCustomerVatNumber());
        invoice.setCustomerReference(parsed.getCustomerReference());
        invoice.setAmountExclVat(safe(parsed.getAmountExclVat()));
        invoice.setVatAmount(safe(parsed.getVatAmount()));
        invoice.setAmountInclVat(safe(parsed.getAmountInclVat()));
        invoice.setCurrency(parsed.getCurrency());
        invoice.setVatPercentage(parsed.getVatPercentage());
        invoice.setVatReverseCharge(parsed.getVatReverseCharge());
        invoice.setVatSpecification(parsed.getVatSpecification());
        invoice.setSupplierIban(parsed.getSupplierIban());
        invoice.setSupplierBic(parsed.getSupplierBic());
        invoice.setPaymentTerms(parsed.getPaymentTerms());
        invoice.setDueDate(parsed.getDueDate());
        invoice.setPaymentReference(parsed.getPaymentReference());
        invoice.setPdfFilePath(filePath);
        invoice.setPdfFileHash(calculateHash(fileBytes));
        invoice.setPdfTextContent(parsed.getPdfTextContent());
        invoice.setExtractionConfidence(parsed.getExtractionConfidence());
        invoice.setExtractionMethod(parsed.getExtractionMethod());
        invoice.setDescriptionSummary(parsed.getDescriptionSummary());
        invoice.setServicePeriodStart(parsed.getServicePeriodStart());
        invoice.setServicePeriodEnd(parsed.getServicePeriodEnd());
        invoice.setPurchaseOrderNumber(parsed.getPurchaseOrderNumber());
        invoice.setProjectReference(parsed.getProjectReference());
        invoice.setTypeDetectionMethod(parsed.getTypeDetectionMethod());
        invoice.setExtractionWarnings(
                parsed.getWarnings() == null || parsed.getWarnings().isEmpty()
                        ? null
                        : String.join(" | ", parsed.getWarnings()));
        invoice.setOriginalFilename(originalFilename);

        for (ParsedInvoiceLine line : parsed.getLines()) {
            InvoiceLine entityLine = new InvoiceLine();
            entityLine.setDescription(line.getDescription());
            entityLine.setQuantity(line.getQuantity());
            entityLine.setUnitPrice(line.getUnitPrice());
            entityLine.setVatPercentage(line.getVatPercentage());
            entityLine.setAmountExclVat(line.getAmountExclVat());
            entityLine.setVatAmount(line.getVatAmount());
            entityLine.setAmountInclVat(line.getAmountInclVat());
            invoice.addLine(entityLine);
        }
        invoice.setMissingRequiredFields(collectMissingFields(parsed));
        return invoice;
    }

    private BigDecimal safe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private String calculateHash(byte[] bytes) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(bytes));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 missing", e);
        }
    }

    private String collectMissingFields(ParsedInvoice parsed) {
        List<String> missing = new ArrayList<>();

        // core invoice metadata
        if (StringUtils.isBlank(parsed.getInvoiceNumber())) missing.add("invoice_number");
        if (parsed.getInvoiceDate() == null) missing.add("invoice_date");
        if (parsed.getDueDate() == null) missing.add("due_date");

        // supplier NAW + identifiers
        if (StringUtils.isBlank(parsed.getSupplierName())) missing.add("supplier_name");
        if (StringUtils.isBlank(parsed.getSupplierAddress())) missing.add("supplier_address");
        if (StringUtils.isBlank(parsed.getSupplierPostalCode())) missing.add("supplier_postal_code");
        if (StringUtils.isBlank(parsed.getSupplierCity())) missing.add("supplier_city");
        if (StringUtils.isBlank(parsed.getSupplierVatNumber())) missing.add("supplier_vat_number");
        if (StringUtils.isBlank(parsed.getSupplierKvkNumber())) missing.add("supplier_kvk_number");
        if (StringUtils.isBlank(parsed.getSupplierIban())) missing.add("supplier_iban");

        // customer NAW (needed for multi-entity dashboards)
        if (StringUtils.isBlank(parsed.getCustomerName())) missing.add("customer_name");
        if (StringUtils.isBlank(parsed.getCustomerAddress())) missing.add("customer_address");
        if (StringUtils.isBlank(parsed.getCustomerPostalCode())) missing.add("customer_postal_code");
        if (StringUtils.isBlank(parsed.getCustomerCity())) missing.add("customer_city");

        // monetary totals
        if (parsed.getAmountExclVat() == null) missing.add("amount_excl_vat");
        if (parsed.getVatAmount() == null) missing.add("vat_amount");
        if (parsed.getAmountInclVat() == null) missing.add("amount_incl_vat");

        // at least one line description (needed for drilldowns)
        boolean missingLineDescription = parsed.getLines() != null
                && parsed.getLines().stream().anyMatch(line -> StringUtils.isBlank(line.getDescription()));
        if (missingLineDescription) missing.add("invoice_line_description");

        return missing.isEmpty() ? null : String.join(",", missing);
    }


}
