package com.tasky.project;

import com.tasky.auth.exception.UserNotFoundException;
import com.tasky.project.exception.ProjectAccessDeniedException;
import com.tasky.project.exception.ProjectNotFoundException;
import com.tasky.user.User;
import com.tasky.user.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectAccess {

    private final ProjectRepository projectRepository;
    private final UserRepository users;

    public ProjectAccess(ProjectRepository projectRepository, UserRepository users) {
        this.projectRepository = projectRepository;
        this.users = users;
    }

    public User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof String userId)) {
            throw new UserNotFoundException();
        }

        return users.findById(userId)
            .filter(found -> !found.getEmail().endsWith("@deleted.tasky"))
            .orElseThrow(UserNotFoundException::new);
    }

    @Transactional(readOnly = true)
    public Project requireMember(String projectId) {
        String userId = currentUser().getId();
        Project project = projectRepository.findById(projectId)
            .orElseThrow(ProjectNotFoundException::new);

        boolean isMember = project.getMembers().stream()
            .anyMatch(member -> member.getUserId().equals(userId));
        if (!project.getOwnerId().equals(userId) && !isMember) {
            throw new ProjectAccessDeniedException();
        }

        return project;
    }
}
