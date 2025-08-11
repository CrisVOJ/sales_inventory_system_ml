package bo.edu.ucb.backend_simsml.dto;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
public class UnsuccessfulResponse implements Serializable {
    private LocalDateTime localDateTime;
    private String status;
    private String error;
    private String path;

    public UnsuccessfulResponse(String status, String error, String path) {
        this.localDateTime = LocalDateTime.now();
        this.status = status;
        this.error = error;
        this.path = path;
    }
}
