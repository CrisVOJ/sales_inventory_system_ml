package bo.edu.ucb.backend_simsml.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, Object id) {
        super("%s con id %s no existe".formatted(resource, id));
    }
}
