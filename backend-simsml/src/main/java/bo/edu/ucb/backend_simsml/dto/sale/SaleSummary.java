package bo.edu.ucb.backend_simsml.dto.sale;

import bo.edu.ucb.backend_simsml.dto.customer.CustomerSummary;
import bo.edu.ucb.backend_simsml.dto.saleStatus.SaleStatusSummary;
import bo.edu.ucb.backend_simsml.entity.SaleEntity;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SaleSummary(
        Long saleId,
        LocalDate registrationDate,
        CustomerSummary customer,
        SaleStatusSummary saleStatus,
        BigDecimal total
) {
    public static SaleSummary from(SaleEntity sale) {
        if (sale == null) return null;
        return new SaleSummary(
                sale.getSaleId(),
                sale.getRegistrationDate(),
                CustomerSummary.from(sale.getCustomer()),
                SaleStatusSummary.from(sale.getSaleStatus()),
                sale.getTotal()
        );
    }
}
