package bo.edu.ucb.backend_simsml.dto.product;

import bo.edu.ucb.backend_simsml.entity.ProductEntity;

public record ProductSummary(
        Long productId,
        String name
) {
    public static ProductSummary from(ProductEntity product) {
        if (product == null) return null;
        return new ProductSummary(product.getProductId(), product.getName());
    }
}
