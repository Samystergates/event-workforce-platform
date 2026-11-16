package com.eventico.timeclock.services;

import com.eventico.timeclock.entities.User;
import com.nimbusds.jwt.SignedJWT;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TimeclockJwtServiceTest {
    @Test
    void issuesShortLivedUserBoundTimeclockAudienceSession() throws Exception {
        byte[] key = new byte[64];
        String encodedKey = Base64.getEncoder().encodeToString(key);
        TimeclockJwtService service = new TimeclockJwtService(encodedKey, "timeclock-test");
        User user = new User();
        user.setId(42L);

        SignedJWT token = SignedJWT.parse(service.issuePunchToken(user, "device-1"));

        assertEquals("42", token.getJWTClaimsSet().getSubject());
        assertEquals("device-1", token.getJWTClaimsSet().getStringClaim("device_id"));
        assertEquals("timeclock", token.getJWTClaimsSet().getStringClaim("scope"));
        assertEquals("timeclock-test", token.getJWTClaimsSet().getAudience().get(0));
    }
}
