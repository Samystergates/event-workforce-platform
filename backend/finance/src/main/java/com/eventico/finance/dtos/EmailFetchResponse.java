package com.eventico.finance.dtos;

import java.util.List;

public record EmailFetchResponse(
        int attachmentsFound,
        int attachmentsProcessed,
        List<String> failures) {}