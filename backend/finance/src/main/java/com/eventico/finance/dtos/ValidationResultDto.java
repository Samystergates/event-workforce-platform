package com.eventico.finance.dtos;

import java.util.List;

public record ValidationResultDto(
        boolean valid,
        List<String> errors,
        List<String> warnings) {}