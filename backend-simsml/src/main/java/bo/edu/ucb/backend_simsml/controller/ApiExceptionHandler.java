package bo.edu.ucb.backend_simsml.controller;

import bo.edu.ucb.backend_simsml.exception.BusinessException;
import bo.edu.ucb.backend_simsml.exception.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import javax.naming.AuthenticationException;
import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ApiExceptionHandler {

    // 404
    @ExceptionHandler (ResourceNotFoundException.class)
    public ResponseEntity<ProblemDetail> handleNotFound(ResourceNotFoundException exception, HttpServletRequest request) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());

        problemDetail.setTitle("Resource not found");
        problemDetail.setInstance(URI.create(request.getRequestURI()));
        problemDetail.setProperty("code", "RESOURCE_NOT_FOUND");

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problemDetail);
    }

    // 402 reglas de negocio
    @ExceptionHandler (BusinessException.class)
    public ResponseEntity<ProblemDetail> handleBusiness(BusinessException exception, HttpServletRequest request) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, exception.getMessage());

        problemDetail.setTitle("Business exception");
        problemDetail.setInstance(URI.create(request.getRequestURI()));
        problemDetail.setProperty("code", exception.getCode());

        return ResponseEntity.unprocessableEntity().body(problemDetail);
    }

    // 400 - invalid body JSON
    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<ProblemDetail> handleUnreadable(Exception exception, HttpServletRequest request) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);

        problemDetail.setTitle("Malformed JSON");
        problemDetail.setDetail("The request body could not be parsed");
        problemDetail.setInstance(URI.create(request.getRequestURI()));

        return ResponseEntity.badRequest().body(problemDetail);
    }

    // 400 - incorrect parameter
    @ExceptionHandler (MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ProblemDetail> handleTypeMismatch(MethodArgumentTypeMismatchException exception, HttpServletRequest request) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);

        problemDetail.setTitle("Invalid parameter");
        problemDetail.setDetail("Parameter '%s' with value '%s' was not valid".formatted(exception.getName(), exception.getValue()));
        problemDetail.setInstance(URI.create(request.getRequestURI()));

        return ResponseEntity.badRequest().body(problemDetail);
    }

    // 400 Body validation DTO (@Valid)
    @ExceptionHandler (MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleMethodArgNotValid(MethodArgumentNotValidException exception, HttpServletRequest request) {
        Map<String, String> errors = exception.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        fieldError -> fieldError.getField(),
                        DefaultMessageSourceResolvable::getDefaultMessage,
                        (a, b) -> a, LinkedHashMap::new));

        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);

        problemDetail.setTitle("Invalid request");
        problemDetail.setDetail("One or more fields could not be validated");
        problemDetail.setInstance(URI.create(request.getRequestURI()));
        problemDetail.setProperty("errors", errors);

        return ResponseEntity.badRequest().body(problemDetail);
    }

    // 400 - path/query validation (Controller @Validated)
    @ExceptionHandler (ConstraintViolationException.class)
    public ResponseEntity<ProblemDetail> handleConstraint(ConstraintViolationException exception, HttpServletRequest request) {
        Map<String, String> errors = exception.getConstraintViolations().stream()
                .collect(Collectors.toMap(
                        violations -> violations.getPropertyPath().toString(),
                        violations -> violations.getMessage(),
                        (a, b) -> a, LinkedHashMap::new));

        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);

        problemDetail.setTitle("Invalid parameters");
        problemDetail.setDetail("Invalid path/query parameters");
        problemDetail.setInstance(URI.create(request.getRequestURI()));
        problemDetail.setProperty("errors", errors);

        return ResponseEntity.badRequest().body(problemDetail);
    }

    // 409 - Uniqueness/foreign violations (DB)
    @ExceptionHandler (DataIntegrityViolationException.class)
    public ResponseEntity<ProblemDetail> handleDataIntegrity(DataIntegrityViolationException exception, HttpServletRequest request) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.CONFLICT);

        problemDetail.setTitle("Data conflict");
        problemDetail.setDetail("Integrity constraint violated (unique/foreign)");
        problemDetail.setInstance(URI.create(request.getRequestURI()));

        return ResponseEntity.status(HttpStatus.CONFLICT).body(problemDetail);
    }

    // 401/403 - Security
    @ExceptionHandler (AuthenticationException.class)
    public ResponseEntity<ProblemDetail> handleAuth(AuthenticationException exception, HttpServletRequest request) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.UNAUTHORIZED);

        problemDetail.setTitle("Not authenticated");
        problemDetail.setDetail(exception.getMessage());
        problemDetail.setInstance(URI.create(request.getRequestURI()));

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(problemDetail);
    }

    // 500 - Last resource
    @ExceptionHandler (Exception.class)
    public ResponseEntity<ProblemDetail> handleUnknown(Exception exception, HttpServletRequest request) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);

        problemDetail.setTitle("Internal Server Error");
        problemDetail.setDetail("Unexpected error");
        problemDetail.setInstance(URI.create(request.getRequestURI()));

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(problemDetail);
    }
}
