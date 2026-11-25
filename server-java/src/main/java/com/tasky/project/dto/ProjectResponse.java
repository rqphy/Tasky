package com.tasky.project.dto;

import java.time.Instant;

import com.tasky.project.Project;

public record ProjectResponse(
    String id,
    String name,
    String emoji,
    String ownerId,
    Instant createdAt,
    Instant updatedAt
) {

    public static ProjectResponse from(Project project) {
        return new ProjectResponse(
            project.getId(),
            project.getName(),
            project.getEmoji(),
            project.getOwnerId(),
            project.getCreatedAt(),
            project.getUpdatedAt()
        );
    }
}
