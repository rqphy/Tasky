package com.tasky.column;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tasky.project.Project;
import com.tasky.task.Task;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "columns")
public class Column {

    @Id
    private String id;

    @jakarta.persistence.Column(name = "project_id", nullable = false)
    private String projectId;

    @jakarta.persistence.Column(nullable = false)
    private String name;

    @jakarta.persistence.Column(nullable = false)
    private String color = "#6366f1";

    @jakarta.persistence.Column(nullable = false)
    private double position;

    @jakarta.persistence.Column(nullable = false, updatable = false)
    private Instant createdAt;

    @jakarta.persistence.Column(nullable = false)
    private Instant updatedAt;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", insertable = false, updatable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Project project;

    @JsonIgnore
    @OneToMany(mappedBy = "column", cascade = CascadeType.REMOVE)
    private List<Task> tasks = new ArrayList<>();

    protected Column() {
    }

    public Column(String projectId, String name, double position) {
        this(projectId, name, "#6366f1", position);
    }

    public Column(String projectId, String name, String color, double position) {
        this.projectId = projectId;
        this.name = name;
        this.color = color;
        this.position = position;
    }

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        if (color == null) {
            color = "#6366f1";
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

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
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

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
        this.projectId = project == null ? null : project.getId();
    }

    public List<Task> getTasks() {
        return tasks;
    }
}
