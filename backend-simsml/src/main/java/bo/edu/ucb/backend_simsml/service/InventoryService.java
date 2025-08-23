package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.inventory.CreateInventoryRequest;
import bo.edu.ucb.backend_simsml.dto.inventory.InventoryResponse;
import bo.edu.ucb.backend_simsml.dto.inventory.UpdateInventoryRequest;
import bo.edu.ucb.backend_simsml.dto.product.ProductSummary;
import bo.edu.ucb.backend_simsml.entity.InventoryEntity;
import bo.edu.ucb.backend_simsml.entity.ProductEntity;
import bo.edu.ucb.backend_simsml.repository.InventoryRepository;
import bo.edu.ucb.backend_simsml.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;
    @Autowired
    private ProductRepository productRepository;

    public Object createInventory(CreateInventoryRequest request) {
        try {
            ProductEntity product = productRepository.findById(request.productId())
                    .orElse(null);

            if (product == null) {
                return new UnsuccessfulResponse("404", "No se pudo encontrar el producto", null);
            }

            InventoryEntity inventory = new InventoryEntity();
            inventory.setCurrentStock(request.currentStock());
            inventory.setMinimumStock(request.minimumStock());
            inventory.setLocation(request.location().trim());
            inventory.setProduct(product);

            inventoryRepository.save(inventory);
            return new SuccessfulResponse("201", "Inventario creado exitosamente", inventory.getInventoryId());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al crear inventario", e.getMessage());
        }
    }

    public Object getInventories(String filter, Boolean status, Pageable pageable) {
        try {
            Page<InventoryResponse> inventories = inventoryRepository.findAllInventories(filter, status, pageable)
                    .map(inventoryResponse -> new InventoryResponse(
                            inventoryResponse.getInventoryId(),
                            inventoryResponse.getCurrentStock(),
                            inventoryResponse.getMinimumStock(),
                            inventoryResponse.getLocation(),
                            ProductSummary.from(inventoryResponse.getProduct()),
                            inventoryResponse.isActive()
                    ));

            if (inventories.isEmpty()) {
                return new UnsuccessfulResponse("404", "No se encontraron inventarios registrados", null);
            }

            return new SuccessfulResponse("200", "Inventarios encontrados", inventories);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener los inventarios", e.getMessage());
        }
    }

    public Object getInventory(Long inventoryId) {
        try {
            InventoryResponse inventory = inventoryRepository.findById(inventoryId)
                    .map(inventoryResponse -> new InventoryResponse(
                            inventoryResponse.getInventoryId(),
                            inventoryResponse.getCurrentStock(),
                            inventoryResponse.getMinimumStock(),
                            inventoryResponse.getLocation(),
                            ProductSummary.from(inventoryResponse.getProduct()),
                            inventoryResponse.isActive()
                    )).orElse(null);

            if (inventory != null) {
                return new SuccessfulResponse("200", "Inventario encontrado exitosamente", inventory);
            }

            return new UnsuccessfulResponse("404", "No se pudo encontrar el producto", null);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener el inventario", e.getMessage());
        }
    }

    public Object updateInventory(UpdateInventoryRequest request) {
        try {
            ProductEntity product = productRepository.findById(request.productId())
                    .orElse(null);

            if (product == null) {
                return new UnsuccessfulResponse("404", "No se pudo encontrar el producto", null);
            }

            InventoryEntity inventory = inventoryRepository.findById(request.inventoryId())
                    .orElse(null);

            if (inventory == null) {
                return new UnsuccessfulResponse("404", "No se pudo encontrar el inventario", null);
            }

            inventory.setCurrentStock(request.currentStock());
            inventory.setMinimumStock(request.minimumStock());
            inventory.setLocation(request.location().trim());
            inventory.setProduct(product);
            inventory.setActive(request.active());
            inventory.setUpdatedAt(LocalDateTime.now());

            inventoryRepository.save(inventory);
            return new SuccessfulResponse("200", "Inventario actualizado exitosamente", inventory.getInventoryId());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al actualizar inventario", e.getMessage());
        }
    }

    public Object disableInventory(Long inventoryId) {
        try {
            InventoryEntity inventory = inventoryRepository.findById(inventoryId)
                    .orElse(null);

            if (inventory == null) {
                return new UnsuccessfulResponse("404", "No se pudo encontrar el inventario", null);
            }

            inventory.setActive(false);
            inventory.setUpdatedAt(LocalDateTime.now());
            inventoryRepository.save(inventory);

            return new SuccessfulResponse("200", "Inventario eliminado exitosamente", null);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al eliminar inventario", e.getMessage());
        }
    }
}
