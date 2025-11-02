package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.saleStatus.SaleStatusSummary;
import bo.edu.ucb.backend_simsml.repository.SaleStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SaleStatusService {

    @Autowired
    private SaleStatusRepository saleStatusRepository;

    public Object getActiveSaleStatuses() {
        try {
            List<SaleStatusSummary> saleStatuses = saleStatusRepository.findActiveSaleStatus()
                    .stream().map(saleStatusResponse -> new SaleStatusSummary(
                            saleStatusResponse.getSaleStatusId(),
                            saleStatusResponse.getName()
                    )).toList();

            if (!saleStatuses.isEmpty()) {
                return new SuccessfulResponse("200", "Estados de venta encontrados", saleStatuses);
            }

            return new UnsuccessfulResponse("404", "No hay estados de venta registrados", null);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener estados de venta", e.getMessage());
        }
    }
}
