package com.duc.identity.exception;

import com.duc.common.exception.BaseException;
import com.duc.common.exception.ErrorCodes;
import org.springframework.http.HttpStatus;

public class UserNotFoundException extends BaseException {
    public UserNotFoundException(String email) {
        super(HttpStatus.NOT_FOUND, ErrorCodes.USER_NOT_FOUND, "User not found: " + email);
    }
}
