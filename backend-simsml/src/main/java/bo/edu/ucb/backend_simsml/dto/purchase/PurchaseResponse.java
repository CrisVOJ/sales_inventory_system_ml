package bo.edu.ucb.backend_simsml.dto.purchase;

import bo.edu.ucb.backend_simsml.dto.purchaseStatus.PurchaseStatusSummary;
import bo.edu.ucb.backend_simsml.dto.supplier.SupplierSummary;
import bo.edu.ucb.backend_simsml.dto.user.UserSaleResponse;

import java.time.LocalDate;

public record PurchaseResponse(
        Long purchaseId,
        LocalDate date,
        UserSaleResponse user,
        SupplierSummary supplier,
        PurchaseStatusSummary purchaseStatus
) {
}
