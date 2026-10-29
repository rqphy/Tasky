package com.tasky.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name too long")
    String name,

    @NotBlank(message = "Invalid email format")
    @Email(message = "Invalid email format")
    String email,

    @NotBlank(message = "Password must be at least 8 characters")
    @Size(min = 8, message = "Password must be at least 8 characters")
    String password
) {
}
