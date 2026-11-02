package com.tasky.project;

import java.util.List;

import com.tasky.auth.exception.UserNotFoundException;
import com.tasky.member.ProjectMember;
import com.tasky.member.ProjectMemberRepository;
import com.tasky.member.ProjectRole;
import com.tasky.project.dto.CreateProjectRequest;
import com.tasky.project.dto.CreatedProjectResponse;
import com.tasky.project.dto.ProjectResponse;
import com.tasky.user.User;
import com.tasky.user.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository members;
    private final UserRepository users;

    public ProjectService(
        ProjectRepository projectRepository,
        ProjectMemberRepository members,
        UserRepository users
    ) {
        this.projectRepository = projectRepository;
        this.members = members;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjects() {
        String userId = currentUser().getId();

        return projectRepository
            .findDistinctByOwnerIdOrMembersUserIdOrderByUpdatedAtDesc(userId, userId)
            .stream()
            .map(ProjectResponse::from)
            .toList();
    }

    @Transactional
    public CreatedProjectResponse createProject(CreateProjectRequest request) {
        User user = currentUser();
        String emoji = request.emoji() == null ? "📋" : request.emoji();
        Project project = projectRepository.save(new Project(request.name(), emoji, user.getId()));
        ProjectMember member = members.save(new ProjectMember(user.getId(), project.getId(), ProjectRole.OWNER));
        return CreatedProjectResponse.from(project, member, user);
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof String userId)) {
            throw new UserNotFoundException();
        }

        return users.findById(userId)
            .filter(found -> !found.getEmail().endsWith("@deleted.tasky"))
            .orElseThrow(UserNotFoundException::new);
    }
}
