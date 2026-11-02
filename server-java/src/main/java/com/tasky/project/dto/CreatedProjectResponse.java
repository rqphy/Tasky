package com.tasky.project.dto;

import java.time.Instant;
import java.util.List;

import com.tasky.member.ProjectMember;
import com.tasky.project.Project;
import com.tasky.user.User;

public record CreatedProjectResponse(
    String id,
    String name,
    String emoji,
    String ownerId,
    Instant createdAt,
    Instant updatedAt,
    List<ProjectMemberResponse> members,
    List<Object> columns
) {

    public static CreatedProjectResponse from(Project project, ProjectMember member, User user) {
        return new CreatedProjectResponse(
            project.getId(),
            project.getName(),
            project.getEmoji(),
            project.getOwnerId(),
            project.getCreatedAt(),
            project.getUpdatedAt(),
            List.of(ProjectMemberResponse.from(member, user)),
            List.of()
        );
    }
}
