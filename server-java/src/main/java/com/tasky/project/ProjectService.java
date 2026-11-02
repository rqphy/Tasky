package com.tasky.project;

import java.util.List;

import com.tasky.project.dto.ProjectResponse;

public interface ProjectService {


    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjects() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof String userId)) {
            throw new UserNotFoundException();
        }

        User user = users.findById(userId)
            .filter(found -> !found.getEmail().endsWith("@deleted.tasky"))
            .orElseThrow(UserNotFoundException::new);

        return projectRepository.findByOwnerId(userId).stream().map(ProjectResponse::from).toList();
    }
}