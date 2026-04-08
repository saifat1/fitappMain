package ru.fitapp.backend.common.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import ru.fitapp.backend.common.exception.ErrorResponse;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException ex) {
        HttpStatus status = mapStatus(ex.getCode());

        if (status.is5xxServerError()) {
            log.error("ApiException: code={}, message={}", ex.getCode(), ex.getMessage(), ex);
        } else {
            log.warn("ApiException: code={}, message={}", ex.getCode(), ex.getMessage());
        }

        ErrorResponse response = new ErrorResponse(
                ex.getCode(),
                ex.getMessage(),
                LocalDateTime.now()
        );

        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        String message = "Ошибка валидации запроса";

        if (ex.getBindingResult().getFieldError() != null) {
            message = ex.getBindingResult().getFieldError().getDefaultMessage();
        }

        log.warn("Validation error: {}", message);

        ErrorResponse response = new ErrorResponse(
                "VALIDATION_ERROR",
                message,
                LocalDateTime.now()
        );

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        log.warn("Bad credentials: {}", ex.getMessage());

        ErrorResponse response = new ErrorResponse(
                "INVALID_CREDENTIALS",
                "Неверный email или пароль",
                LocalDateTime.now()
        );

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException ex) {
        log.warn("Authentication exception: {}", ex.getMessage(), ex);

        ErrorResponse response = new ErrorResponse(
                "UNAUTHORIZED",
                "Ошибка аутентификации",
                LocalDateTime.now()
        );

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpectedException(Exception ex) {
        log.error("Unhandled exception", ex);

        ErrorResponse response = new ErrorResponse(
                "INTERNAL_ERROR",
                "Внутренняя ошибка сервера",
                LocalDateTime.now()
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    private HttpStatus mapStatus(String code) {
        return switch (code) {
            case "USER_NOT_FOUND" -> HttpStatus.NOT_FOUND;
            case "EMAIL_ALREADY_EXISTS" -> HttpStatus.CONFLICT;
            case "INVITE_NOT_FOUND" -> HttpStatus.NOT_FOUND;
            case "INVITE_EXPIRED" -> HttpStatus.BAD_REQUEST;
            case "INVITE_ALREADY_USED" -> HttpStatus.BAD_REQUEST;
            case "INVITE_CANCELLED" -> HttpStatus.BAD_REQUEST;
            case "INVITE_EMAIL_MISMATCH" -> HttpStatus.BAD_REQUEST;
            case "INVALID_CREDENTIALS" -> HttpStatus.UNAUTHORIZED;
            case "USER_INACTIVE" -> HttpStatus.FORBIDDEN;
            case "UNAUTHORIZED" -> HttpStatus.UNAUTHORIZED;
            case "CLIENT_NOT_FOUND" -> HttpStatus.NOT_FOUND;
            case "ACCESS_DENIED" -> HttpStatus.FORBIDDEN;
            case "TRAINING_NOT_FOUND" -> HttpStatus.NOT_FOUND;
            case "INVALID_DATE_RANGE" -> HttpStatus.BAD_REQUEST;
            case "INVALID_TRAINING_TIME" -> HttpStatus.BAD_REQUEST;
            case "INVALID_TRAINING_STATUS" -> HttpStatus.BAD_REQUEST;
            case "TRAINING_EXERCISE_NOT_FOUND" -> HttpStatus.NOT_FOUND;
            case "RESCHEDULE_REQUEST_NOT_FOUND" -> HttpStatus.NOT_FOUND;
            case "RESCHEDULE_REQUEST_ALREADY_EXISTS" -> HttpStatus.BAD_REQUEST;
            case "RESCHEDULE_REQUEST_ALREADY_PROCESSED" -> HttpStatus.BAD_REQUEST;
            case "INVALID_RESCHEDULE_DECISION" -> HttpStatus.BAD_REQUEST;
            case "TRAINING_ALREADY_CANCELLED" -> HttpStatus.BAD_REQUEST;
            default -> HttpStatus.BAD_REQUEST;
        };
    }
}