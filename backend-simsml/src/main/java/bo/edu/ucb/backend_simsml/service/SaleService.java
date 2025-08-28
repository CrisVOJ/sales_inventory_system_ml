package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.customer.CustomerSaleResponse;
import bo.edu.ucb.backend_simsml.dto.sale.CreateSaleRequest;
import bo.edu.ucb.backend_simsml.dto.sale.SaleResponse;
import bo.edu.ucb.backend_simsml.dto.sale.UpdateSaleRequest;
import bo.edu.ucb.backend_simsml.dto.saleStatus.SaleStatusSummary;
import bo.edu.ucb.backend_simsml.dto.user.UserSaleResponse;
import bo.edu.ucb.backend_simsml.entity.CustomerEntity;
import bo.edu.ucb.backend_simsml.entity.SaleEntity;
import bo.edu.ucb.backend_simsml.entity.SaleStatusEntity;
import bo.edu.ucb.backend_simsml.entity.UserEntity;
import bo.edu.ucb.backend_simsml.repository.CustomerRepository;
import bo.edu.ucb.backend_simsml.repository.SaleRepository;
import bo.edu.ucb.backend_simsml.repository.SaleStatusRepository;
import bo.edu.ucb.backend_simsml.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

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

    public Object createSale(CreateSaleRequest request) {
        try {
            UserEntity user = userRepository.findById(request.userId())
                    .orElse(null);

            if (user == null) {
                return new UnsuccessfulResponse("404", "Usuario no encontrado", null);
            }

            CustomerEntity customer = customerRepository.findById(request.customerId())
                    .orElse(null);

            if (customer == null) {
                return new UnsuccessfulResponse("404", "Cliente no encontrado", null);
            }

            SaleStatusEntity saleStatus = saleStatusRepository.findById(request.saleStatusId())
                    .orElse(null);

            if (saleStatus == null) {
                return new UnsuccessfulResponse("404", "Estado no encontrado", null);
            }

            SaleEntity sale = new SaleEntity();
            sale.setRegistrationDate(request.registrationDate());
            sale.setUser(user);
            sale.setCustomer(customer);
            sale.setSaleStatus(saleStatus);

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
                            UserSaleResponse.from(saleResposne.getUser()),
                            CustomerSaleResponse.from(saleResposne.getCustomer()),
                            SaleStatusSummary.from(saleResposne.getSaleStatus())
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
            SaleResponse sale = saleRepository.findById(saleId)
                    .map(saleResponse -> new SaleResponse(
                            saleResponse.getSaleId(),
                            saleResponse.getRegistrationDate(),
                            UserSaleResponse.from(saleResponse.getUser()),
                            CustomerSaleResponse.from(saleResponse.getCustomer()),
                            SaleStatusSummary.from(saleResponse.getSaleStatus())
                    ))
                    .orElse(null);

            if (sale == null) {
                return new UnsuccessfulResponse("404", "Venta no encontrada", null);
            }

            return new SuccessfulResponse("200", "Venta obtenida exitosamente", sale);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener venta", e.getMessage());
        }
    }

    public Object updateSale(UpdateSaleRequest request) {
        try {
            SaleEntity sale = saleRepository.findById(request.saleId())
                    .orElse(null);

            if (sale == null) {
                return new UnsuccessfulResponse("404", "Venta no encontrada", null);
            }

            UserEntity user = userRepository.findById(request.userId())
                    .orElse(null);

            if (user == null) {
                return new UnsuccessfulResponse("404", "Usuario no encontrado", null);
            }

            CustomerEntity customer = customerRepository.findById(request.customerId())
                    .orElse(null);

            if (customer == null) {
                return new UnsuccessfulResponse("404", "Cliente no encontrado", null);
            }

            SaleStatusEntity saleStatus = saleStatusRepository.findById(request.saleStatusId())
                    .orElse(null);

            if (saleStatus == null) {
                return new UnsuccessfulResponse("404", "Estado no encontrado", null);
            }

            sale.setRegistrationDate(request.registrationDate());
            sale.setUser(user);
            sale.setCustomer(customer);
            sale.setSaleStatus(saleStatus);
            sale.setUpdatedAt(LocalDateTime.now());

            saleRepository.save(sale);
            return new SuccessfulResponse("200", "Venta actualizada exitosamente", sale.getSaleId());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al actualizar venta", e.getMessage());
        }
    }

}
