package com.tasky.project.dto;

public record ProjectResponse(
    String id,
    String name,
    String emoji,
    String ownerId,
    String createdAt,
    String updatedAt
) {
}