package com.tasky.column.dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;

public record ReorderColumnsRequest(
    @NotEmpty(message = "Column IDs are required")
    List<String> columnIds
) {
}