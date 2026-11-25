package com.tasky.column;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ColumnRepository extends JpaRepository<Column, String> {

    Optional<Column> findFirstByProjectIdOrderByPositionDesc(String projectId);

    List<Column> findByProjectId(String projectId);
}