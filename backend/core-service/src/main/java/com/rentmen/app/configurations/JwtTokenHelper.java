package com.rentmen.app.configurations;

import com.rentmen.app.entities.Invoice;
import com.rentmen.app.exceptions.ResourceNotFoundException;
import com.rentmen.app.repositories.InvoiceRepo;
import com.rentmen.app.repositories.JobRepo;
import com.rentmen.app.repositories.UserRepo;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.*;
import java.util.function.Function;
import java.util.Base64;

@Component
public class JwtTokenHelper {
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private JobRepo jobRepo;
    public static final long JWT_TOKEN_VALIDITY = 100L * 365 * 24 * 60 * 60;
    private final SecretKey signingKey;
    private final String audience;

    public JwtTokenHelper(@Value("${JWT_SIGNING_SECRET}") String encodedSecret,
                          @Value("${JWT_AUDIENCE}") String audience) {
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
        if (audience == null || audience.trim().isEmpty()) {
            throw new IllegalArgumentException("JWT_AUDIENCE must be configured");
        }
        this.audience = audience;
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

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        List<String> authorities = userDetails.getAuthorities().stream()
                .map(Object::toString)
                .collect(java.util.stream.Collectors.toList());
        boolean admin = authorities.contains("ROLE_ADMIN") || authorities.contains("ADMIN");
        boolean finance = admin || authorities.contains("ROLE_FINANCE") || authorities.contains("FINANCE");
        if (admin) {
            claims.put("scope", "admin finance");
        } else if (finance) {
            claims.put("scope", "finance");
        }
        claims.put("authorities", authorities);
        long expTime = System.currentTimeMillis() + 18000000L;
        return doGenerateToken(claims, getEmailFromUserDetails(userDetails), expTime);
    }

    private String doGenerateToken(Map<String, Object> claims, String subject, long expTime) {
        return Jwts.builder().setClaims(claims).setAudience(audience).setSubject(subject).setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(expTime))
                .signWith(SignatureAlgorithm.HS512, this.signingKey).compact();
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        String username = getUsernameFromToken(token);
        try {
            return Boolean.valueOf(username.equals(getEmailFromUserDetails(userDetails))
                    && !isTokenExpired(token)
                    && audience.equals(getAllClaimsFromToken(token).getAudience()));
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
            return Boolean.FALSE;
        }
    }

    private String getEmailFromUserDetails(UserDetails userDetails) {
        return this.userRepo.findByFirstName(userDetails.getUsername()).orElseThrow(() -> new ResourceNotFoundException("User", "name", userDetails.getUsername())).getEmail();
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
            return Boolean.valueOf(audience.equals(claims.getAudience())
                    && this.jobRepo.existsById(Long.parseLong(claims.getSubject()))
                    && claims.getExpiration() != null
                    && claims.getExpiration().after(new Date())
                    && Boolean.TRUE.equals(claims.get("review_form", Boolean.class)));
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
            return Boolean.FALSE;
        }
    }

    public String generateJobOfferAcceptanceToken(Long jobId, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("purpose", "job_offer_acceptance");
        claims.put("jobId", jobId.toString());
        claims.put("userId", userId.toString());
        return doGenerateToken(claims, "job-offer-acceptance",
                System.currentTimeMillis() + 3L * 24 * 60 * 60 * 1000);
    }

    public Boolean validateJobOfferAcceptanceToken(String token) {
        try {
            Claims claims = getAllClaimsFromToken(token);
            return Boolean.valueOf("job_offer_acceptance".equals(claims.get("purpose", String.class))
                    && audience.equals(claims.getAudience())
                    && claims.get("jobId", String.class) != null
                    && claims.get("userId", String.class) != null
                    && claims.getExpiration() != null
                    && claims.getExpiration().after(new Date()));
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
            return Boolean.FALSE;
        }
    }

    public Long getJobIdFromJobOfferAcceptanceToken(String token) {
        return Long.valueOf(getClaimFromToken(token, claims -> claims.get("jobId", String.class)));
    }

    public Long getUserIdFromJobOfferAcceptanceToken(String token) {
        return Long.valueOf(getClaimFromToken(token, claims -> claims.get("userId", String.class)));
    }
}
