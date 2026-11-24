package com.tasky.project;

import java.util.List;

import com.tasky.member.ProjectMember;
import com.tasky.member.ProjectMemberRepository;
import com.tasky.member.ProjectRole;

import com.tasky.project.dto.CreateProjectRequest;
import com.tasky.project.dto.CreatedProjectResponse;
import com.tasky.project.dto.ProjectDetailResponse;
import com.tasky.project.dto.ProjectResponse;
import com.tasky.project.dto.UpdateProjectRequest;
import com.tasky.project.exception.ProjectDeleteForbiddenException;
import com.tasky.project.exception.ProjectNotFoundException;
import com.tasky.project.exception.ProjectUpdateForbiddenException;

import com.tasky.user.User;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository members;
    private final ProjectAccess projectAccess;

    public ProjectService(
        ProjectRepository projectRepository,
        ProjectMemberRepository members,
        ProjectAccess projectAccess
    ) {
        this.projectRepository = projectRepository;
        this.members = members;
        this.projectAccess = projectAccess;
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjects() {
        String userId = projectAccess.currentUser().getId();

        return projectRepository
            .findDistinctByOwnerIdOrMembersUserIdOrderByUpdatedAtDesc(userId, userId)
            .stream()
            .map(ProjectResponse::from)
            .toList();
    }

    @Transactional
    public CreatedProjectResponse createProject(CreateProjectRequest request) {
        User user = projectAccess.currentUser();
        String emoji = request.emoji() == null ? "📋" : request.emoji();
        Project project = projectRepository.save(new Project(request.name(), emoji, user.getId()));
        ProjectMember member = members.save(new ProjectMember(user.getId(), project.getId(), ProjectRole.OWNER));
        return CreatedProjectResponse.from(project, member, user);
    }

    @Transactional(readOnly = true)
    public ProjectDetailResponse getProjectById(String id) {
        Project project = projectAccess.requireMember(id);
        return ProjectDetailResponse.from(project);
    }

    @Transactional
    public ProjectResponse updateProject(String id, UpdateProjectRequest request) {
        String userId = projectAccess.currentUser().getId();
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
        String userId = projectAccess.currentUser().getId();
        Project project = projectRepository.findById(id)
            .orElseThrow(ProjectNotFoundException::new);

        if (!project.getOwnerId().equals(userId)) {
            throw new ProjectDeleteForbiddenException();
        }

        projectRepository.delete(project);
    }
}
