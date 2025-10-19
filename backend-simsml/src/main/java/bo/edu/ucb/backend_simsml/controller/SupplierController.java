package bo.edu.ucb.backend_simsml.controller;

import bo.edu.ucb.backend_simsml.config.util.Globals;
import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.supplier.CreateSupplierRequest;
import bo.edu.ucb.backend_simsml.dto.supplier.UpdateSupplierRequest;
import bo.edu.ucb.backend_simsml.service.SupplierService;
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
@RequestMapping(Globals.baseApi + "supplier")
@PreAuthorize("hasRole('ADMIN')")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    @PostMapping("/create")
    public ResponseEntity<Object> createSupplier(@Valid @RequestBody CreateSupplierRequest request) {
        try {
            Object response = supplierService.createSupplier(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al crear proveedor", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Object> getSuppliers(
            @RequestParam(value = "filter", required = false) String filter,
            @RequestParam(value = "status", required = false) Boolean status,
            @PageableDefault(sort = "updatedAt", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        try {
            Object response = supplierService.getSuppliers(filter, status, pageable);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener proveedores", e.getMessage()));
        }
    }

    @GetMapping("/")
    public ResponseEntity<Object> getSupplier(@RequestParam("supplierId") Long supplierId) {
        try {
            Object response = supplierService.getSupplier(supplierId);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener proveedor", e.getMessage()));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Object> updateSupplier(@Valid @RequestBody UpdateSupplierRequest request) {
        try {
            Object response = supplierService.updateSupplier(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al actualizar proveedor", e.getMessage()));
        }
    }

    @DeleteMapping("/disable")
    public ResponseEntity<Object> disableSupplier(@RequestParam("supplierId") Long supplierId) {
        try {
            Object response = supplierService.disableSupplier(supplierId);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al eliminar proveedor", e.getMessage()));
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
