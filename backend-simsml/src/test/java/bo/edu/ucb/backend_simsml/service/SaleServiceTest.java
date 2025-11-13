package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.sale.CreateSaleRequest;
import bo.edu.ucb.backend_simsml.dto.sale.UpdateSaleRequest;
import bo.edu.ucb.backend_simsml.entity.*;
import bo.edu.ucb.backend_simsml.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SaleServiceTest {

    @InjectMocks
    private SaleService saleService;

    @Mock
    private SaleRepository saleRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private SaleStatusRepository saleStatusRepository;
    @Mock
    private InventoryRepository inventoryRepository;

    private UserEntity user;
    private CustomerEntity customer;
    private SaleStatusEntity saleStatus;
    private InventoryEntity inventory;

    @BeforeEach
    void setUp() {
        user = new UserEntity();
        user.setUserId(1L);

        customer = new CustomerEntity();
        customer.setCustomerId(1L);

        saleStatus = new SaleStatusEntity();
        saleStatus.setSaleStatusId(1L);
        saleStatus.setName("PENDIENTE");

        inventory = new InventoryEntity();
        inventory.setInventoryId(1L);
        inventory.setCurrentStock(10L);
    }

    @Test
    void testCreateSale_Success() {
        CreateSaleRequest.CreateSaleItem item =
                new CreateSaleRequest.CreateSaleItem(1L, 2, new BigDecimal("5.00"));
        CreateSaleRequest request =
                new CreateSaleRequest(LocalDate.now(), 1L, 1L, List.of(item));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(saleStatusRepository.findById(1L)).thenReturn(Optional.of(saleStatus));
        when(inventoryRepository.lockById(1L)).thenReturn(Optional.of(inventory));

        Object response = saleService.createSale(request, 1L);

        assertTrue(response instanceof SuccessfulResponse);
        SuccessfulResponse r = (SuccessfulResponse) response;
        assertEquals("201", r.getStatus());
        verify(saleRepository, times(1)).save(any(SaleEntity.class));
        assertEquals(8L, inventory.getCurrentStock()); // 10 - 2 = 8
    }

    @Test
    void testCreateSale_UserNotFound() {
        CreateSaleRequest request =
                new CreateSaleRequest(LocalDate.now(), 1L, 1L,
                        List.of(new CreateSaleRequest.CreateSaleItem(1L, 2, new BigDecimal("5.00"))));

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        Object response = saleService.createSale(request, 99L);

        assertTrue(response instanceof UnsuccessfulResponse);
        UnsuccessfulResponse r = (UnsuccessfulResponse) response;
        assertEquals("404", r.getStatus());
        verify(saleRepository, never()).save(any());
    }

    @Test
    void testCreateSale_CustomerNotFound() {
        CreateSaleRequest request =
                new CreateSaleRequest(LocalDate.now(), 1L, 1L,
                        List.of(new CreateSaleRequest.CreateSaleItem(1L, 2, new BigDecimal("5.00"))));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(customerRepository.findById(1L)).thenReturn(Optional.empty());

        Object response = saleService.createSale(request, 1L);

        assertTrue(response instanceof UnsuccessfulResponse);
        UnsuccessfulResponse r = (UnsuccessfulResponse) response;
        assertEquals("404", r.getStatus());
    }

    @Test
    void testCreateSale_StatusNotFound() {
        CreateSaleRequest request =
                new CreateSaleRequest(LocalDate.now(), 1L, 1L,
                        List.of(new CreateSaleRequest.CreateSaleItem(1L, 2, new BigDecimal("5.00"))));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(saleStatusRepository.findById(1L)).thenReturn(Optional.empty());

        Object response = saleService.createSale(request, 1L);

        assertTrue(response instanceof UnsuccessfulResponse);
        UnsuccessfulResponse r = (UnsuccessfulResponse) response;
        assertEquals("404", r.getStatus());
    }

    @Test
    void testCreateSale_InventoryNotFound() {
        CreateSaleRequest request =
                new CreateSaleRequest(LocalDate.now(), 1L, 1L,
                        List.of(new CreateSaleRequest.CreateSaleItem(1L, 2, new BigDecimal("5.00"))));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(saleStatusRepository.findById(1L)).thenReturn(Optional.of(saleStatus));
        when(inventoryRepository.lockById(1L)).thenReturn(Optional.empty());

        Object response = saleService.createSale(request, 1L);

        assertTrue(response instanceof UnsuccessfulResponse);
        UnsuccessfulResponse r = (UnsuccessfulResponse) response;
        assertEquals("500", r.getStatus());
    }

    @Test
    void testUpdateSale_SaleNotFound() {
        UpdateSaleRequest request =
                new UpdateSaleRequest(99L, LocalDate.now(), 1L, 1L, List.of());

        when(saleRepository.findOneWithDetails(99L)).thenReturn(Optional.empty());

        Object response = saleService.updateSale(request);

        assertTrue(response instanceof UnsuccessfulResponse);
        UnsuccessfulResponse r = (UnsuccessfulResponse) response;
        assertEquals("404", r.getStatus());
        verify(saleRepository, never()).save(any());
    }

    @Test
    void testUpdateSale_StatusNoEditable() {
        SaleStatusEntity status = new SaleStatusEntity();
        status.setName("PAGADO");

        SaleEntity sale = new SaleEntity();
        sale.setSaleStatus(status);

        when(saleRepository.findOneWithDetails(anyLong())).thenReturn(Optional.of(sale));

        UpdateSaleRequest request =
                new UpdateSaleRequest(1L, LocalDate.now(), 1L, 1L, List.of());

        Object response = saleService.updateSale(request);

        assertTrue(response instanceof UnsuccessfulResponse);
        UnsuccessfulResponse r = (UnsuccessfulResponse) response;
        assertEquals("400", r.getStatus());
        verify(saleRepository, never()).save(any());
    }

    @Test
    void testUpdateSale_CustomerNotFound() {
        SaleStatusEntity status = new SaleStatusEntity();
        status.setName("PENDIENTE");
        SaleEntity sale = new SaleEntity();
        sale.setSaleStatus(status);

        when(saleRepository.findOneWithDetails(anyLong())).thenReturn(Optional.of(sale));
        when(customerRepository.findById(anyLong())).thenReturn(Optional.empty());

        UpdateSaleRequest request =
                new UpdateSaleRequest(1L, LocalDate.now(), 1L, 1L, List.of());

        Object response = saleService.updateSale(request);

        assertTrue(response instanceof UnsuccessfulResponse);
        UnsuccessfulResponse r = (UnsuccessfulResponse) response;
        assertEquals("404", r.getStatus());
    }

    @Test
    void testUpdateSale_Success() {
        SaleStatusEntity status = new SaleStatusEntity();
        status.setName("PENDIENTE");

        inventory.setCurrentStock(100L);

        SaleDetailEntity existingDetail = new SaleDetailEntity();
        existingDetail.setSaleDetailId(10L);
        existingDetail.setInventory(inventory);
        existingDetail.setProductQuantity(2);
        existingDetail.setUnitPrice(new BigDecimal("5.00"));
        existingDetail.setSubtotal(new BigDecimal("10.00"));

        SaleEntity sale = new SaleEntity();
        sale.setSaleStatus(status);
        sale.setSaleDetails(new ArrayList<>(List.of(existingDetail)));

        when(saleRepository.findOneWithDetails(anyLong())).thenReturn(Optional.of(sale));
        when(customerRepository.findById(anyLong())).thenReturn(Optional.of(customer));
        when(saleStatusRepository.findById(anyLong())).thenReturn(Optional.of(saleStatus));
        when(inventoryRepository.lockById(anyLong())).thenReturn(Optional.of(inventory));

        UpdateSaleRequest.UpdateSaleItem item =
                new UpdateSaleRequest.UpdateSaleItem(10L, 1L, 3, new BigDecimal("5.00")); // Cambiamos cantidad
        UpdateSaleRequest request =
                new UpdateSaleRequest(1L, LocalDate.now(), 1L, 1L, List.of(item));

        Object response = saleService.updateSale(request);

        if (response instanceof UnsuccessfulResponse err) {
            System.out.println("⚠️ Error recibido: " + err.getError() + " -> " + err.getPath());
        }

        assertTrue(response instanceof SuccessfulResponse);
        SuccessfulResponse r = (SuccessfulResponse) response;
        assertEquals("200", r.getStatus());
        verify(saleRepository, times(1)).save(any(SaleEntity.class));

        assertEquals(99L, inventory.getCurrentStock());
    }

    @Test
    void testUpdateSale_InsufficientStock() {
        SaleStatusEntity status = new SaleStatusEntity();
        status.setName("PENDIENTE");

        SaleEntity sale = new SaleEntity();
        sale.setSaleStatus(status);
        sale.setSaleDetails(new ArrayList<>());

        InventoryEntity lowStock = new InventoryEntity();
        lowStock.setInventoryId(1L);
        lowStock.setCurrentStock(0L);

        when(saleRepository.findOneWithDetails(anyLong())).thenReturn(Optional.of(sale));
        when(customerRepository.findById(anyLong())).thenReturn(Optional.of(customer));
        when(saleStatusRepository.findById(anyLong())).thenReturn(Optional.of(saleStatus));
        when(inventoryRepository.lockById(anyLong())).thenReturn(Optional.of(lowStock));

        UpdateSaleRequest.UpdateSaleItem item =
                new UpdateSaleRequest.UpdateSaleItem(null, 1L, 5, new BigDecimal("10.00"));
        UpdateSaleRequest request =
                new UpdateSaleRequest(1L, LocalDate.now(), 1L, 1L, List.of(item));

        Object response = saleService.updateSale(request);

        assertTrue(response instanceof UnsuccessfulResponse);
        UnsuccessfulResponse r = (UnsuccessfulResponse) response;
        assertEquals("400", r.getStatus());
        verify(saleRepository, never()).save(any());
    }
}
