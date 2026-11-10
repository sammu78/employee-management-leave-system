package com.ems.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class OverlappingLeaveException extends RuntimeException {
    public OverlappingLeaveException(String message) {
        super(message);
    }
}
