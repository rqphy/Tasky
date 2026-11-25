package com.tasky.column.dto;

import jakarta.validation.constraints.Size;

public record UpdateColumnRequest(
    @Size(min = 1, message = "Name is required")
    @Size(max = 100, message = "Name too long")
    String name,

    String color
) {
}
