package bo.edu.ucb.backend_simsml.dto.purchase;

import bo.edu.ucb.backend_simsml.dto.purchaseStatus.PurchaseStatusSummary;
import bo.edu.ucb.backend_simsml.dto.supplier.SupplierSummary;
import bo.edu.ucb.backend_simsml.entity.PurchaseEntity;

import java.time.LocalDate;

public record PurchaseSummary(
        Long purchaseId,
        LocalDate date,
        SupplierSummary supplier,
        PurchaseStatusSummary purchaseStatus
) {
    public static PurchaseSummary from(PurchaseEntity purchase) {
        if (purchase == null) return null;
        return new PurchaseSummary(
                purchase.getPurchaseId(),
                purchase.getDate(),
                SupplierSummary.fromEntity(purchase.getSupplier()),
                PurchaseStatusSummary.from(purchase.getPurchaseStatus())
        );
    }
}
