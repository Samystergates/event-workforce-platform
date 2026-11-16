package com.eventico.api_gateway.filters;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class IpRateLimitFilterTest {
    private final IpRateLimitFilter filter = new IpRateLimitFilter(mock(StringRedisTemplate.class));

    @Test
    void ignoresForwardedAddressFromUntrustedPeer() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRemoteAddr()).thenReturn("198.51.100.10");
        when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.8");

        assertEquals("198.51.100.10", ReflectionTestUtils.invokeMethod(filter, "extractIp", request));
    }

    @Test
    void usesForwardedAddressOnlyForExplicitlyTrustedProxy() {
        ReflectionTestUtils.setField(filter, "trustedProxies", "192.0.2.10");
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getRemoteAddr()).thenReturn("192.0.2.10");
        when(request.getHeader("X-Forwarded-For")).thenReturn("198.51.100.20");

        assertEquals("198.51.100.20", ReflectionTestUtils.invokeMethod(filter, "extractIp", request));
    }
}
