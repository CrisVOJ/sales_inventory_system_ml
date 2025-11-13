package bo.edu.ucb.backend_simsml.dto.sale;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreateSaleRequest(
        @NotNull @PastOrPresent LocalDate registrationDate,
        @NotNull Long customer,
        Long saleStatus,
        @NotEmpty List<CreateSaleItem> saleItems
) {
    public record CreateSaleItem (
            @NotNull Long inventory,
            @NotNull Integer productQuantity,
            @NotNull @DecimalMin(value = "0.00") @Digits(integer = 16, fraction = 2) BigDecimal unitPrice
    ) {}
}
