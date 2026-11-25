package com.tasky.project.dto;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

import com.tasky.column.Column;
import com.tasky.task.Task;

public record ColumnResponse(
    String id,
    String projectId,
    String name,
    String color,
    double position,
    Instant createdAt,
    Instant updatedAt,
    List<TaskResponse> tasks
) {

    public static ColumnResponse from(Column column) {
        List<TaskResponse> tasks = column.getTasks().stream()
            .sorted(Comparator.comparingDouble(Task::getPosition))
            .map(TaskResponse::from)
            .toList();

        return new ColumnResponse(
            column.getId(),
            column.getProjectId(),
            column.getName(),
            column.getColor(),
            column.getPosition(),
            column.getCreatedAt(),
            column.getUpdatedAt(),
            tasks
        );
    }
}
