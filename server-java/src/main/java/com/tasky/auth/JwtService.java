package com.tasky.auth;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

import javax.crypto.SecretKey;

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
}
