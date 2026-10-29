package com.tasky.user;

import java.time.Instant;

public record UserResponse(
    String id,
    String name,
    String email,
    String imageUrl,
    String bio,
    String jobTitle,
    String company,
    Instant createdAt,
    Instant updatedAt
) {

    public static UserResponse from(User user) {
        return new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getImageUrl(),
            user.getBio(),
            user.getJobTitle(),
            user.getCompany(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}
