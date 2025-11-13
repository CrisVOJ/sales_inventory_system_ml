package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.customer.CustomerSummary;
import bo.edu.ucb.backend_simsml.dto.inventory.InventorySummary;
import bo.edu.ucb.backend_simsml.dto.sale.CreateSaleRequest;
import bo.edu.ucb.backend_simsml.dto.sale.SaleResponse;
import bo.edu.ucb.backend_simsml.dto.sale.UpdateSaleRequest;
import bo.edu.ucb.backend_simsml.dto.saleStatus.SaleStatusSummary;
import bo.edu.ucb.backend_simsml.dto.user.UserSummary;
import bo.edu.ucb.backend_simsml.entity.*;
import bo.edu.ucb.backend_simsml.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private SaleStatusRepository saleStatusRepository;
    @Autowired
    private InventoryRepository inventoryRepository;

    @Transactional(rollbackFor = Exception.class)
    public Object createSale(CreateSaleRequest request, Long userId) {
        try {
            UserEntity user = userRepository.findById(userId)
                    .orElse(null);

            if (user == null) {
                return new UnsuccessfulResponse("404", "Usuario no encontrado", null);
            }

            CustomerEntity customer = customerRepository.findById(request.customer())
                    .orElse(null);

            if (customer == null) {
                return new UnsuccessfulResponse("404", "Cliente no encontrado", null);
            }

            SaleStatusEntity saleStatus = saleStatusRepository.findById(request.saleStatus())
                    .orElse(null);

            if (saleStatus == null) {
                return new UnsuccessfulResponse("404", "Estado no encontrado", null);
            }

            SaleEntity sale = new SaleEntity();
            sale.setRegistrationDate(request.registrationDate() != null ? request.registrationDate() : LocalDate.now());
            sale.setUser(user);
            sale.setCustomer(customer);
            sale.setSaleStatus(saleStatus);

            BigDecimal total = BigDecimal.ZERO;

            for (var saleItem : request.saleItems()) {
                InventoryEntity inventory = inventoryRepository.lockById(saleItem.inventory())
                        .orElseThrow(() -> new IllegalArgumentException("Inventario no encontrado"));

                SaleDetailEntity saleDetail = new SaleDetailEntity();
                saleDetail.setInventory(inventory);
                saleDetail.setProductQuantity(saleItem.productQuantity());
                saleDetail.setUnitPrice(saleItem.unitPrice());

                var subtotal = saleItem.unitPrice().multiply(BigDecimal.valueOf(saleItem.productQuantity()));
                saleDetail.setSubtotal(subtotal);

                sale.addDetail(saleDetail);
                total = total.add(subtotal);

                inventory.setCurrentStock(inventory.getCurrentStock() - saleItem.productQuantity());
            }

            sale.setTotal(total);

            saleRepository.save(sale);
            return new SuccessfulResponse("201", "Venta registrada exitosamente", sale.getSaleId());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al registrar venta", e.getMessage());
        }
    }

    public Object getSales(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        try {
            Page<SaleResponse> sales = saleRepository.findAllSales(startDate, endDate, pageable)
                    .map(saleResposne -> new SaleResponse(
                            saleResposne.getSaleId(),
                            saleResposne.getRegistrationDate(),
                            UserSummary.from(saleResposne.getUser()),
                            CustomerSummary.from(saleResposne.getCustomer()),
                            SaleStatusSummary.from(saleResposne.getSaleStatus()),
                            saleResposne.getTotal(),
                            null
                    ));

            if (sales.isEmpty()) {
                return new UnsuccessfulResponse("404", "No existen ventas registradas", null);
            }

            return new SuccessfulResponse("200", "Ventas obtenidas exitosamente", sales);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener ventas", e.getMessage());
        }
    }

    public Object getSale(Long saleId) {
        try {
            var opt = saleRepository.findOneWithDetails(saleId);
            if (opt.isEmpty()) {
                return new UnsuccessfulResponse("404", "Venta no encontrada", null);
            }

            var sale = opt.get();
            List<SaleResponse.SaleItemResponse> itemsResponse = sale.getSaleDetails()
                    .stream().map(detail -> new SaleResponse.SaleItemResponse(
                            detail.getSaleDetailId(),
                            InventorySummary.from(detail.getInventory()),
                            detail.getProductQuantity(),
                            detail.getUnitPrice(),
                            detail.getSubtotal(),
                            detail.isActive()
                    )).toList();

            SaleResponse saleResponse = new SaleResponse(
                    sale.getSaleId(),
                    sale.getRegistrationDate(),
                    UserSummary.from(sale.getUser()),
                    CustomerSummary.from(sale.getCustomer()),
                    SaleStatusSummary.from(sale.getSaleStatus()),
                    sale.getTotal(),
                    itemsResponse
            );

            return new SuccessfulResponse("200", "Venta ob5tenida exitosamente", saleResponse);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener venta", e.getMessage());
        }
    }

    @Transactional
    public Object updateSale(UpdateSaleRequest request) {
        try {
            // Buscar la venta existente
            SaleEntity sale = saleRepository.findOneWithDetails(request.saleId())
                    .orElse(null);

            if (sale == null) {
                return new UnsuccessfulResponse("404", "Venta no encontrada", null);
            }

            // Validar estado editable
            String statusName = sale.getSaleStatus().getName().toUpperCase();
            if (statusName.equals("PAGADO") || statusName.equals("ANULADO")) {
                return new UnsuccessfulResponse("400", "La venta no puede ser modificada en su estado actual", null);
            }

            // Validar y actualizar campos
            CustomerEntity customer = customerRepository.findById(request.customer())
                    .orElse(null);

            if (customer == null) {
                return new UnsuccessfulResponse("404", "Cliente no encontrado", null);
            }

            SaleStatusEntity saleStatus = saleStatusRepository.findById(request.saleStatus())
                    .orElse(null);

            if (saleStatus == null) {
                return new UnsuccessfulResponse("404", "Estado no encontrado", null);
            }

            if (saleStatus.getName().equalsIgnoreCase("ANULADO")) {
                for (SaleDetailEntity d : sale.getSaleDetails()) {
                    InventoryEntity inv = inventoryRepository.lockById(d.getInventory().getInventoryId())
                            .orElseThrow(() -> new IllegalStateException("Inventario no encontrado"));
                    inv.setCurrentStock(inv.getCurrentStock() + d.getProductQuantity());
                    d.setActive(false);
                }
                sale.setRegistrationDate(request.registrationDate());
                sale.setCustomer(customer);
                sale.setSaleStatus(saleStatus);
                sale.recomputeTotal();
                sale.setUpdatedAt(LocalDateTime.now());
                saleRepository.save(sale);
                return new SuccessfulResponse("200", "Venta anulada y stock restituido", sale.getSaleId());
            }

            sale.setRegistrationDate(request.registrationDate());
            sale.setCustomer(customer);
            sale.setSaleStatus(saleStatus);

            // Actualizar detalles de la venta
            Map<Long, SaleDetailEntity> existingById = sale.getSaleDetails().stream()
                            .collect(Collectors.toMap(SaleDetailEntity::getSaleDetailId, sd -> sd));

            List<UpdateSaleRequest.UpdateSaleItem> incoming = request.saleItems();

            Set<Long> keepIds = new HashSet<Long>();

            LinkedHashMap<String, UpdateSaleRequest.UpdateSaleItem> merged = new LinkedHashMap<String, UpdateSaleRequest.UpdateSaleItem>();
            for (UpdateSaleRequest.UpdateSaleItem item : incoming) {
                String key = (item.inventory()).toString();
                UpdateSaleRequest.UpdateSaleItem prev = merged.get(key);
                if (prev == null) merged.put(key, item);
                else {
                    merged.put(key, new UpdateSaleRequest.UpdateSaleItem(
                            null,
                            item.inventory(),
                            prev.productQuantity() + item.productQuantity(),
                            item.unitPrice()
                    ));
                }
            }
            List<UpdateSaleRequest.UpdateSaleItem> items = new ArrayList<>(merged.values());

            for (UpdateSaleRequest.UpdateSaleItem item : items) {
                if (item.saleDetailId() != null && existingById.containsKey(item.saleDetailId())) {
                    SaleDetailEntity saleDetail = existingById.get(item.saleDetailId());
                    InventoryEntity oldInventory = inventoryRepository.lockById(saleDetail.getInventory().getInventoryId())
                            .orElseThrow(() -> new IllegalStateException("Inventario anterior no encontrado"));
                    InventoryEntity newInventory = oldInventory;

                    if (!saleDetail.getInventory().getInventoryId().equals(item.inventory())) {
                        newInventory = inventoryRepository.lockById(item.inventory())
                                .orElseThrow(() -> new IllegalArgumentException("Inventario no encontrado"));
                    }

                    int oldQuantity = saleDetail.getProductQuantity();
                    int newQuantity = item.productQuantity();
                    int delta = newQuantity - oldQuantity;

                    if (!oldInventory.getInventoryId().equals(newInventory.getInventoryId())) {
                        oldInventory.setCurrentStock(oldInventory.getCurrentStock() + oldQuantity);
                        if (newInventory.getCurrentStock() < newQuantity) {
                            return new UnsuccessfulResponse("400", "Stock insuficiente en inventario", null);
                        }
                        newInventory.setCurrentStock(newInventory.getCurrentStock() - newQuantity);
                    } else {
                        if (delta > 0) {
                            if (newInventory.getCurrentStock() < delta)
                                return new UnsuccessfulResponse("400", "Stock insuficiente en inventario", null);
                            newInventory.setCurrentStock(newInventory.getCurrentStock() - delta);
                        } else if (delta < 0) {
                            newInventory.setCurrentStock(newInventory.getCurrentStock() + (-delta));
                        }
                    }

                    saleDetail.setInventory(newInventory);
                    saleDetail.setProductQuantity(newQuantity);
                    saleDetail.setUnitPrice(item.unitPrice());
                    saleDetail.setSubtotal(item.unitPrice().multiply(BigDecimal.valueOf(newQuantity)));
                    saleDetail.setUpdatedAt(LocalDateTime.now());

                    keepIds.add(saleDetail.getSaleDetailId());
                } else {
                    InventoryEntity inventory = inventoryRepository.lockById(item.inventory())
                            .orElseThrow(() -> new IllegalArgumentException("Inventario no encontrado"));
                    if (inventory.getCurrentStock() < item.productQuantity()) {
                        return new UnsuccessfulResponse("400", "Stock insuficiente en inventario", null);
                    }

                    inventory.setCurrentStock(inventory.getCurrentStock() - item.productQuantity());

                    SaleDetailEntity saleDetail = new SaleDetailEntity();
                    saleDetail.setInventory(inventory);
                    saleDetail.setProductQuantity(item.productQuantity());
                    saleDetail.setUnitPrice(item.unitPrice());
                    saleDetail.setSubtotal(item.unitPrice().multiply(BigDecimal.valueOf(item.productQuantity())));
                    sale.addDetail(saleDetail);
                }
            }

            List<SaleDetailEntity> toRemove = sale.getSaleDetails().stream()
                            .filter(saleDetail -> !keepIds.contains(saleDetail.getSaleDetailId())
                                            && items.stream().noneMatch(item -> item.saleDetailId().equals(saleDetail.getSaleDetailId())))
                                    .toList();

            for (SaleDetailEntity saleDetail : toRemove) {
                InventoryEntity inventory = inventoryRepository.lockById(saleDetail.getInventory().getInventoryId())
                        .orElseThrow(() -> new IllegalStateException("Inventario no encontrado"));
                inventory.setCurrentStock(inventory.getCurrentStock() + saleDetail.getProductQuantity());
                sale.removeDetail(saleDetail);
            }

            sale.recomputeTotal();
            sale.setUpdatedAt(LocalDateTime.now());
            saleRepository.save(sale);
            return new SuccessfulResponse("200", "Venta actualizada exitosamente", sale.getSaleId());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al actualizar venta", e.getMessage());
        }
    }
}
