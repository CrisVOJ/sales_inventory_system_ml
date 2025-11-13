package bo.edu.ucb.backend_simsml.dto.purchase;

import bo.edu.ucb.backend_simsml.dto.purchaseStatus.PurchaseStatusSummary;
import bo.edu.ucb.backend_simsml.dto.supplier.SupplierSummary;
import bo.edu.ucb.backend_simsml.dto.user.UserSummary;

import java.time.LocalDate;

public record PurchaseResponse(
        Long purchaseId,
        LocalDate date,
        UserSummary user,
        SupplierSummary supplier,
        PurchaseStatusSummary purchaseStatus
) {
}
