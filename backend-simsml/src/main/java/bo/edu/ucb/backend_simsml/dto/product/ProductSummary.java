package bo.edu.ucb.backend_simsml.dto.product;

import bo.edu.ucb.backend_simsml.entity.ProductEntity;

import java.math.BigDecimal;

public record ProductSummary(
        Long productId,
        String name,
        BigDecimal suggestedPrice
) {
    public static ProductSummary from(ProductEntity product) {
        if (product == null) return null;
        return new ProductSummary(product.getProductId(), product.getName(), product.getSuggestedPrice());
    }
}
