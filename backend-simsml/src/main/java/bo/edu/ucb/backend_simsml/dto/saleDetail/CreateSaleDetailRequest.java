package bo.edu.ucb.backend_simsml.dto.saleDetail;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateSaleDetailRequest(@NotNull Integer productQuantity,
                                      @NotNull BigDecimal unitPrice,
                                      @NotNull Long sale,
                                      @NotNull Long inventory) {
}
