package com.tasky.auth;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

import javax.crypto.SecretKey;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtProperties properties;
    private final SecretKey accessTokenKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        this.accessTokenKey = Keys.hmacShaKeyFor(
            properties.accessTokenSecret().getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateAccessToken(String userId) {
        Instant now = Instant.now();
        return Jwts.builder()
            .claim("userId", userId)
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plus(properties.accessTokenExpiry())))
            .signWith(accessTokenKey)
            .compact();
    }

    public Optional<String> parseUserId(String token) {
        try {
            String userId = Jwts.parser()
                .verifyWith(accessTokenKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("userId", String.class);

            if (userId == null || userId.isBlank()) {
                return Optional.empty();
            }

            return Optional.of(userId);
        } catch (JwtException | IllegalArgumentException exception) {
            return Optional.empty();
        }
    }
}
