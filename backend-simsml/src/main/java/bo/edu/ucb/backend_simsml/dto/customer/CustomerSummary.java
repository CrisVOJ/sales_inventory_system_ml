package bo.edu.ucb.backend_simsml.dto.customer;

import bo.edu.ucb.backend_simsml.entity.CustomerEntity;

public record CustomerSummary(
        Long customerId,
        String identityDocument,
        String name,
        String paternalSurname,
        String maternalSurname
) {
    public static CustomerSummary from(CustomerEntity customer) {
        if (customer == null) return null;
        return new CustomerSummary(
                customer.getCustomerId(),
                customer.getIdentityDocument(),
                customer.getName(),
                customer.getPaternalSurname(),
                customer.getMaternalSurname()
        );
    }
}
