package bo.edu.ucb.backend_simsml.dto.saleDetail;

import bo.edu.ucb.backend_simsml.dto.product.ProductSummary;
import bo.edu.ucb.backend_simsml.dto.sale.SaleSummary;

import java.math.BigDecimal;

public record SaleDetailResponse(
        Long saleDetailId,
        Integer productQuantity,
        BigDecimal unitPrice,
        boolean active,
        SaleSummary sale,
        ProductSummary product
) {
}
