package com.eventico.finance.services.validations;

import com.eventico.finance.services.parsers.ParsedInvoice;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.regex.Pattern;

@Service
public class InvoiceValidatorService {

    private static final Pattern VAT_PATTERN = Pattern.compile("^NL\\d{9}B\\d{2}$");
    private static final Pattern KVK_PATTERN = Pattern.compile("^\\d{8}$");
    private static final Pattern IBAN_PATTERN = Pattern.compile("^[A-Z]{2}\\d{2}[A-Z0-9]{4}\\d{10}$");

    public ValidationResult validate(ParsedInvoice invoice) {
        ValidationResult.ValidationResultBuilder builder = ValidationResult.builder().valid(true);

        if (StringUtils.isBlank(invoice.getInvoiceNumber())) {
            builder.valid(false).error("Factuurnummer ontbreekt");
        } else if (invoice.getInvoiceNumber().length() < 3) {
            builder.warning("Factuurnummer lijkt te kort");
        }

        LocalDate invoiceDate = invoice.getInvoiceDate();
        if (invoiceDate == null) {
            builder.valid(false).error("Factuurdatum ontbreekt");
        } else if (invoiceDate.isAfter(LocalDate.now())) {
            builder.warning("Factuurdatum ligt in de toekomst");
        }

        if (StringUtils.isBlank(invoice.getSupplierName())) {
            builder.valid(false).error("Naam leverancier ontbreekt");
        }
        if (StringUtils.isBlank(invoice.getSupplierAddress())) {
            builder.valid(false).error("Adres leverancier ontbreekt");
        }
        if (StringUtils.isBlank(invoice.getSupplierPostalCode())) {
            builder.valid(false).error("Postcode leverancier ontbreekt");
        }
        if (StringUtils.isBlank(invoice.getSupplierCity())) {
            builder.valid(false).error("Plaats leverancier ontbreekt");
        }

        if (invoice.getAmountExclVat() == null || invoice.getVatAmount() == null || invoice.getAmountInclVat() == null) {
            builder.valid(false).error("Bedragen ontbreken");
        } else {
            BigDecimal computed = invoice.getAmountExclVat().add(invoice.getVatAmount());
            if (invoice.getAmountInclVat().subtract(computed).abs().compareTo(new BigDecimal("0.02")) > 0) {
                builder.valid(false).error("Totaalbedrag komt niet overeen met subtotalen");
            }
        }

        if (StringUtils.isNotBlank(invoice.getSupplierVatNumber())
                && !VAT_PATTERN.matcher(invoice.getSupplierVatNumber().replace(" ", "").toUpperCase()).matches()) {
            builder.valid(false).error("BTW-nummer leverancier ongeldig");
        }

        if (StringUtils.isNotBlank(invoice.getSupplierKvkNumber())
                && !KVK_PATTERN.matcher(invoice.getSupplierKvkNumber()).matches()) {
            builder.valid(false).error("KvK-nummer leverancier ongeldig");
        }

        if (StringUtils.isNotBlank(invoice.getSupplierIban())
                && !IBAN_PATTERN.matcher(invoice.getSupplierIban().replace(" ", "")).matches()) {
            builder.valid(false).error("IBAN ongeldig formaat");
        }

        if (!invoice.getLines().isEmpty()) {
            invoice.getLines().forEach(line -> {
                if (StringUtils.isBlank(line.getDescription())) {
                    builder.valid(false).error("Omschrijving ontbreekt op factuurregel");
                }
            });
        }

        return builder.build();
    }
}