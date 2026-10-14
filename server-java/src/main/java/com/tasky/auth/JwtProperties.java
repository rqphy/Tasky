package com.tasky.auth;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "tasky.jwt")
public record JwtProperties(
    String accessTokenSecret,
    Duration accessTokenExpiry,
    Duration refreshTokenExpiry
) {
}
