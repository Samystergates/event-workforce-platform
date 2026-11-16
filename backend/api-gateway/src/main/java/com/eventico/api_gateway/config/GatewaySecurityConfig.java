package com.eventico.api_gateway.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class GatewaySecurityConfig {

    @Bean
    @ConditionalOnProperty(name = "security.jwt.enabled", havingValue = "true")
    public SecurityFilterChain jwtSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers(
                                "/api/v1/auth/login",
                                "/api/v1/auth/register",
                                "/api/users/verify",
                                "/api/v1/users/verify",
                                "/api/form/validate/**",
                                "/api/form/review-form/service-provider",
                                "/api/v1/form/validate/**",
                                "/api/v1/form/review-form/service-provider",
                                "/api/job/review-form/client/**",
                                "/api/job/review-form/service-provider",
                                "/api/job/review-form/service-provider-is-filled/**",
                                "/api/job/review-form/service-provider-is-overridden/**",
                                "/api/job/acceptJobOfferFromEmail").permitAll()
                        .requestMatchers("/api/admin-config/validate", "/api/admin-config/link",
                                "/api/v1/admin-config/validate", "/api/v1/admin-config/link")
                        .hasAuthority("SCOPE_admin")
                        .requestMatchers("/api/admin-config/get", "/api/v1/admin-config/get")
                        .hasAnyAuthority("SCOPE_admin", "SCOPE_timeclock")
                        .requestMatchers("/api/users/list", "/api/v1/users/list")
                        .hasAuthority("SCOPE_admin")
                        .requestMatchers("/api/v1/invoices/**", "/api/v1/matching/**", "/api/v1/bank/**")
                        .hasAnyAuthority("SCOPE_finance", "SCOPE_admin")
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> {}));
        return http.build();
    }

    @Bean
    @ConditionalOnProperty(name = "security.jwt.enabled", havingValue = "false")
    public SecurityFilterChain openSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}
