package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.supplier.CreateSupplierRequest;
import bo.edu.ucb.backend_simsml.dto.supplier.SupplierResponse;
import bo.edu.ucb.backend_simsml.dto.supplier.UpdateSupplierRequest;
import bo.edu.ucb.backend_simsml.entity.SupplierEntity;
import bo.edu.ucb.backend_simsml.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    public Object createSupplier(CreateSupplierRequest request) {
        try {
            SupplierEntity supplier = new SupplierEntity();

            supplier.setName(request.name().trim());
            supplier.setContact(request.contact().trim());
            supplier.setEmail(request.email().trim());
            supplier.setPhone(request.phone().trim());
            supplier.setAddress(request.address().trim());

            supplierRepository.save(supplier);
            return new SuccessfulResponse("201", "Proveedor regitrado exitosamente", supplier.getName());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al agregar proveedor", e.getMessage());
        }
    }

    public Object getSuppliers(String filter, Boolean status, Pageable pageable) {
        try {
            Page<SupplierResponse> suppliers = supplierRepository.findAllSuppliers(filter, status, pageable)
                    .map(supplierResponse -> new SupplierResponse(
                            supplierResponse.getSupplierId(),
                            supplierResponse.getName(),
                            supplierResponse.getContact(),
                            supplierResponse.getEmail(),
                            supplierResponse.getPhone(),
                            supplierResponse.getAddress(),
                            supplierResponse.isActive()
                    ));

            if (suppliers.isEmpty()) {
                return new UnsuccessfulResponse("404", "No se encontraron proveedores registrados", null);
            }

            return new SuccessfulResponse("200", "Proveedores obtenidos exitosamente", suppliers);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener proveedores", e.getMessage());
        }
    }

    public Object getSupplier(Long supplierId) {
        try {
            SupplierResponse supplier = supplierRepository.findById(supplierId)
                    .map(supplierResponse -> new SupplierResponse(
                            supplierResponse.getSupplierId(),
                            supplierResponse.getName(),
                            supplierResponse.getContact(),
                            supplierResponse.getEmail(),
                            supplierResponse.getPhone(),
                            supplierResponse.getAddress(),
                            supplierResponse.isActive()
                    ))
                    .orElse(null);

            if (supplier == null) {
                return new UnsuccessfulResponse("404", "No se encontraron proveedor", null);
            }

            return new SuccessfulResponse("200", "Proveedor obtenido exitosamente", supplier);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener proveedor", e.getMessage());
        }
    }

    public Object updateSupplier(UpdateSupplierRequest request) {
        try {
            SupplierEntity supplier = supplierRepository.findById(request.supplierId())
                    .orElse(null);

            if (supplier == null) {
                return new UnsuccessfulResponse("404", "No se encontro al proveedor", null);
            }

            supplier.setName(request.name().trim());
            supplier.setContact(request.contact().trim());
            supplier.setEmail(request.email().trim());
            supplier.setPhone(request.phone().trim());
            supplier.setAddress(request.address().trim());
            supplier.setActive(request.active());
            supplier.setUpdatedAt(LocalDateTime.now());

            supplierRepository.save(supplier);
            return new SuccessfulResponse("200", "Proveedor actualizado exitosamente", supplier.getName());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al actualizar proveedor", e.getMessage());
        }
    }

    public Object disableSupplier(Long supplierId) {
        try {
            SupplierEntity supplier = supplierRepository.findById(supplierId)
                    .orElse(null);

            if (supplier == null) {
                return new UnsuccessfulResponse("404", "No se encontro al proveedor", null);
            }

            supplier.setActive(false);
            supplier.setUpdatedAt(LocalDateTime.now());

            supplierRepository.save(supplier);
            return new SuccessfulResponse("200", "Proveedor eliminado exitosamente", null);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al eliminar proveedor", e.getMessage());
        }
    }

}
