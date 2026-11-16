package com.eventico.finance.dtos;

import java.util.List;

public record InvoiceUploadResponse(
        Long invoiceId,
        boolean valid,
        List<String> errors,
        List<String> warnings,
        double extractionConfidence) {}