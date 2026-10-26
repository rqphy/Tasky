package com.tasky.common.error;

import java.util.LinkedHashMap;
import java.util.Map;

import com.tasky.auth.EmailAlreadyRegisteredException;
import com.tasky.auth.ExpiredRefreshTokenException;
import com.tasky.auth.InvalidCredentialsException;
import com.tasky.auth.InvalidRefreshTokenException;
import com.tasky.auth.RefreshTokenRequiredException;
import com.tasky.auth.UnknownLogoutTokenException;

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

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validationFailed(MethodArgumentNotValidException exception) {
        Map<String, String> details = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(error ->
            details.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.badRequest().body(new ApiError("Validation failed", details));
    }
}
