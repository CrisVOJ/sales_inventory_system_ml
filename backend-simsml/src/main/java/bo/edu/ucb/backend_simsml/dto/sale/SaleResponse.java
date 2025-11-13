package bo.edu.ucb.backend_simsml.dto.sale;

import bo.edu.ucb.backend_simsml.dto.customer.CustomerSummary;
import bo.edu.ucb.backend_simsml.dto.inventory.InventorySummary;
import bo.edu.ucb.backend_simsml.dto.saleStatus.SaleStatusSummary;
import bo.edu.ucb.backend_simsml.dto.user.UserSummary;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record SaleResponse(
        Long saleId,
        LocalDate registrationDate,
        UserSummary user,
        CustomerSummary customer,
        SaleStatusSummary saleStatus,
        BigDecimal total,
        List<SaleItemResponse> saleItems
) {
    public record SaleItemResponse(
          Long saleDetailId,
          InventorySummary inventory,
          Integer productQuantity,
          BigDecimal unitPrice,
          BigDecimal subTotal,
          boolean active
    ) {}
}
