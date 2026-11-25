package com.tasky.project.dto;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

import com.tasky.column.Column;
import com.tasky.project.Project;

public record ProjectDetailResponse(
    String id,
    String name,
    String emoji,
    String ownerId,
    Instant createdAt,
    Instant updatedAt,
    List<ProjectMemberResponse> members,
    List<ColumnResponse> columns
) {

    public static ProjectDetailResponse from(Project project) {
        List<ProjectMemberResponse> members = project.getMembers().stream()
            .map(member -> ProjectMemberResponse.from(member, member.getUser()))
            .toList();
        List<ColumnResponse> columns = project.getColumns().stream()
            .sorted(Comparator.comparingDouble(Column::getPosition))
            .map(ColumnResponse::from)
            .toList();

        return new ProjectDetailResponse(
            project.getId(),
            project.getName(),
            project.getEmoji(),
            project.getOwnerId(),
            project.getCreatedAt(),
            project.getUpdatedAt(),
            members,
            columns
        );
    }
}
