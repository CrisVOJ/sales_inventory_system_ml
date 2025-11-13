package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.purchase.CreatePurchaseRequest;
import bo.edu.ucb.backend_simsml.dto.purchase.PurchaseResponse;
import bo.edu.ucb.backend_simsml.dto.purchase.UpdatePurchaseRequest;
import bo.edu.ucb.backend_simsml.dto.purchaseStatus.PurchaseStatusSummary;
import bo.edu.ucb.backend_simsml.dto.supplier.SupplierSummary;
import bo.edu.ucb.backend_simsml.dto.user.UserSummary;
import bo.edu.ucb.backend_simsml.entity.PurchaseEntity;
import bo.edu.ucb.backend_simsml.entity.PurchaseStatusEntity;
import bo.edu.ucb.backend_simsml.entity.SupplierEntity;
import bo.edu.ucb.backend_simsml.entity.UserEntity;
import bo.edu.ucb.backend_simsml.repository.PurchaseRepository;
import bo.edu.ucb.backend_simsml.repository.PurchaseStatusRepository;
import bo.edu.ucb.backend_simsml.repository.SupplierRepository;
import bo.edu.ucb.backend_simsml.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class PurchaseService {

    @Autowired
    private PurchaseRepository purchaseRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SupplierRepository supplierRepository;
    @Autowired
    private PurchaseStatusRepository purchaseStatusRepository;

    public Object createPurchase(CreatePurchaseRequest request) {
        try {
            UserEntity user = userRepository.findById(request.userId())
                    .orElse(null);
            if (user == null) {
                return new UnsuccessfulResponse("404", "Usuario no encontrado", null);
            }

            SupplierEntity supplier = supplierRepository.findById(request.supplierId())
                    .orElse(null);
            if (supplier == null) {
                return new UnsuccessfulResponse("404", "Proveedor no encontrado", null);
            }

            PurchaseStatusEntity purchaseStatus = purchaseStatusRepository.findById(request.purchaseStatusId())
                    .orElse(null);
            if (purchaseStatus == null) {
                return new UnsuccessfulResponse("404", "Estado no encontrado", null);
            }

            PurchaseEntity purchase = new PurchaseEntity();
            purchase.setDate(request.date());
            purchase.setUser(user);
            purchase.setSupplier(supplier);
            purchase.setPurchaseStatus(purchaseStatus);

            purchaseRepository.save(purchase);
            return new SuccessfulResponse("201", "Compra registrada exitosamente", purchase.getPurchaseId());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al registrar compra", e.getMessage());
        }
    }

    public Object getPurchases(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        try {
            Page<PurchaseResponse> purchases = purchaseRepository.findAllPurchases(startDate, endDate, pageable)
                    .map(purchaseResponse -> new PurchaseResponse(
                            purchaseResponse.getPurchaseId(),
                            purchaseResponse.getDate(),
                            UserSummary.from(purchaseResponse.getUser()),
                            SupplierSummary.fromEntity(purchaseResponse.getSupplier()),
                            PurchaseStatusSummary.from(purchaseResponse.getPurchaseStatus())
                    ));
            if (purchases.isEmpty()) {
                return new UnsuccessfulResponse("404", "No se encontraron compras", null);
            }

            return new SuccessfulResponse("200", "Compras obtenidas exitosamente", purchases);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener compras", e.getMessage());
        }
    }

    public Object getPurchase(Long purchaseId) {
        try {
            PurchaseResponse purchase = purchaseRepository.findById(purchaseId)
                    .map(purchaseResponse -> new PurchaseResponse(
                            purchaseResponse.getPurchaseId(),
                            purchaseResponse.getDate(),
                            UserSummary.from(purchaseResponse.getUser()),
                            SupplierSummary.fromEntity(purchaseResponse.getSupplier()),
                            PurchaseStatusSummary.from(purchaseResponse.getPurchaseStatus())
                    ))
                    .orElse(null);
            if (purchase == null) {
                return new UnsuccessfulResponse("404", "Compra no encontrada", null);
            }

            return new SuccessfulResponse("200", "Compra obtenida exitosamente", purchase);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener compra", e.getMessage());
        }
    }

    public Object updatePurchase(UpdatePurchaseRequest request) {
        try {
            PurchaseEntity purchase = purchaseRepository.findById(request.purchaseId())
                    .orElse(null);
            if (purchase == null) {
                return new UnsuccessfulResponse("404", "Compra no encontrada", null);
            }

            UserEntity user = userRepository.findById(request.userId())
                    .orElse(null);
            if (user == null) {
                return new UnsuccessfulResponse("404", "Usuario no encontrado", null);
            }

            SupplierEntity supplier = supplierRepository.findById(request.supplierId())
                    .orElse(null);
            if (supplier == null) {
                return new UnsuccessfulResponse("404", "Proveedor no encontrado", null);
            }

            PurchaseStatusEntity purchaseStatus = purchaseStatusRepository.findById(request.purchaseStatusId())
                    .orElse(null);
            if (purchaseStatus == null) {
                return new UnsuccessfulResponse("404", "Estado no encontrado", null);
            }

            purchase.setDate(request.date());
            purchase.setUser(user);
            purchase.setSupplier(supplier);
            purchase.setPurchaseStatus(purchaseStatus);
            purchase.setUpdatedAt(LocalDateTime.now());

            purchaseRepository.save(purchase);
            return new SuccessfulResponse("200", "Compra actualizada exitosamente", purchase.getPurchaseId());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al actualizar compra", e.getMessage());
        }
    }

}
