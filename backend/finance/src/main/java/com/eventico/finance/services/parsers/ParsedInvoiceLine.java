package com.eventico.finance.services.parsers;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

@Value
@Builder(toBuilder = true)
public class ParsedInvoiceLine {
    String description;
    BigDecimal quantity;
    BigDecimal unitPrice;
    BigDecimal vatPercentage;
    BigDecimal amountExclVat;
    BigDecimal vatAmount;
    BigDecimal amountInclVat;
}