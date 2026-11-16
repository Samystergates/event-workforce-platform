package com.eventico.finance.dtos;

import jakarta.validation.constraints.NotBlank;

public record EmailFetchRequest(
        @NotBlank String emailAddress,
        Integer daysBack,
        String folderPath) {}