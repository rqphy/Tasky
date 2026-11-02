package com.tasky.project;

import java.util.List;

import com.tasky.auth.exception.UserNotFoundException;
import com.tasky.project.dto.ProjectResponse;
import com.tasky.user.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository users;

    public ProjectService(ProjectRepository projectRepository, UserRepository users) {
        this.projectRepository = projectRepository;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjects() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof String userId)) {
            throw new UserNotFoundException();
        }

        users.findById(userId)
            .filter(found -> !found.getEmail().endsWith("@deleted.tasky"))
            .orElseThrow(UserNotFoundException::new);

        return projectRepository
            .findDistinctByOwnerIdOrMembersUserIdOrderByUpdatedAtDesc(userId, userId)
            .stream()
            .map(ProjectResponse::from)
            .toList();
    }
}
