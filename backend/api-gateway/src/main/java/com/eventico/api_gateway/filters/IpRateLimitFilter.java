package com.eventico.api_gateway.filters;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.Arrays;
import java.util.concurrent.TimeUnit;

@Component
public class IpRateLimitFilter extends OncePerRequestFilter {
    private static final Logger LOGGER = LoggerFactory.getLogger(IpRateLimitFilter.class);

    private static final String[] BYPASS_PATH_PREFIXES = {
            "/actuator",
            "/swagger-ui",
            "/v3/api-docs"
    };

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public IpRateLimitFilter(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Value("${gateway.rate-limit.enabled:false}")
    private boolean enabled;

    @Value("${gateway.rate-limit.requests-per-minute:600}")
    private int requestsPerMinute;

    @Value("${gateway.rate-limit.trusted-proxies:}")
    private String trustedProxies;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (!enabled || isBypassPath(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = extractIp(request);
        long minuteBucket = Instant.now().getEpochSecond() / 60;
        String key = "gateway:ratelimit:" + ip + ":" + minuteBucket;
        Long requestCount;
        try {
            requestCount = redisTemplate.opsForValue().increment(key);
            if (requestCount != null && requestCount == 1L) {
                redisTemplate.expire(key, 90, TimeUnit.SECONDS);
            }
        } catch (Exception ex) {
            LOGGER.warn("Redis rate-limit failed, allowing request. cause={}", ex.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        if (requestCount != null && requestCount > requestsPerMinute) {
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            Map<String, Object> body = Map.of(
                    "timestamp", Instant.now().toString(),
                    "status", 429,
                    "error", "Too Many Requests",
                    "message", "Rate limit exceeded",
                    "path", request.getRequestURI()
            );
            response.getWriter().write(objectMapper.writeValueAsString(body));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isBypassPath(String path) {
        for (String prefix : BYPASS_PATH_PREFIXES) {
            if (path.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    }

    private String extractIp(HttpServletRequest request) {
        String remoteAddress = request.getRemoteAddr();
        boolean trustedPeer = Arrays.stream((trustedProxies == null ? "" : trustedProxies).split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .anyMatch(remoteAddress::equals);
        if (!trustedPeer) {
            return remoteAddress;
        }

        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            String[] chain = forwarded.split(",");
            String clientAddress = chain[chain.length - 1].trim();
            if (!clientAddress.isEmpty()) {
                return clientAddress;
            }
        }
        return remoteAddress;
    }
}
