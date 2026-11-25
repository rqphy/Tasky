package com.tasky.column;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.tasky.column.dto.ColumnResponse;
import com.tasky.column.dto.CreateColumnRequest;
import com.tasky.column.dto.UpdateColumnRequest;
import com.tasky.column.dto.ReorderColumnsRequest;
import com.tasky.column.dto.ReorderColumnsResponse;
import com.tasky.project.Project;
import com.tasky.project.ProjectAccess;
import com.tasky.column.exception.ColumnNotFoundException;
import com.tasky.column.exception.ColumnsNotInProjectException;

@Service
public class ColumnService {
    private final ColumnRepository columnRepository;
    private final ProjectAccess projectAccess;

    public ColumnService(ColumnRepository columnRepository, ProjectAccess projectAccess) {
        this.columnRepository = columnRepository;
        this.projectAccess = projectAccess;
    }

    @Transactional
    public ColumnResponse createColumn(String projectId, CreateColumnRequest request) {
        Project project = projectAccess.requireMember(projectId);

        double position = columnRepository.findFirstByProjectIdOrderByPositionDesc(project.getId())
            .map(column -> column.getPosition() + 1)
            .orElse(1.0);
        String color = request.color() == null ? "#6366f1" : request.color();

        Column column = columnRepository.save(new Column(project.getId(), request.name(), color, position));
        return ColumnResponse.from(column);
    }

    @Transactional
    public ColumnResponse updateColumn(String projectId, String columnId, UpdateColumnRequest request) {
        Project project = projectAccess.requireMember(projectId);

        Column column = columnRepository.findById(columnId)
            .filter(found -> found.getProjectId().equals(project.getId()))
            .orElseThrow(ColumnNotFoundException::new);

        if (request.name() != null) {
            column.setName(request.name());
        }
        if (request.color() != null) {
            column.setColor(request.color());
        }

        columnRepository.saveAndFlush(column);
        return ColumnResponse.from(column);
    }

    @Transactional
    public void deleteColumn(String projectId, String columnId) {
        Project project = projectAccess.requireMember(projectId);

        Column column = columnRepository.findById(columnId)
            .filter(found -> found.getProjectId().equals(project.getId()))
            .orElseThrow(ColumnNotFoundException::new);
            
        columnRepository.delete(column);
    }

    @Transactional
    public ReorderColumnsResponse reorderColumns(String projectId, ReorderColumnsRequest request) {
        Project project = projectAccess.requireMember(projectId);

        List<Column> projectColumns = columnRepository.findByProjectId(project.getId());
        Map<String, Column> columnsById = projectColumns.stream()
            .collect(Collectors.toMap(Column::getId, Function.identity()));
        if (!columnsById.keySet().containsAll(request.columnIds())) {
            throw new ColumnsNotInProjectException();
        }

        List<String> columnIds = request.columnIds();
        for (int index = 0; index < columnIds.size(); index++) {
            columnsById.get(columnIds.get(index)).setPosition(index + 1);
        }
        columnRepository.saveAllAndFlush(projectColumns);
        return new ReorderColumnsResponse("Columns reordered");
    }
}
