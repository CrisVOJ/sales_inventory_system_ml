package bo.edu.ucb.backend_simsml.dto.supplier;

public record SupplierResponse(
        Long supplierId,
        String name,
        String contact,
        String email,
        String phone,
        String address,
        boolean active
) {
}
