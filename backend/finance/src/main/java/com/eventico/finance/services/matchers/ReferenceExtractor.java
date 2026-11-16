package com.eventico.finance.services.matchers;


import com.eventico.finance.entities.BankTransaction;
import com.eventico.finance.entities.Invoice;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ReferenceExtractor {

    private static final Pattern REFERENCE_PATTERN = Pattern.compile("(\\d{3,}[-/]\\d{1,}|[A-Z]{2,}\\d{2,})");

    public boolean hasMatchingReference(BankTransaction transaction, Invoice invoice) {
        String invoiceNumber = invoice.getInvoiceNumber();
        if (StringUtils.isBlank(invoiceNumber)) {
            return false;
        }
        return contains(transaction.getRemittanceInfo(), invoiceNumber)
                || contains(transaction.getDescription(), invoiceNumber)
                || contains(transaction.getEndToEndId(), invoiceNumber)
                || detectedStructuredReference(transaction.getRemittanceInfo(), invoiceNumber);
    }

    private boolean contains(String haystack, String needle) {
        if (StringUtils.isBlank(haystack) || StringUtils.isBlank(needle)) {
            return false;
        }
        return haystack.toLowerCase().contains(needle.toLowerCase());
    }

    private boolean detectedStructuredReference(String remittance, String invoiceNumber) {
        if (StringUtils.isBlank(remittance)) {
            return false;
        }
        Matcher matcher = REFERENCE_PATTERN.matcher(remittance);
        while (matcher.find()) {
            if (matcher.group().replaceAll("[^A-Za-z0-9]", "").contains(invoiceNumber.replaceAll("[^A-Za-z0-9]", ""))) {
                return true;
            }
        }
        return false;
    }
}