package com.tasky.column.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateColumnRequest(
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name too long")
    String name,

    String color
) {
}