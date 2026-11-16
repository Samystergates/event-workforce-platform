package com.eventico.finance.configurations;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;

import java.util.Base64;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtValidationConfigTest {
    @Test
    void acceptsOnlyTokensWithTheConfiguredAudience() throws Exception {
        byte[] key = new byte[64];
        String encodedKey = Base64.getEncoder().encodeToString(key);
        JwtDecoder decoder = new JwtValidationConfig().jwtDecoder(encodedKey, "finance-api");

        assertEquals("finance-api", decoder.decode(token(key, "finance-api")).getAudience().get(0));
        assertThrows(JwtException.class, () -> decoder.decode(token(key, "other-api")));
    }

    private String token(byte[] key, String audience) throws Exception {
        Date now = new Date();
        SignedJWT jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS512),
                new JWTClaimsSet.Builder()
                        .subject("user-1")
                        .audience(audience)
                        .issueTime(now)
                        .expirationTime(new Date(now.getTime() + 60_000))
                        .claim("scope", "finance")
                        .build());
        jwt.sign(new MACSigner(key));
        return jwt.serialize();
    }
}
