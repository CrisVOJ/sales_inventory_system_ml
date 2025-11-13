package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.inventory.InventorySummary;
import bo.edu.ucb.backend_simsml.dto.purchase.PurchaseSummary;
import bo.edu.ucb.backend_simsml.dto.purchaseDetail.CreatePurchaseDetailRequest;
import bo.edu.ucb.backend_simsml.dto.purchaseDetail.PurchaseDetailResponse;
import bo.edu.ucb.backend_simsml.dto.purchaseDetail.UpdatePurchaseDetailRequest;
import bo.edu.ucb.backend_simsml.entity.InventoryEntity;
import bo.edu.ucb.backend_simsml.entity.PurchaseDetailEntity;
import bo.edu.ucb.backend_simsml.entity.PurchaseEntity;
import bo.edu.ucb.backend_simsml.repository.InventoryRepository;
import bo.edu.ucb.backend_simsml.repository.PurchaseDetailRepository;
import bo.edu.ucb.backend_simsml.repository.PurchaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PurchaseDetailService {

    @Autowired
    public PurchaseDetailRepository purchaseDetailRepository;
    @Autowired
    private PurchaseRepository purchaseRepository;
    @Autowired
    private InventoryRepository inventoryRepository;

    public Object createPurchaseDetail(CreatePurchaseDetailRequest request) {
        try {
            PurchaseEntity purchase = purchaseRepository.findById(request.purchase())
                    .orElse(null);
            if (purchase == null) {
                return new UnsuccessfulResponse("404", "Compra no encontrada", null);
            }

            InventoryEntity inventory = inventoryRepository.findById(request.inventory())
                    .orElse(null);
            if (inventory == null) {
                return new UnsuccessfulResponse("404", "Producto no encontrada", null);
            }

            PurchaseDetailEntity purchaseDetail = new PurchaseDetailEntity();
            purchaseDetail.setProductQuantity(request.productQuantity());
            purchaseDetail.setUnitPrice(request.unitPrice());
            purchaseDetail.setPurchase(purchase);
            purchaseDetail.setInventory(inventory);

            purchaseDetailRepository.save(purchaseDetail);
            return new SuccessfulResponse("201", "Detalle de compra registrado exitosamente", purchaseDetail.getPurchaseDetailId());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al registrar detalle de compra", e.getMessage());
        }
    }

    public Object getPurchasesDetails(Boolean status, Pageable pageable) {
        try {
            Page<PurchaseDetailResponse> purchasesDetails = purchaseDetailRepository.findAllPurchasesDetails(status, pageable)
                    .map(purchaseDetailResponse -> new PurchaseDetailResponse(
                            purchaseDetailResponse.getPurchaseDetailId(),
                            purchaseDetailResponse.getProductQuantity(),
                            purchaseDetailResponse.getUnitPrice(),
                            purchaseDetailResponse.isActive(),
                            PurchaseSummary.from(purchaseDetailResponse.getPurchase()),
                            InventorySummary.from(purchaseDetailResponse.getInventory())
                    ));
            if (purchasesDetails.isEmpty()) {
                return new UnsuccessfulResponse("404", "No se encontraron detalles de compras", null);
            }

            return new SuccessfulResponse("200", "Detalles de compras obtenidos exitosamente", purchasesDetails);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener detalles de compras", e.getMessage());
        }
    }

    public Object getPurchaseDetail(Long purchaseDetailId) {
        try {
            PurchaseDetailResponse purchaseDetail = purchaseDetailRepository.findById(purchaseDetailId)
                    .map(purchaseDetailResponse -> new PurchaseDetailResponse(
                            purchaseDetailResponse.getPurchaseDetailId(),
                            purchaseDetailResponse.getProductQuantity(),
                            purchaseDetailResponse.getUnitPrice(),
                            purchaseDetailResponse.isActive(),
                            PurchaseSummary.from(purchaseDetailResponse.getPurchase()),
                            InventorySummary.from(purchaseDetailResponse.getInventory())
                    ))
                    .orElse(null);
            if (purchaseDetail == null) {
                return new UnsuccessfulResponse("404", "Detalle de compra no encontrado", null);
            }

            return new SuccessfulResponse("200", "Detalle de compra obtenido exitosamente", purchaseDetail);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener el detalle de compra", e.getMessage());
        }
    }

    public Object updatePurchaseDetail(UpdatePurchaseDetailRequest request) {
        try {
            PurchaseDetailEntity purchaseDetail = purchaseDetailRepository.findById(request.purchaseDetailId())
                    .orElse(null);
            if (purchaseDetail == null) {
                return new UnsuccessfulResponse("404", "Detalle de compra no encontrado", null);
            }

            PurchaseEntity purchase = purchaseRepository.findById(request.purchase())
                    .orElse(null);
            if (purchase == null) {
                return new UnsuccessfulResponse("404", "Compra no encontrada", null);
            }

            InventoryEntity inventory = inventoryRepository.findById(request.inventory())
                    .orElse(null);
            if (inventory == null) {
                return new UnsuccessfulResponse("404", "Producto no encontrada", null);
            }

            purchaseDetail.setProductQuantity(request.productQuantity());
            purchaseDetail.setUnitPrice(request.unitPrice());
            purchaseDetail.setPurchase(purchase);
            purchaseDetail.setInventory(inventory);
            purchaseDetail.setActive(request.active());
            purchaseDetail.setUpdatedAt(LocalDateTime.now());

            purchaseDetailRepository.save(purchaseDetail);
            return new SuccessfulResponse("200", "Detalle de compra actualizado exitosamente", purchaseDetail.getPurchaseDetailId());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al actualizar detalle de compra", e.getMessage());
        }
    }

}
