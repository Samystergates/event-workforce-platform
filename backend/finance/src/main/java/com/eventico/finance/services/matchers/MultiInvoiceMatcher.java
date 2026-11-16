package com.eventico.finance.services.matchers;


import com.eventico.finance.entities.BankTransaction;
import com.eventico.finance.entities.Invoice;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class MultiInvoiceMatcher {

    public List<Invoice> resolve(BankTransaction transaction, List<Invoice> invoices) {
        BigDecimal target = transaction.getAmount().abs();
        List<Invoice> candidates = new ArrayList<>();
        BigDecimal sum = BigDecimal.ZERO;
        for (Invoice invoice : invoices) {
            if (invoice.getAmountInclVat() == null) continue;
            if (sum.add(invoice.getAmountInclVat()).compareTo(target) <= 0) {
                candidates.add(invoice);
                sum = sum.add(invoice.getAmountInclVat());
            }
            if (sum.compareTo(target) == 0) {
                return candidates;
            }
        }
        return List.of();
    }
}