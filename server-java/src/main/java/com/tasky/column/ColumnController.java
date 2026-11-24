package com.tasky.column;

import com.tasky.column.dto.CreateColumnRequest;
import com.tasky.column.dto.ColumnResponse;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/projects/{projectId}/columns")
public class ColumnController {
    private final ColumnService columnService;

    public ColumnController(ColumnService columnService) {
        this.columnService = columnService;
    }

    @PostMapping
    public ResponseEntity<ColumnResponse> createColumn(
        @PathVariable("projectId") String projectId,
        @Valid @RequestBody CreateColumnRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(columnService.createColumn(projectId, request));
    }
}
