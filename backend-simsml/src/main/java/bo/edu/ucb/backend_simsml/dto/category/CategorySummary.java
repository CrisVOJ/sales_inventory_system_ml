package bo.edu.ucb.backend_simsml.dto.category;

import bo.edu.ucb.backend_simsml.entity.CategoryEntity;

public record CategorySummary(
        Long categoryId,
        String name
) {
    public static CategorySummary from(CategoryEntity category) {
        if (category == null) return null;
        return new CategorySummary(category.getCategoryId(), category.getName());
    }
}
