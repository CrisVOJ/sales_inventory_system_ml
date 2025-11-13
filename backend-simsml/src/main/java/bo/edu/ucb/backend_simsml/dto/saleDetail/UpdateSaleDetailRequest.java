package bo.edu.ucb.backend_simsml.dto.saleDetail;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record UpdateSaleDetailRequest(@NotNull Long saleDetailId,
                                      @NotNull Integer productQuantity,
                                      @NotNull BigDecimal unitPrice,
                                      @NotNull boolean active,
                                      @NotNull Long sale,
                                      @NotNull Long inventory) {
}
