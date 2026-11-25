package com.tasky.project;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tasky.column.Column;
import com.tasky.invite.ProjectInvite;
import com.tasky.member.ProjectMember;
import com.tasky.notification.Notification;
import com.tasky.share.ProjectShareToken;
import com.tasky.user.User;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    private String id;

    @jakarta.persistence.Column(nullable = false)
    private String name;

    @jakarta.persistence.Column(nullable = false)
    private String emoji;

    @jakarta.persistence.Column(name = "owner_id", nullable = false)
    private String ownerId;

    @jakarta.persistence.Column(nullable = false, updatable = false)
    private Instant createdAt;

    @jakarta.persistence.Column(nullable = false)
    private Instant updatedAt;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", insertable = false, updatable = false)
    private User owner;

    @JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.REMOVE)
    private List<ProjectMember> members = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.REMOVE)
    private List<Column> columns = new ArrayList<>();

    @JsonIgnore
    @OneToOne(mappedBy = "project", cascade = CascadeType.REMOVE)
    private ProjectShareToken shareToken;

    @JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.REMOVE)
    private List<ProjectInvite> invites = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.REMOVE)
    private List<Notification> notifications = new ArrayList<>();

    protected Project() {
    }

    public Project(String name, String ownerId) {
        this(name, "📋", ownerId);
    }

    public Project(String name, String emoji, String ownerId) {
        this.name = name;
        this.emoji = emoji;
        this.ownerId = ownerId;
    }

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (emoji == null) {
            emoji = "📋";
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

    public String getEmoji() {
        return emoji;
    }

    public void setEmoji(String emoji) {
        this.emoji = emoji;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
        this.ownerId = owner == null ? null : owner.getId();
    }

    public List<ProjectMember> getMembers() {
        return members;
    }

    public List<Column> getColumns() {
        return columns;
    }

    public ProjectShareToken getShareToken() {
        return shareToken;
    }

    public void setShareToken(ProjectShareToken shareToken) {
        this.shareToken = shareToken;
    }

    public List<ProjectInvite> getInvites() {
        return invites;
    }

    public List<Notification> getNotifications() {
        return notifications;
    }
}
