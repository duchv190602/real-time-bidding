package com.duc.common.dto.response;

import java.time.Instant;

public record ErrorResponse(
        Instant timestamp,
        int status,
        String errorCode,
        String message,
        String traceId,
        String path
) {
    public static ErrorResponse of(int status, String errorCode, String message, String traceId, String path) {
        return new ErrorResponse(Instant.now(), status, errorCode, message, traceId, path);
    }
}
