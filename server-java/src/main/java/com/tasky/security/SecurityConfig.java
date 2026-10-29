package com.tasky.security;

import java.io.IOException;

import tools.jackson.databind.ObjectMapper;
import com.tasky.auth.JwtService;
import com.tasky.common.error.ApiError;

import jakarta.servlet.DispatcherType;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;

@Configuration
public class SecurityConfig {

    private static final PathPatternRequestMatcher.Builder PATHS =
        PathPatternRequestMatcher.withDefaults();

    @Bean
    SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        JwtService jwtService,
        ObjectMapper objectMapper
    ) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) ->
                    writeUnauthorized(response, objectMapper)
                )
            )
            .addFilterBefore(new JwtAuthenticationFilter(jwtService), UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                .requestMatchers(PATHS.matcher(HttpMethod.GET, "/health")).permitAll()
                .requestMatchers(PATHS.matcher(HttpMethod.POST, "/auth/register")).permitAll()
                .requestMatchers(PATHS.matcher(HttpMethod.POST, "/auth/login")).permitAll()
                .requestMatchers(PATHS.matcher(HttpMethod.POST, "/auth/refresh")).permitAll()
                .requestMatchers(PATHS.matcher(HttpMethod.POST, "/auth/logout")).permitAll()
                .requestMatchers(PATHS.matcher(HttpMethod.POST, "/auth/forgot-password")).permitAll()
                .requestMatchers(PATHS.matcher(HttpMethod.POST, "/auth/reset-password")).permitAll()
                .requestMatchers(PATHS.matcher(HttpMethod.GET, "/auth/me")).authenticated()
                .anyRequest().authenticated()
            );

        return http.build();
    }

    private static void writeUnauthorized(HttpServletResponse response, ObjectMapper objectMapper) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), ApiError.of("Missing or invalid authorization header"));
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    UserDetailsService userDetailsService() {
        return username -> {
            throw new UsernameNotFoundException(username);
        };
    }
}
