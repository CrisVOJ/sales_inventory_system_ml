package bo.edu.ucb.backend_simsml.controller;

import bo.edu.ucb.backend_simsml.config.util.Globals;
import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.category.CreateCategoryRequest;
import bo.edu.ucb.backend_simsml.dto.category.UpdateCategoryRequest;
import bo.edu.ucb.backend_simsml.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(Globals.baseApi + "category")
@PreAuthorize("hasRole('ADMIN')")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @PostMapping("/create")
    public ResponseEntity<Object> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        try {
            Object response = categoryService.createCategory(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al crear categoria", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Object> getCategories(
            @RequestParam(value = "filter", required = false) String filter,
            @RequestParam(value = "status", required = false) Boolean status,
            @PageableDefault(sort = "name", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        try {
            Object response = categoryService.getCategories(filter, status, pageable);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener categorias", e.getMessage()));
        }
    }

    @GetMapping("/allSummary")
    public ResponseEntity<Object> getCategoriesSummary() {
        try {
            Object response = categoryService.getCategoriesSummary();
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener resumen de categorias", e.getMessage()));
        }
    }

    @GetMapping("/")
    public ResponseEntity<Object> getCategory(@RequestParam("categoryId") Long categoryId) {
        try {
            Object response = categoryService.getCategoryById(categoryId);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener categoria", e.getMessage()));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Object> updateCategory(@Valid @RequestBody UpdateCategoryRequest request) {
        try {
            Object response = categoryService.updateCategory(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al actualizar categoria", e.getMessage()));
        }
    }

    @DeleteMapping("/disable")
    public ResponseEntity<Object> disableCategory(@RequestParam("categoryId") Long categoryId) {
        try {
            Object response = categoryService.disableCategory(categoryId);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al deshabilitar categoria", e.getMessage()));
        }
    }

    private ResponseEntity<Object> generateResponse(Object response) {
        if (response instanceof SuccessfulResponse) {
            return ResponseEntity.ok(response);
        } else if (response instanceof UnsuccessfulResponse) {
            return ResponseEntity.status(Integer.parseInt(((UnsuccessfulResponse) response).getStatus()))
                    .body(response);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
