package com.tasky.common.error;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(String error, Map<String, String> details) {

    public static ApiError of(String error) {
        return new ApiError(error, null);
    }
}
