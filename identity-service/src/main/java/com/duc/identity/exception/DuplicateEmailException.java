package com.duc.identity.exception;

import com.duc.common.exception.BaseException;
import com.duc.common.exception.ErrorCodes;
import org.springframework.http.HttpStatus;

public class DuplicateEmailException extends BaseException {
    public DuplicateEmailException(String email) {
        super(HttpStatus.BAD_REQUEST, ErrorCodes.USER_DUPLICATE_EMAIL, "Email already exists: " + email);
    }
}
