package com.tasky.user;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tasky.auth.PasswordResetToken;
import com.tasky.auth.RefreshToken;
import com.tasky.comment.Comment;
import com.tasky.invite.ProjectInvite;
import com.tasky.member.ProjectMember;
import com.tasky.notification.Notification;
import com.tasky.project.Project;
import com.tasky.task.Task;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    private String imageUrl;

    private String bio;

    private String jobTitle;

    private String company;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "owner")
    private List<Project> ownedProjects = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user")
    private List<ProjectMember> projectMembers = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE)
    private List<RefreshToken> refreshTokens = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE)
    private List<PasswordResetToken> passwordResetTokens = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "assignee")
    private List<Task> assignedTasks = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "author")
    private List<Comment> comments = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "invitedBy")
    private List<ProjectInvite> sentInvites = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE)
    private List<Notification> notifications = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "actor")
    private List<Notification> actedNotifications = new ArrayList<>();

    protected User() {
    }

    public User(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public List<Project> getOwnedProjects() {
        return ownedProjects;
    }

    public List<ProjectMember> getProjectMembers() {
        return projectMembers;
    }

    public List<RefreshToken> getRefreshTokens() {
        return refreshTokens;
    }

    public List<PasswordResetToken> getPasswordResetTokens() {
        return passwordResetTokens;
    }

    public List<Task> getAssignedTasks() {
        return assignedTasks;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public List<ProjectInvite> getSentInvites() {
        return sentInvites;
    }

    public List<Notification> getNotifications() {
        return notifications;
    }

    public List<Notification> getActedNotifications() {
        return actedNotifications;
    }
}
