package com.tasky.project.dto;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tasky.task.Task;
import com.tasky.user.User;

public record TaskResponse(
    String id,
    String columnId,
    String title,
    String description,
    String assigneeId,
    String label,
    String priority,
    double position,
    Instant createdAt,
    Instant updatedAt,
    ProjectMemberResponse.PublicUser assignee,
    @JsonProperty("_count") CommentCount commentCount
) {

    public static TaskResponse from(Task task) {
        User assignee = task.getAssignee();
        return new TaskResponse(
            task.getId(),
            task.getColumnId(),
            task.getTitle(),
            task.getDescription(),
            task.getAssigneeId(),
            task.getLabel() == null ? null : task.getLabel().name(),
            task.getPriority().name(),
            task.getPosition(),
            task.getCreatedAt(),
            task.getUpdatedAt(),
            assignee == null ? null : ProjectMemberResponse.PublicUser.from(assignee),
            new CommentCount(task.getComments().size())
        );
    }

    public record CommentCount(int comments) {
    }
}
