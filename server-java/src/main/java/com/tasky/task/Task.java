package com.tasky.task;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tasky.column.Column;
import com.tasky.comment.Comment;
import com.tasky.notification.Notification;
import com.tasky.user.User;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    private String id;

    @jakarta.persistence.Column(name = "column_id", nullable = false)
    private String columnId;

    @jakarta.persistence.Column(nullable = false)
    private String title;

    private String description;

    @jakarta.persistence.Column(name = "assignee_id")
    private String assigneeId;

    @Enumerated(EnumType.STRING)
    private TaskLabel label;

    @Enumerated(EnumType.STRING)
    @jakarta.persistence.Column(nullable = false)
    private TaskPriority priority = TaskPriority.MEDIUM;

    @jakarta.persistence.Column(nullable = false)
    private double position;

    @jakarta.persistence.Column(nullable = false, updatable = false)
    private Instant createdAt;

    @jakarta.persistence.Column(nullable = false)
    private Instant updatedAt;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "column_id", insertable = false, updatable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Column column;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id", insertable = false, updatable = false)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private User assignee;

    @JsonIgnore
    @OneToMany(mappedBy = "task", cascade = CascadeType.REMOVE)
    private List<Comment> comments = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "task")
    private List<Notification> notifications = new ArrayList<>();

    protected Task() {
    }

    public Task(String columnId, String title, double position) {
        this.columnId = columnId;
        this.title = title;
        this.position = position;
    }

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (priority == null) {
            priority = TaskPriority.MEDIUM;
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

    public String getColumnId() {
        return columnId;
    }

    public void setColumnId(String columnId) {
        this.columnId = columnId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(String assigneeId) {
        this.assigneeId = assigneeId;
    }

    public TaskLabel getLabel() {
        return label;
    }

    public void setLabel(TaskLabel label) {
        this.label = label;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public double getPosition() {
        return position;
    }

    public void setPosition(double position) {
        this.position = position;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Column getColumn() {
        return column;
    }

    public void setColumn(Column column) {
        this.column = column;
        this.columnId = column == null ? null : column.getId();
    }

    public User getAssignee() {
        return assignee;
    }

    public void setAssignee(User assignee) {
        this.assignee = assignee;
        this.assigneeId = assignee == null ? null : assignee.getId();
    }

    public List<Comment> getComments() {
        return comments;
    }

    public List<Notification> getNotifications() {
        return notifications;
    }
}
