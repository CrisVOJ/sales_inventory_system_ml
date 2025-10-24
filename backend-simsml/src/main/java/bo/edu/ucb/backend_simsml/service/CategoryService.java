package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.category.CategoryResponse;
import bo.edu.ucb.backend_simsml.dto.category.CategorySummary;
import bo.edu.ucb.backend_simsml.dto.category.CreateCategoryRequest;
import bo.edu.ucb.backend_simsml.dto.category.UpdateCategoryRequest;
import bo.edu.ucb.backend_simsml.entity.CategoryEntity;
import bo.edu.ucb.backend_simsml.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public Object createCategory(CreateCategoryRequest request) {
        try {
            CategoryEntity category = new CategoryEntity();
            category.setName(request.name().trim());
            category.setDescription(request.description().trim());

            categoryRepository.save(category);
            return new SuccessfulResponse("201", "Categoria creada exitosamente", category.getName());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al crear categoria", e.getMessage());
        }
    }

    public Object getCategories(String filter, Boolean status, Pageable pageable) {
        try {
            Page<CategoryResponse> categories = categoryRepository.findAllCategories(filter, status, pageable)
                    .map(categoryResponse -> new CategoryResponse(
                            categoryResponse.getCategoryId(),
                            categoryResponse.getName(),
                            categoryResponse.getDescription(),
                            categoryResponse.isActive()
                    ));

            if (!categories.isEmpty()) {
                return new SuccessfulResponse("200", "Categorias encontradas", categories);
            }

            return new UnsuccessfulResponse("404", "No hay categorias registradas", null);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener categorias", e.getMessage());
        }
    }

    public Object getCategoriesSummary() {
        try {
            List<CategorySummary> categories = categoryRepository.findAllCategoriesSummary()
                    .stream().map(categorySummary -> new CategorySummary(
                            categorySummary.getCategoryId(),
                            categorySummary.getName()
                    )).toList();

            if (!categories.isEmpty()) {
                return new SuccessfulResponse("200", "Resumen de categorias encontradas", categories);
            }

            return new UnsuccessfulResponse("404", "No hay categorias registradas", null);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener resumen de categorias", e.getMessage());
        }
    }

    public Object getCategoryById(Long categoryId) {
        try {
            CategoryResponse category = categoryRepository.findById(categoryId)
                    .map(categoryResponse -> new CategoryResponse(
                            categoryResponse.getCategoryId(),
                            categoryResponse.getName(),
                            categoryResponse.getDescription(),
                            categoryResponse.isActive()
                    )).orElse(null);

            if (category != null) {
                return new SuccessfulResponse("200", "Categoria encontrada", category);
            }

            return new UnsuccessfulResponse("404", "Categoria no encontrada", null);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener categoria", e.getMessage());
        }
    }

    public Object updateCategory(UpdateCategoryRequest request) {
        try {
            CategoryEntity category = categoryRepository.findById(request.categoryId()).orElse(null);

            if (category == null) {
                return new UnsuccessfulResponse("404", "Categoria no encontrada", null);
            }

            category.setName(request.name().trim());
            category.setDescription(request.description().trim());

            categoryRepository.save(category);
            return new SuccessfulResponse("200", "Categoria actualizada", category.getName());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al actualizar categoria", e.getMessage());
        }
    }

    public Object disableCategory(Long categoryId) {
        try {
            CategoryEntity category = categoryRepository.findById(categoryId).orElse(null);

            if (category == null) {
                return new UnsuccessfulResponse("404", "Categoria no encontrada", null);
            }

            category.setActive(false);
            categoryRepository.save(category);
            return new SuccessfulResponse("200", "Categoria eliminada", category.getName());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al eliminar categoria", e.getMessage());
        }
    }
}
