package com.rentmen.app.exceptions;

import com.rentmen.app.DTO.ApiResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.servlet.http.HttpServletRequest;
import java.sql.SQLIntegrityConstraintViolationException;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({ResourceNotFoundException.class})
    public ResponseEntity<ApiResponse> resourceNotFoundExceptionHandler(ResourceNotFoundException ex) {
        String message = ex.getMessage();
        String error = ex.getMessage();
        ApiResponse apiResponse = new ApiResponse(message,error, false);
        return new ResponseEntity<ApiResponse>(apiResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler({MethodArgumentNotValidException.class})
    public ResponseEntity<ApiErrorResponse> methodNotValidExceptionHandler(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> resp = new HashMap<>();

        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError)error).getField();
            String message = error.getDefaultMessage();
            resp.put(fieldName, message);
        });
        ApiErrorResponse body = new ApiErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                resp.toString(),
                request.getRequestURI()
        );
        return new ResponseEntity<ApiErrorResponse>(body, HttpStatus.BAD_REQUEST);
    }

//    @ExceptionHandler({SQLIntegrityConstraintViolationException.class})
//    public ResponseEntity<ApiResponse> sqlIntegrityConstraintViolationExceptionHandler(SQLIntegrityConstraintViolationException ex) {
//        String message = "Duplicate entry error: " + ex.getMessage();
//        ApiResponse apiResponse = new ApiResponse(message, false);
//        return new ResponseEntity<>(apiResponse, HttpStatus.CONFLICT);
//    }
//
//    @ExceptionHandler({DataIntegrityViolationException.class})
//    public ResponseEntity<ApiResponse> dataIntegrityViolationExceptionHandler(DataIntegrityViolationException ex) {
//        Throwable cause = ex.getRootCause();
//        if (cause instanceof SQLIntegrityConstraintViolationException) {
//            return sqlIntegrityConstraintViolationExceptionHandler((SQLIntegrityConstraintViolationException) cause);
//        }
//        ApiResponse apiResponse = new ApiResponse("Data integrity violation: " + ex.getMessage(), false);
//        return new ResponseEntity<>(apiResponse, HttpStatus.CONFLICT);
//    }

    @ExceptionHandler({SQLIntegrityConstraintViolationException.class})
    public ResponseEntity<ApiResponse> sqlIntegrityConstraintViolationExceptionHandler(SQLIntegrityConstraintViolationException ex) {
        String message = "Duplicate entry error: " + ex.getMessage();
        String error = "User already exists: " + ex.getMessage();
        ApiResponse apiResponse = new ApiResponse(message,error, false);
        return new ResponseEntity<>(apiResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler({DataIntegrityViolationException.class})
    public ResponseEntity<ApiResponse> dataIntegrityViolationExceptionHandler(DataIntegrityViolationException ex) {
        Throwable cause = ex.getRootCause();
        if (cause instanceof SQLIntegrityConstraintViolationException) {
            return sqlIntegrityConstraintViolationExceptionHandler((SQLIntegrityConstraintViolationException) cause);
        }
        ApiResponse apiResponse = new ApiResponse("Data integrity violation: " + ex.getMessage(),"Data integrity violation: " + ex.getMessage(), false);
        return new ResponseEntity<>(apiResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler({Exception.class})
    public ResponseEntity<ApiErrorResponse> genericExceptionHandler(Exception ex, HttpServletRequest request) {
        ApiErrorResponse body = new ApiErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI()
        );
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
