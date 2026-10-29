package com.tasky.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
    @NotBlank(message = "Invalid or expired reset link")
    @Size(min = 1, message = "Invalid or expired reset link")
    String token,

    @NotBlank(message = "Password must be at least 8 characters")
    @Size(min = 8, message = "Password must be at least 8 characters")
    String newPassword
) {
}
