package com.tasky.common.error;

import java.util.LinkedHashMap;
import java.util.Map;

import com.tasky.auth.exception.EmailAlreadyRegisteredException;
import com.tasky.auth.exception.ExpiredRefreshTokenException;
import com.tasky.auth.exception.InvalidCredentialsException;
import com.tasky.auth.exception.InvalidRefreshTokenException;
import com.tasky.auth.exception.InvalidResetTokenException;
import com.tasky.auth.exception.RefreshTokenRequiredException;
import com.tasky.auth.exception.UnknownLogoutTokenException;
import com.tasky.auth.exception.UserNotFoundException;

import com.tasky.project.exception.ProjectAccessDeniedException;
import com.tasky.project.exception.ProjectNotFoundException;
import com.tasky.project.exception.ProjectUpdateForbiddenException;
import com.tasky.project.exception.ProjectDeleteForbiddenException;

import com.tasky.column.exception.ColumnNotFoundException;
import com.tasky.column.exception.ColumnsNotInProjectException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(EmailAlreadyRegisteredException.class)
    ResponseEntity<ApiError> emailAlreadyRegistered() {
        return ResponseEntity.badRequest().body(ApiError.of("Email already registered"));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    ResponseEntity<ApiError> invalidCredentials() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiError.of("Invalid credentials"));
    }

    @ExceptionHandler(RefreshTokenRequiredException.class)
    ResponseEntity<ApiError> refreshTokenRequired() {
        return ResponseEntity.badRequest().body(ApiError.of("Refresh token is required"));
    }

    @ExceptionHandler(InvalidRefreshTokenException.class)
    ResponseEntity<ApiError> invalidRefreshToken() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiError.of("Invalid refresh token"));
    }

    @ExceptionHandler(ExpiredRefreshTokenException.class)
    ResponseEntity<ApiError> expiredRefreshToken() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiError.of("Refresh token expired"));
    }

    @ExceptionHandler(UnknownLogoutTokenException.class)
    ResponseEntity<ApiError> unknownLogoutToken() {
        return ResponseEntity.badRequest().body(ApiError.of("Invalid refresh token"));
    }

    @ExceptionHandler(InvalidResetTokenException.class)
    ResponseEntity<ApiError> invalidResetToken() {
        return ResponseEntity.badRequest().body(ApiError.of("Invalid or expired reset link"));
    }

    @ExceptionHandler(UserNotFoundException.class)
    ResponseEntity<ApiError> userNotFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiError.of("User not found"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validationFailed(MethodArgumentNotValidException exception) {
        Map<String, String> details = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(error ->
            details.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.badRequest().body(new ApiError("Validation failed", details));
    }

    @ExceptionHandler(ProjectAccessDeniedException.class)
    ResponseEntity<ApiError> projectAccessDenied() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiError.of("Access denied"));
    }

    @ExceptionHandler(ProjectNotFoundException.class)
    ResponseEntity<ApiError> projectNotFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiError.of("Project not found"));
    }

    @ExceptionHandler(ProjectUpdateForbiddenException.class)
    ResponseEntity<ApiError> projectUpdateForbidden() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiError.of("Only the owner can update this project"));
    }

    @ExceptionHandler(ProjectDeleteForbiddenException.class)
    ResponseEntity<ApiError> projectDeleteForbidden() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiError.of("Only the owner can delete this project"));
    }

    @ExceptionHandler(ColumnNotFoundException.class)
    ResponseEntity<ApiError> columnNotFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiError.of("Column not found"));
    }

    @ExceptionHandler(ColumnsNotInProjectException.class)
    ResponseEntity<ApiError> columnsNotInProject() {
        return ResponseEntity.badRequest().body(ApiError.of("Some column IDs do not belong to this project"));
    }
}
