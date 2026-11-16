package com.eventico.form.configurations;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Base64;
import java.util.function.Function;

@Component
public class JwtTokenHelper {

    public static final long JWT_TOKEN_VALIDITY = 18000L;
    private final SecretKey signingKey;

    public JwtTokenHelper(@Value("${JWT_SIGNING_SECRET}") String encodedSecret) {
        byte[] keyBytes;
        try {
            keyBytes = Base64.getDecoder().decode(encodedSecret);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("JWT_SIGNING_SECRET must be valid Base64 encoding of at least 64 random bytes", e);
        }
        if (keyBytes.length < 64) {
            throw new IllegalArgumentException("JWT_SIGNING_SECRET must contain at least 64 random bytes");
        }
        this.signingKey = new SecretKeySpec(keyBytes, SignatureAlgorithm.HS512.getJcaName());
    }

    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }


    public String getSpIdFromToken(String token) {
        return getClaimFromToken(token, claims -> claims.get("spId", String.class));
    }

    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser().setSigningKey(this.signingKey).parseClaimsJws(token).getBody();
    }

    private Boolean isReviewFormToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return (Boolean) claims.get("review_form");
    }

    private Boolean isTokenExpired(String token) {
        Date expiration = getExpirationDateFromToken(token);
        return Boolean.valueOf(expiration.before(new Date()));
    }

    private String doGenerateToken(Map<String, Object> claims, String subject, long expTime) {
        return Jwts.builder().setClaims(claims).setSubject(subject).setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(expTime))
                .signWith(SignatureAlgorithm.HS512, this.signingKey).compact();
    }

    public Long getJobIdFromToken(String token) {
        return Long.parseLong(getUsernameFromToken(token));
    }

    public String generateTokenForReviewForm(String jobId, String spId) {
        Map<String, Object> claims = new HashMap<>();
        long currentTimeMillis = System.currentTimeMillis();
        long expirationTimeMillis = currentTimeMillis + 5L * 24 * 60 * 60 * 1000;
        claims.put("review_form", true);
        if (spId != null) {
            claims.put("spId", spId);
        }
        return doGenerateToken(claims, jobId, expirationTimeMillis);
    }

    public Boolean validateTokenForReviewForm(String token) {
        try {
            Claims claims = getAllClaimsFromToken(token);
            return Boolean.valueOf(Boolean.TRUE.equals(claims.get("review_form", Boolean.class))
                    && claims.getExpiration() != null
                    && claims.getExpiration().after(new Date()));
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
            return Boolean.FALSE;
        }
    }

}
