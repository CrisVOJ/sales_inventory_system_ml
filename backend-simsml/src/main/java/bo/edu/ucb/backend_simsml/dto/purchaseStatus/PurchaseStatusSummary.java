package bo.edu.ucb.backend_simsml.dto.purchaseStatus;

import bo.edu.ucb.backend_simsml.entity.PurchaseStatusEntity;

public record PurchaseStatusSummary(
        Long purchaseStatusId,
        String name
) {
    public static PurchaseStatusSummary from(PurchaseStatusEntity purchaseStatus) {
        if (purchaseStatus == null) return null;
        return new PurchaseStatusSummary(purchaseStatus.getPurchaseStatusId(), purchaseStatus.getName());
    }
}
