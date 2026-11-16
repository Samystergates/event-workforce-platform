package com.eventico.timeclock.services;

import com.eventico.timeclock.entities.User;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Date;

@Service
public class TimeclockJwtService {
    private final byte[] signingKey;
    private final String audience;

    public TimeclockJwtService(@Value("${JWT_SIGNING_SECRET}") String encodedSecret,
                               @Value("${JWT_AUDIENCE}") String audience) {
        try {
            this.signingKey = Base64.getDecoder().decode(encodedSecret);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("JWT_SIGNING_SECRET must be Base64 encoded", ex);
        }
        if (signingKey.length < 64) {
            throw new IllegalArgumentException("JWT_SIGNING_SECRET must contain at least 64 random bytes");
        }
        if (audience == null || audience.trim().isEmpty()) {
            throw new IllegalArgumentException("JWT_AUDIENCE must be configured");
        }
        this.audience = audience;
    }

    public String issuePunchToken(User user, String deviceId) {
        Date now = new Date();
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(user.getId().toString())
                .audience(audience)
                .issueTime(now)
                .expirationTime(new Date(now.getTime() + 5L * 60 * 60 * 1000))
                .claim("scope", "timeclock")
                .claim("device_id", deviceId)
                .build();
        try {
            SignedJWT token = new SignedJWT(new JWSHeader(JWSAlgorithm.HS512), claims);
            token.sign(new MACSigner(signingKey));
            return token.serialize();
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to create timeclock session", ex);
        }
    }
}
