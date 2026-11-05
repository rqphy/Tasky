package com.tasky.project;

import java.util.List;

import com.tasky.auth.exception.UserNotFoundException;

import com.tasky.member.ProjectMember;
import com.tasky.member.ProjectMemberRepository;
import com.tasky.member.ProjectRole;

import com.tasky.project.dto.CreateProjectRequest;
import com.tasky.project.dto.CreatedProjectResponse;
import com.tasky.project.dto.ProjectDetailResponse;
import com.tasky.project.dto.ProjectResponse;
import com.tasky.project.dto.UpdateProjectRequest;
import com.tasky.project.exception.ProjectAccessDeniedException;
import com.tasky.project.exception.ProjectDeleteForbiddenException;
import com.tasky.project.exception.ProjectNotFoundException;
import com.tasky.project.exception.ProjectUpdateForbiddenException;

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

    @Transactional(readOnly = true)
    public ProjectDetailResponse getProjectById(String id) {
        String userId = currentUser().getId();
        Project project = projectRepository.findById(id)
            .orElseThrow(ProjectNotFoundException::new);

        boolean isMember = project.getMembers().stream().anyMatch(member -> member.getUserId().equals(userId));
        if (!project.getOwnerId().equals(userId) && !isMember) {
            throw new ProjectAccessDeniedException();
        }

        return ProjectDetailResponse.from(project);
    }

    @Transactional
    public ProjectResponse updateProject(String id, UpdateProjectRequest request) {
        String userId = currentUser().getId();
        Project project = projectRepository.findById(id)
            .orElseThrow(ProjectNotFoundException::new);

        if (!project.getOwnerId().equals(userId)) {
            throw new ProjectUpdateForbiddenException();
        }

        if (request.namePresent()) {
            project.setName(request.name());
        }
        if (request.emojiPresent()) {
            project.setEmoji(request.emoji());
        }

        project = projectRepository.save(project);
        return ProjectResponse.from(project);
    }

    @Transactional
    public void deleteProject(String id) {
        String userId = currentUser().getId();
        Project project = projectRepository.findById(id)
            .orElseThrow(ProjectNotFoundException::new);

        if (!project.getOwnerId().equals(userId)) {
            throw new ProjectDeleteForbiddenException();
        }

        projectRepository.delete(project);
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
