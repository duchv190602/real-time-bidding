package com.duc.common.exception;

public final class ErrorCodes {
    private ErrorCodes() {
    }

    public static final String COMMON_VALIDATION = "COMMON_001";
    public static final String COMMON_INTERNAL = "COMMON_500";
    public static final String AUTH_INVALID_CREDENTIALS = "AUTH_001";
    public static final String AUTH_FORBIDDEN = "AUTH_002";
    public static final String USER_DUPLICATE_EMAIL = "USER_001";
    public static final String USER_NOT_FOUND = "USER_404";
    public static final String AUCTION_NOT_FOUND = "AUC_404";
    public static final String BID_INVALID_AMOUNT = "BID_001";
    public static final String BID_INVALID_STATE = "BID_002";
}
