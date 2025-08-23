package bo.edu.ucb.backend_simsml.dto.category;

public record CategoryResponse(
        Long categoryId,
        String name,
        String description,
        boolean active
) {
}
