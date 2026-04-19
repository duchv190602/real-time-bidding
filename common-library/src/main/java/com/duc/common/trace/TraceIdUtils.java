package com.duc.common.trace;

import org.slf4j.MDC;

public final class TraceIdUtils {
    private TraceIdUtils() {
    }

    public static String currentTraceId() {
        String traceId = MDC.get(TraceIdConstants.MDC_KEY);
        return traceId == null ? "" : traceId;
    }
}
