package com.tasky.auth.dto;

import com.tasky.user.UserResponse;

public record LoginResponse(
    UserResponse user,
    String accessToken,
    String refreshToken
) {
}
