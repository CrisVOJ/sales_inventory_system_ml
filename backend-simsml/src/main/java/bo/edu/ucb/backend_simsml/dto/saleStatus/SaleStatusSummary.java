package bo.edu.ucb.backend_simsml.dto.saleStatus;

import bo.edu.ucb.backend_simsml.entity.SaleStatusEntity;

public record SaleStatusSummary(
        Long saleStatusId,
        String name
) {
    public static SaleStatusSummary from(SaleStatusEntity saleStatus) {
        if (saleStatus == null) return null;
        return new SaleStatusSummary(saleStatus.getSaleStatusId(), saleStatus.getName());
    }
}
