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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(SaleService.class);

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
    @Autowired
    private EmailService emailService;
    @Autowired
    private PredictionRepository predictionRepository;
    @Autowired
    private PredictionService predictionService;

    private InventoryEntity lockInventoryOrThrow(Long inventoryId) {
        return inventoryRepository.lockById(inventoryId)
                .orElseThrow(() -> new IllegalArgumentException("Inventario no encontrad"));
    }

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
                InventoryEntity inventory = lockInventoryOrThrow(saleItem.inventory());

                SaleDetailEntity saleDetail = new SaleDetailEntity();
                saleDetail.setInventory(inventory);
                saleDetail.setProductQuantity(saleItem.productQuantity());
                saleDetail.setUnitPrice(saleItem.unitPrice());

                var subtotal = saleItem.unitPrice().multiply(BigDecimal.valueOf(saleItem.productQuantity()));
                saleDetail.setSubtotal(subtotal);

                sale.addDetail(saleDetail);
                total = total.add(subtotal);

                inventory.setCurrentStock(inventory.getCurrentStock() - saleItem.productQuantity());

                checkAndNotifyLowStock(inventory);
            }

            sale.setTotal(total);

            saleRepository.save(sale);
            return new SuccessfulResponse("201", "Venta registrada exitosamente", sale.getSaleId());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al registrar venta", e.getMessage());
        }
    }

    public Object getSales(LocalDate startDate, LocalDate endDate, List<Integer> userIds, List<Integer> customerIds, List<Integer> statusIds, Pageable pageable) {
        try {
            Page<SaleResponse> sales = saleRepository.findAllSales(startDate, endDate, userIds, customerIds, statusIds, pageable)
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

    public Object getSalesWithDebts(Pageable pageable) {
        try {
            Page<SaleResponse> sales = saleRepository.findSalesWithDebts(pageable)
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
                return new UnsuccessfulResponse("404", "No existen ventas con deudas registradas", null);
            }

            return new SuccessfulResponse("200", "Ventas con deudas obtenidas exitosamente", sales);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener ventas con deudas", e.getMessage());
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
                    InventoryEntity inv = lockInventoryOrThrow(d.getInventory().getInventoryId());
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
                    InventoryEntity oldInventory = lockInventoryOrThrow(saleDetail.getInventory().getInventoryId());
                    InventoryEntity newInventory = oldInventory;

                    if (!saleDetail.getInventory().getInventoryId().equals(item.inventory())) {
                        newInventory = lockInventoryOrThrow(item.inventory());
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

                        checkAndNotifyLowStock(newInventory);
                    } else {
                        if (delta > 0) {
                            if (newInventory.getCurrentStock() < delta)
                                return new UnsuccessfulResponse("400", "Stock insuficiente en inventario", null);
                            newInventory.setCurrentStock(newInventory.getCurrentStock() - delta);

                            checkAndNotifyLowStock(newInventory);
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
                    InventoryEntity inventory = lockInventoryOrThrow(item.inventory());
                    if (inventory.getCurrentStock() < item.productQuantity()) {
                        return new UnsuccessfulResponse("400", "Stock insuficiente en inventario", null);
                    }

                    inventory.setCurrentStock(inventory.getCurrentStock() - item.productQuantity());

                    checkAndNotifyLowStock(inventory);

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
                InventoryEntity inventory = lockInventoryOrThrow(saleDetail.getInventory().getInventoryId());
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

    private void checkAndNotifyLowStock(InventoryEntity inventory) {
        try {
            Long minimumStock = inventory.getMinimumStock();
            if (minimumStock == null) {
                log.debug("Inventario {} no tiene minimo configurado.",
                        inventory.getInventoryId());
            } else {
                String sendTo = String.valueOf(userRepository.findById(1L).get().getEmail());

                if (inventory.getCurrentStock() <= minimumStock) {
                    log.info("Stock bajo detectado. Inventario {}: current={}, min={}",
                            inventory.getInventoryId(), inventory.getCurrentStock(), minimumStock);
                    emailService.sendLowStockAlert(inventory, sendTo);
                }
            }

            Long base = inventory.getBaseCapacity();
            if (base == null || base <= 0) {
                return;
            }

            double percent = (inventory.getCurrentStock().doubleValue() * 100.0) / base.doubleValue();
            int[] thresholds = new int[]{25, 50, 75};
            Integer triggered = null;
            for (int t : thresholds) {
                double thresholdStock = base * (t / 100.0);
                if (inventory.getCurrentStock() <= Math.floor(thresholdStock)) {
                    triggered = t;
                    break;
                }
            }

            if (triggered == null) return;

            Integer lastNotified = inventory.getLastNotifiedThreshold();

            if (lastNotified == null || lastNotified > triggered) {
                String sendTo = String.valueOf(userRepository.findById(1L).get().getEmail());

                if (triggered == 25) {
                    PredictionEntity nextMonthPrediction = predictionService.getNextMonthPredictionOrCreateNew(inventory.getInventoryId());

                    if (nextMonthPrediction.isActive() || nextMonthPrediction == null) {
                        log.debug("No se encontraron ni se pudieron realizar predicciones para el siguiente mes");
                    }

                    LocalDate endDate = LocalDate.now().withDayOfMonth(1);
                    LocalDate startDate = endDate.minusMonths(2);

                    List<Map<String, Object>> lastMonthlySales = saleRepository.findMonthlyDemandByInventoryAndDateRange(inventory.getInventoryId(), startDate, endDate);

                    if (lastMonthlySales.isEmpty()) {
                        log.debug("No se encontraron ventas de anteriores meses");
                    }

                    double predictionValue = nextMonthPrediction.getEstimatedAmount();

                    int monthsWithSales = 0;
                    double totalSales = 0.0;

                    for (Map<String, Object> sale : lastMonthlySales) {
                        Object quantity = sale.get("quantity");
                        if (quantity != null) {
                            double sales = ((Number) quantity).doubleValue();
                            if (sales > 0) {
                                totalSales += sales;
                                monthsWithSales++;
                            }
                        }
                    }

                    double average = (totalSales + predictionValue) / (monthsWithSales + 1);

                    emailService.sendCriticInventoryAlert(inventory, sendTo, triggered, Math.round(average));
                }
                long recommendedByBase = Math.max(0L, base - inventory.getCurrentStock());

                LocalDate start = LocalDate.now().withDayOfMonth(1);
                LocalDate end = LocalDate.now().plusMonths(3).withDayOfMonth(1);
                Long predictDemand = 0L;
                try {
                    predictDemand = predictionRepository.sumEstimatedAmountByInventoryAndRange(inventory.getInventoryId(), start, end);
                } catch (Exception e) {
                    log.debug("No se pudieron obtener predicciones para inventario {}: {}", inventory.getInventoryId());
                    predictDemand = 0L;
                }
                long recommendedFromPredictions = Math.max(0L, predictDemand - inventory.getCurrentStock());

                long recommended = recommendedByBase;
                boolean usedPredictions = false;
                if (predictDemand != null && predictDemand > 0 && recommendedFromPredictions > recommendedByBase) {
                    recommended = recommendedFromPredictions;
                    usedPredictions = true;
                }

                emailService.sendThresholdAlert(inventory, sendTo, triggered, recommended, usedPredictions);

                inventory.setLastNotifiedThreshold(triggered);
                inventoryRepository.save(inventory);
            }
        } catch (Exception e) {
            log.error("Error al verifica/enviar alerta de stock bajo para ingentario {}: {}",
                    inventory.getInventoryId(), e.getMessage(), e);
        }
    }
}
