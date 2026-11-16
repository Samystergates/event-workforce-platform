package com.eventico.form.configurations;

import org.junit.jupiter.api.Test;

import java.security.SecureRandom;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtTokenHelperTest {

    @Test
    void acceptsOnlySignedUnexpiredReviewTokens() {
        byte[] key = new byte[64];
        new SecureRandom().nextBytes(key);
        JwtTokenHelper helper = new JwtTokenHelper(Base64.getEncoder().encodeToString(key));
        String token = helper.generateTokenForReviewForm("42", "17");

        assertTrue(helper.validateTokenForReviewForm(token));
        assertFalse(helper.validateTokenForReviewForm(token + "tampered"));
    }
}
