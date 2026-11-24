package com.tasky.column.dto;

import java.time.Instant;

import com.tasky.column.Column;

public record ColumnResponse(
    String id,
    String projectId,
    String name,
    String color,
    double position,
    Instant createdAt,
    Instant updatedAt
) {

    public static ColumnResponse from(Column column) {
        return new ColumnResponse(
            column.getId(),
            column.getProjectId(),
            column.getName(),
            column.getColor(),
            column.getPosition(),
            column.getCreatedAt(),
            column.getUpdatedAt()
        );
    }
}