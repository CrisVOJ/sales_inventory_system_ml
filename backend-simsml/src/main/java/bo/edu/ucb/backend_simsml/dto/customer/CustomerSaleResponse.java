package bo.edu.ucb.backend_simsml.dto.customer;

import bo.edu.ucb.backend_simsml.entity.CustomerEntity;

public record CustomerSaleResponse(
        Long customerId,
        String identifyDocument,
        String name,
        String paternalSurname
) {
    public static CustomerSaleResponse from(CustomerEntity customer) {
        if (customer == null) return null;
        return new CustomerSaleResponse(customer.getCustomerId(), customer.getIdentityDocument(), customer.getName(), customer.getPaternalSurname());
    }
}
