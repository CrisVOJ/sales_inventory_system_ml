package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.category.CategorySummary;
import bo.edu.ucb.backend_simsml.dto.product.CreateProductRequest;
import bo.edu.ucb.backend_simsml.dto.product.ProductResponse;
import bo.edu.ucb.backend_simsml.dto.product.UpdateProductRequest;
import bo.edu.ucb.backend_simsml.dto.unit.UnitResponse;
import bo.edu.ucb.backend_simsml.entity.CategoryEntity;
import bo.edu.ucb.backend_simsml.entity.ProductEntity;
import bo.edu.ucb.backend_simsml.entity.UnitEntity;
import bo.edu.ucb.backend_simsml.repository.CategoryRepository;
import bo.edu.ucb.backend_simsml.repository.ProductRepository;
import bo.edu.ucb.backend_simsml.repository.UnitRepository;
import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private UnitRepository unitRepository;

    public Object createProduct(CreateProductRequest request) {
        try {
            List<CategoryEntity> found = categoryRepository.findAllById(request.categories());

            Set<Long> foundIds = found.stream()
                    .map(CategoryEntity::getCategoryId)
                    .collect(Collectors.toSet());

            Set<Long> missing = new HashSet<>(request.categories());
            missing.removeAll(foundIds);
            if (!missing.isEmpty()) {
                throw new BadRequestException("Categorias inexistentes" + missing);
            }

            UnitEntity unit = unitRepository.findById(request.unitId()).orElse(null);

            if (unit == null) {
                return new UnsuccessfulResponse("404", "Unidad no encontrada", null);
            }

            ProductEntity product = new ProductEntity();
            product.setName(request.name().trim());
            product.setDescription(request.description().trim());
            product.setCode(request.code().trim());
            product.setSuggestedPrice(request.suggestedPrice());
            product.getCategories().addAll(found);
            product.setUnit(unit);

            productRepository.save(product);
            return new SuccessfulResponse("201", "Producto registrado exitosamente", product.getName());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al crear producto", e.getMessage());
        }
    }

    public Object getProducts(String filter, Boolean status, Pageable pageable) {
        try {
            Page<ProductResponse> products = productRepository.findAllProducts(filter, status, pageable)
                    .map(productResponse -> new ProductResponse(
                            productResponse.getProductId(),
                            productResponse.getName(),
                            productResponse.getDescription(),
                            productResponse.getCode(),
                            productResponse.getSuggestedPrice(),
                            productResponse.isActive(),
                            productResponse.getCategories()
                                    .stream()
                                    .map(CategorySummary::from)
                                    .collect(Collectors.toSet()),
                            UnitResponse.from(productResponse.getUnit())
                    ));

            if (products.isEmpty()) {
                return new UnsuccessfulResponse("404", "No se encontraron productos", null);
            }

            return new SuccessfulResponse("200", "Productos encontrados exitosamente", products);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener los productos", e.getMessage());
        }
    }

    public Object getProduct(Long productId) {
        try {
            ProductResponse product = productRepository.findById(productId)
                    .map(productResponse -> new ProductResponse(
                            productResponse.getProductId(),
                            productResponse.getName(),
                            productResponse.getDescription(),
                            productResponse.getCode(),
                            productResponse.getSuggestedPrice(),
                            productResponse.isActive(),
                            productResponse.getCategories()
                                    .stream()
                                    .map(CategorySummary::from)
                                    .collect(Collectors.toSet()),
                            UnitResponse.from(productResponse.getUnit())
                    )).orElse(null);

            if (product == null) {
                return new UnsuccessfulResponse("404", "No se encontro el producto", null);
            }

            return new SuccessfulResponse("200", "Producto encontrado", product);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener producto", e.getMessage());
        }
    }

    public Object updateProduct(UpdateProductRequest request) {
        try {
            List<CategoryEntity> found = categoryRepository.findAllById(request.categories());

            Set<Long> foundIds = found.stream()
                    .map(CategoryEntity::getCategoryId)
                    .collect(Collectors.toSet());

            Set<Long> missing = new HashSet<>(request.categories());
            missing.removeAll(foundIds);
            if (!missing.isEmpty()) {
                throw new BadRequestException("Categorias inexistentes" + missing);
            }

            UnitEntity unit = unitRepository.findById(request.unitId()).orElse(null);

            if (unit == null) {
                return new UnsuccessfulResponse("404", "Unidad no encontrada", null);
            }

            ProductEntity product = productRepository.findById(request.productId())
                    .orElse(null);

            if (product == null) {
                return new UnsuccessfulResponse("404", "No se encontro el producto", null);
            }

            product.setName(request.name().trim());
            product.setDescription(request.description().trim());
            product.setCode(request.code().trim());
            product.setSuggestedPrice(request.suggestedPrice());
            product.setActive(request.active());
            product.getCategories().clear();
            product.getCategories().addAll(found);
            product.setUnit(unit);

            productRepository.save(product);
            return new SuccessfulResponse("200", "Producto actualizado exitosamente", product.getName());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al actualizar el producto", e.getMessage());
        }
    }

    public Object disableProduct(Long productId) {
        try {
            ProductEntity product = productRepository.findById(productId)
                    .orElse(null);

            if (product == null) {
                return new UnsuccessfulResponse("404", "No se encontro el producto", null);
            }

            product.setActive(false);

            productRepository.save(product);
            return new SuccessfulResponse("200", "Producto eliminado exitosamente", null);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al eliminar el producto", e.getMessage());
        }
    }
}
