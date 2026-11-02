package com.tasky.invite;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tasky.member.ProjectRole;
import com.tasky.project.Project;
import com.tasky.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "project_invites",
        uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "email"})
)
public class ProjectInvite {

    @Id
    private String id;

    @Column(name = "project_id", nullable = false)
    private String projectId;

    @Column(nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectRole role = ProjectRole.MEMBER;

    @Column(nullable = false, unique = true)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InviteStatus status = InviteStatus.PENDING;

    @Column(name = "invited_by_id", nullable = false)
    private String invitedById;

    @Column(nullable = false)
    private Instant expiresAt;

    private Instant acceptedAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", insertable = false, updatable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Project project;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by_id", insertable = false, updatable = false)
    private User invitedBy;

    protected ProjectInvite() {
    }

    public ProjectInvite(
            String projectId,
            String email,
            String token,
            String invitedById,
            Instant expiresAt
    ) {
        this(projectId, email, ProjectRole.MEMBER, token, invitedById, expiresAt);
    }

    public ProjectInvite(
            String projectId,
            String email,
            ProjectRole role,
            String token,
            String invitedById,
            Instant expiresAt
    ) {
        this.projectId = projectId;
        this.email = email;
        this.role = role;
        this.token = token;
        this.invitedById = invitedById;
        this.expiresAt = expiresAt;
    }

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (role == null) {
            role = ProjectRole.MEMBER;
        }
        if (status == null) {
            status = InviteStatus.PENDING;
        }
        createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public ProjectRole getRole() {
        return role;
    }

    public void setRole(ProjectRole role) {
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public InviteStatus getStatus() {
        return status;
    }

    public void setStatus(InviteStatus status) {
        this.status = status;
    }

    public String getInvitedById() {
        return invitedById;
    }

    public void setInvitedById(String invitedById) {
        this.invitedById = invitedById;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(Instant acceptedAt) {
        this.acceptedAt = acceptedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
        this.projectId = project == null ? null : project.getId();
    }

    public User getInvitedBy() {
        return invitedBy;
    }

    public void setInvitedBy(User invitedBy) {
        this.invitedBy = invitedBy;
        this.invitedById = invitedBy == null ? null : invitedBy.getId();
    }
}
