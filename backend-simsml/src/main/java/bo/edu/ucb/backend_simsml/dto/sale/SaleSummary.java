package bo.edu.ucb.backend_simsml.dto.sale;

import bo.edu.ucb.backend_simsml.dto.customer.CustomerSaleResponse;
import bo.edu.ucb.backend_simsml.dto.saleStatus.SaleStatusSummary;
import bo.edu.ucb.backend_simsml.entity.SaleEntity;

import java.time.LocalDate;

public record SaleSummary(
        Long saleId,
        LocalDate registrationDate,
        CustomerSaleResponse customer,
        SaleStatusSummary saleStatus
) {
    public static SaleSummary from(SaleEntity sale) {
        if (sale == null) return null;
        return new SaleSummary(
                sale.getSaleId(),
                sale.getRegistrationDate(),
                CustomerSaleResponse.from(sale.getCustomer()),
                SaleStatusSummary.from(sale.getSaleStatus()));
    }
}
