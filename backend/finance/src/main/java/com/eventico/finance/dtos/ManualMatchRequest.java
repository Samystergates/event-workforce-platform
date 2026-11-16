package com.eventico.finance.dtos;

import jakarta.validation.constraints.NotNull;

public record ManualMatchRequest(
        @NotNull Long transactionId,
        @NotNull Long invoiceId,
        String notes) {}