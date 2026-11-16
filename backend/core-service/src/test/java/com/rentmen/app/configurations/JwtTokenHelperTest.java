package com.rentmen.app.configurations;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.Test;

import java.security.SecureRandom;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtTokenHelperTest {

    @Test
    void deactivatedAccountsAreNotEnabled() {
        com.rentmen.app.entities.User user = new com.rentmen.app.entities.User();
        user.setActive(false);
        assertFalse(user.isEnabled());
    }

    @Test
    void jobOfferAcceptanceTokenIsSignedBoundToIdsAndExpires() {
        byte[] key = new byte[64];
        new SecureRandom().nextBytes(key);
        String encodedKey = Base64.getEncoder().encodeToString(key);
        JwtTokenHelper helper = new JwtTokenHelper(encodedKey, "eventico-test");

        String token = helper.generateJobOfferAcceptanceToken(42L, 17L);
        Claims claims = Jwts.parser().setSigningKey(key).parseClaimsJws(token).getBody();

        assertTrue(helper.validateJobOfferAcceptanceToken(token));
        assertEquals("eventico-test", claims.getAudience());
        assertEquals(42L, helper.getJobIdFromJobOfferAcceptanceToken(token));
        assertEquals(17L, helper.getUserIdFromJobOfferAcceptanceToken(token));
        assertFalse(helper.validateJobOfferAcceptanceToken(token + "tampered"));
    }
}
