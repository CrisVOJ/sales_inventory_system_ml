package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.customer.CreateCustomerRequest;
import bo.edu.ucb.backend_simsml.dto.customer.CustomerResponse;
import bo.edu.ucb.backend_simsml.dto.customer.CustomerSummary;
import bo.edu.ucb.backend_simsml.dto.customer.UpdateCustomerRequest;
import bo.edu.ucb.backend_simsml.entity.CustomerEntity;
import bo.edu.ucb.backend_simsml.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public Object createCustomer(CreateCustomerRequest request) {
        try {
            CustomerEntity customer = new CustomerEntity();
            customer.setIdentityDocument(request.identityDocument().trim());
            customer.setPhone(request.phone().trim());
            customer.setAddress(request.address().trim());
            customer.setName(request.name().trim());
            customer.setPaternalSurname(request.paternalSurname().trim());
            customer.setMaternalSurname(request.maternalSurname().trim());

            customerRepository.save(customer);
            return new SuccessfulResponse("201", "Cliente registrado exitosamente", request.name());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al registrar cliente", e.getMessage());
        }
    }

    public Object getCustomers(String filter, Boolean status, Pageable pageable) {
        try {
            Page<CustomerResponse> customers = customerRepository.findAllCustomers(filter, status, pageable)
                    .map(customerResponse -> new CustomerResponse(
                            customerResponse.getCustomerId(),
                            customerResponse.getIdentityDocument(),
                            customerResponse.getPhone(),
                            customerResponse.getAddress(),
                            customerResponse.getName(),
                            customerResponse.getPaternalSurname(),
                            customerResponse.getMaternalSurname(),
                            customerResponse.isActive()
                    ));

            if (customers.isEmpty()) {
                return new UnsuccessfulResponse("404", "No se encontraron clientes registrados", null);
            }

            return new SuccessfulResponse("200", "Clientes obtenidos exitosamente", customers);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener clientes", e.getMessage());
        }
    }

    public Object getCutomersSummary() {
        try {
            List<CustomerSummary> customerSummaries = customerRepository.findAllCustomersSummary()
                    .stream()
                    .map(CustomerSummary::from)
                    .toList();

            if (!customerSummaries.isEmpty()) {
                return new SuccessfulResponse("200", "Resumen de clientes obtenidos exitosamente", customerSummaries);
            }

            return new UnsuccessfulResponse("404", "No se encontraron clientes registrados", null);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener resumen de clientes", e.getMessage());
        }
    }

    public Object getCustomer(Long customerId) {
        try {
            CustomerResponse customer = customerRepository.findById(customerId)
                    .map(customerResponse -> new CustomerResponse(
                            customerResponse.getCustomerId(),
                            customerResponse.getIdentityDocument(),
                            customerResponse.getPhone(),
                            customerResponse.getAddress(),
                            customerResponse.getName(),
                            customerResponse.getPaternalSurname(),
                            customerResponse.getMaternalSurname(),
                            customerResponse.isActive()
                    )).orElse(null);

            if (customer == null) {
                return new UnsuccessfulResponse("404", "Cliente no encontrado", null);
            }

            return new SuccessfulResponse("200", "Cliente obtenido exitosamente", customer);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener cliente", e.getMessage());
        }
    }

    public Object updateCustomer(UpdateCustomerRequest request) {
        try {
            CustomerEntity customer = customerRepository.findById(request.customerId())
                    .orElse(null);

            if (customer == null) {
                return new UnsuccessfulResponse("404", "Cliente no encontrado", null);
            }

            customer.setIdentityDocument(request.identityDocument().trim());
            customer.setPhone(request.phone().trim());
            customer.setAddress(request.address().trim());
            customer.setName(request.name().trim());
            customer.setPaternalSurname(request.paternalSurname().trim());
            customer.setMaternalSurname(request.maternalSurname().trim());
            customer.setUpdatedAt(LocalDateTime.now());

            customerRepository.save(customer);
            return new SuccessfulResponse("200", "Cliente actualizado exitosamente", customer.getName());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al actualizar cliente", e.getMessage());
        }
    }

    public Object disableCustomer(Long customerId) {
        try {
            CustomerEntity customer = customerRepository.findById(customerId)
                    .orElse(null);

            if (customer == null) {
                return new UnsuccessfulResponse("404", "Cliente no encontrado", null);
            }

            customer.setUpdatedAt(LocalDateTime.now());
            customer.setActive(false);

            customerRepository.save(customer);
            return new SuccessfulResponse("200", "Cliente eliminado exitosamente", null);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al eliminar cliente", e.getMessage());
        }
    }

}
