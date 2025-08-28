package bo.edu.ucb.backend_simsml.dto.sale;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateSaleRequest(@NotNull LocalDate registrationDate,
                                @NotNull Long userId,
                                @NotNull Long customerId,
                                @NotNull Long saleStatusId) {
}
