package bo.edu.ucb.backend_simsml.dto.purchaseDetail;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record UpdatePurchaseDetailRequest(@NotNull Long purchaseDetailId,
                                          @NotNull Integer productQuantity,
                                          BigDecimal unitPrice,
                                          @NotNull boolean active,
                                          @NotNull Long purchase,
                                          @NotNull Long inventory) {
}
