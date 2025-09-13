package bo.edu.ucb.backend_simsml.dto.purchaseDetail;

import bo.edu.ucb.backend_simsml.dto.product.ProductSummary;
import bo.edu.ucb.backend_simsml.dto.purchase.PurchaseSummary;

import java.math.BigDecimal;

public record PurchaseDetailResponse(
        Long purchaseDetailId,
        Integer productQuantity,
        BigDecimal unitPrice,
        boolean active,
        PurchaseSummary purchase,
        ProductSummary product
) {
}
