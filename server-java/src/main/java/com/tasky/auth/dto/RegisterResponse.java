package com.tasky.auth.dto;

import com.tasky.user.UserResponse;

public record RegisterResponse(
    UserResponse user,
    String accessToken,
    String refreshToken
) {
}
