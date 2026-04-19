package com.duc.identity.exception;

import com.duc.common.exception.BaseException;
import com.duc.common.exception.ErrorCodes;
import org.springframework.http.HttpStatus;

public class InvalidCredentialsException extends BaseException {
    public InvalidCredentialsException() {
        super(HttpStatus.UNAUTHORIZED, ErrorCodes.AUTH_INVALID_CREDENTIALS, "Invalid email or password");
    }
}
