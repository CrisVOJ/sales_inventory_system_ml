package bo.edu.ucb.backend_simsml.dto.purchase;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record UpdatePurchaseRequest(@NotNull Long purchaseId,
                                    @NotNull LocalDate date,
                                    @NotNull Long userId,
                                    @NotNull Long supplierId,
                                    @NotNull Long purchaseStatusId) {
}
