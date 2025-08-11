package bo.edu.ucb.backend_simsml.exception;

import lombok.Data;

@Data
public class BusinessException extends RuntimeException {
    private final String code;
    public BusinessException(String code, String message) {
        super(message);
        this.code = code;
    }
}
