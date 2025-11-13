package bo.edu.ucb.backend_simsml.dto.sale;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record UpdateSaleRequest(
        @NotNull Long saleId,
        @NotNull @PastOrPresent LocalDate registrationDate,
        @NotNull Long customer,
        @NotNull Long saleStatus,
        @NotEmpty List<UpdateSaleItem> saleItems
) {
    public record UpdateSaleItem (
            Long saleDetailId,
            @NotNull Long inventory,
            @NotNull @Min(1) Integer productQuantity,
            @NotNull @DecimalMin("0.00") @Digits(integer = 16, fraction = 2) BigDecimal unitPrice
    ) { }
}
