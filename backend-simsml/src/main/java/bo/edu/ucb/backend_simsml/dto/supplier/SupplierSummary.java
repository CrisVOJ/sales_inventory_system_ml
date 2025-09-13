package bo.edu.ucb.backend_simsml.dto.supplier;

import bo.edu.ucb.backend_simsml.entity.SupplierEntity;

public record SupplierSummary(
        Long supplierId,
        String name,
        String contact,
        String email
) {
    public static SupplierSummary fromEntity(SupplierEntity supplier) {
        if (supplier == null) return null;
        return new SupplierSummary(
                supplier.getSupplierId(),
                supplier.getName(),
                supplier.getContact(),
                supplier.getEmail()
        );
    }
}
