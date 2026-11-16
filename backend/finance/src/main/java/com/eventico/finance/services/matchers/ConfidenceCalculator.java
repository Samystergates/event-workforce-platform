package com.eventico.finance.services.matchers;


import com.eventico.finance.configurations.AppProperties;
import com.eventico.finance.entities.BankTransaction;
import com.eventico.finance.entities.Invoice;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;

@Component
@RequiredArgsConstructor
public class ConfidenceCalculator {

    private final AppProperties properties;
    private final ReferenceExtractor referenceExtractor;
    private final CompanyNameNormalizer nameNormalizer;

    public double calculate(BankTransaction transaction, Invoice invoice) {
        AppProperties.MatchingProperties weights = properties.getMatching();

        double amountScore = scoreAmount(transaction.getAmount(), invoice.getAmountInclVat());
        double ibanScore = scoreIban(transaction, invoice);
        double dateScore = scoreDate(transaction, invoice);
        double nameScore = nameNormalizer.score(transaction.getCreditorName(), invoice.getSupplierName());
        double referenceScore = referenceExtractor.hasMatchingReference(transaction, invoice) ? 100.0 : 0.0;

        double weighted = amountScore * weights.getWeightAmount()
                + ibanScore * weights.getWeightIban()
                + dateScore * weights.getWeightDate()
                + nameScore * weights.getWeightName()
                + referenceScore * weights.getWeightReference();

        return weighted / (weights.getWeightAmount() + weights.getWeightIban()
                + weights.getWeightDate() + weights.getWeightName()
                + weights.getWeightReference());
    }

    private double scoreAmount(BigDecimal transactionAmount, BigDecimal invoiceAmount) {
        if (transactionAmount == null || invoiceAmount == null || invoiceAmount.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        BigDecimal diff = transactionAmount.subtract(invoiceAmount).abs();
        BigDecimal tolerance = invoiceAmount.multiply(new BigDecimal("0.001"));
        if (diff.compareTo(tolerance) <= 0) {
            return 100.0;
        } else if (diff.compareTo(invoiceAmount.multiply(new BigDecimal("0.01"))) <= 0) {
            return 80.0;
        } else if (diff.compareTo(invoiceAmount.multiply(new BigDecimal("0.05"))) <= 0) {
            return 40.0;
        }
        return 0.0;
    }

    private double scoreIban(BankTransaction transaction, Invoice invoice) {
        if (transaction.getCreditorIban() == null || invoice.getSupplierIban() == null) {
            return 30.0;
        }
        if (transaction.getCreditorIban().replace(" ", "").equalsIgnoreCase(invoice.getSupplierIban().replace(" ", ""))) {
            return 100.0;
        }
        if (transaction.getCreditorIban().substring(0, 4).equalsIgnoreCase(invoice.getSupplierIban().substring(0, 4))) {
            return 60.0;
        }
        return 0.0;
    }

    private double scoreDate(BankTransaction transaction, Invoice invoice) {
        if (transaction.getBookingDate() == null || invoice.getInvoiceDate() == null) {
            return 30.0;
        }
        long days = Math.abs(ChronoUnit.DAYS.between(transaction.getBookingDate(), invoice.getInvoiceDate()));
        if (days == 0) {
            return 100.0;
        } else if (days <= 3) {
            return 80.0;
        } else if (days <= 14) {
            return 60.0;
        } else if (days <= 30) {
            return 40.0;
        }
        return 10.0;
    }
}