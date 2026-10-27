package com.tasky.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
    @NotBlank(message = "Invalid email format")
    @Email(message = "Invalid email format")
    String email
) {
}
