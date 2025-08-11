package bo.edu.ucb.backend_simsml.dto;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@EqualsAndHashCode
public class SuccessfulResponse implements Serializable {
    private LocalDateTime localDateTime;
    private String status;
    private String message;
    private Object result;

    public SuccessfulResponse(String status, String message, Object result) {
        this.localDateTime = LocalDateTime.now();
        this.status = status;
        this.message = message;
        this.result = result;
    }
}
