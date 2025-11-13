package bo.edu.ucb.backend_simsml.dto.purchaseDetail;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreatePurchaseDetailRequest(@NotNull Integer productQuantity,
                                          BigDecimal unitPrice,
                                          @NotNull Long purchase,
                                          @NotNull Long inventory) {
}
