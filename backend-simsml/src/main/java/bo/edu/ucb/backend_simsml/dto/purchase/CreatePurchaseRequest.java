package bo.edu.ucb.backend_simsml.dto.purchase;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreatePurchaseRequest(@NotNull LocalDate date,
                                    @NotNull Long userId,
                                    @NotNull Long supplierId,
                                    @NotNull Long purchaseStatusId) {
}
