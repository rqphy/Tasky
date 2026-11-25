package com.tasky.project.dto;

import java.time.Instant;

import com.tasky.member.ProjectMember;
import com.tasky.user.User;

public record ProjectMemberResponse(
    String id,
    String userId,
    String projectId,
    String role,
    Instant createdAt,
    PublicUser user
) {

    public static ProjectMemberResponse from(ProjectMember member, User user) {
        return new ProjectMemberResponse(
            member.getId(),
            member.getUserId(),
            member.getProjectId(),
            member.getRole().name(),
            member.getCreatedAt(),
            PublicUser.from(user)
        );
    }

    public record PublicUser(
        String id,
        String name,
        String email,
        String imageUrl,
        String bio,
        String jobTitle,
        String company
    ) {

        public static PublicUser from(User user) {
            return new PublicUser(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getImageUrl(),
                user.getBio(),
                user.getJobTitle(),
                user.getCompany()
            );
        }
    }
}
