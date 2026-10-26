package com.tasky.auth.dto;

public record RefreshResponse(String accessToken, String refreshToken) {
}
