package bo.edu.ucb.backend_simsml.dto.saleStatus;

public record SaleStatusResponse(
        Long saleStatusId,
        String name,
        boolean active
) {
}
