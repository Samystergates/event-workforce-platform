package com.eventico.finance.services.validations;

import lombok.Builder;
import lombok.Singular;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class ValidationResult {
    boolean valid;
    @Singular
    List<String> errors;
    @Singular
    List<String> warnings;
}