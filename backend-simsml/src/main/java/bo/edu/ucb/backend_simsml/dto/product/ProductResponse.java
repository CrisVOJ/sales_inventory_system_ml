package bo.edu.ucb.backend_simsml.dto.product;

import bo.edu.ucb.backend_simsml.dto.category.CategorySummary;
import bo.edu.ucb.backend_simsml.dto.unit.UnitResponse;

import java.math.BigDecimal;
import java.util.Set;

public record   ProductResponse(
        Long productId,
        String name,
        String description,
        String code,
        BigDecimal suggestedPrice,
        boolean active,
        Set<CategorySummary> categories,
        UnitResponse unit
) {
}
