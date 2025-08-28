package bo.edu.ucb.backend_simsml.dto.sale;

import bo.edu.ucb.backend_simsml.dto.customer.CustomerSaleResponse;
import bo.edu.ucb.backend_simsml.dto.saleStatus.SaleStatusSummary;
import bo.edu.ucb.backend_simsml.dto.user.UserSaleResponse;

import java.time.LocalDate;

public record SaleResponse(
        Long saleId,
        LocalDate registrationDate,
        UserSaleResponse user,
        CustomerSaleResponse customer,
        SaleStatusSummary saleStatus
) {
}
