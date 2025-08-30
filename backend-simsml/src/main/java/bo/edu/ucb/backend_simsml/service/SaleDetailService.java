package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.product.ProductSummary;
import bo.edu.ucb.backend_simsml.dto.sale.SaleSummary;
import bo.edu.ucb.backend_simsml.dto.saleDetail.CreateSaleDetailRequest;
import bo.edu.ucb.backend_simsml.dto.saleDetail.SaleDetailResponse;
import bo.edu.ucb.backend_simsml.dto.saleDetail.UpdateSaleDetailRequest;
import bo.edu.ucb.backend_simsml.entity.ProductEntity;
import bo.edu.ucb.backend_simsml.entity.SaleDetailEntity;
import bo.edu.ucb.backend_simsml.entity.SaleEntity;
import bo.edu.ucb.backend_simsml.repository.ProductRepository;
import bo.edu.ucb.backend_simsml.repository.SaleDetailRepository;
import bo.edu.ucb.backend_simsml.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SaleDetailService {

    @Autowired
    private SaleDetailRepository saleDetailRepository;
    @Autowired
    private SaleRepository saleRepository;
    @Autowired
    private ProductRepository productRepository;

    public SaleDetailService(SaleRepository saleRepository, ProductRepository productRepository) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
    }

    public Object createSaleDetail(CreateSaleDetailRequest request) {
        try {
            SaleEntity sale = saleRepository.findById(request.saleId())
                    .orElse(null);

            if (sale == null) {
                return new UnsuccessfulResponse("404", "Venta no encontrada", null);
            }

            ProductEntity product = productRepository.findById(request.productId())
                    .orElse(null);

            if (product == null) {
                return new UnsuccessfulResponse("404", "Producto no encontrada", null);
            }

            SaleDetailEntity saleDetail = new SaleDetailEntity();
            saleDetail.setProductQuantity(request.productQuantity());
            saleDetail.setUnitPrice(request.unitPrice());
            saleDetail.setSale(sale);
            saleDetail.setProduct(product);

            saleDetailRepository.save(saleDetail);
            return new SuccessfulResponse("201", "Detalle de venta registrado exitosamente", saleDetail.getSaleDetailId());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al registrar detalle de venta", e.getMessage());
        }
    }

    public Object getSalesDetails(Boolean status, Pageable pageable) {
        try {
            Page<SaleDetailResponse> salesDetails = saleDetailRepository.findAllSalesDetails(status, pageable)
                    .map(salesDetailsResponse -> new SaleDetailResponse(
                            salesDetailsResponse.getSaleDetailId(),
                            salesDetailsResponse.getProductQuantity(),
                            salesDetailsResponse.getUnitPrice(),
                            salesDetailsResponse.isActive(),
                            SaleSummary.from(salesDetailsResponse.getSale()),
                            ProductSummary.from(salesDetailsResponse.getProduct())
                    ));

            if (salesDetails.isEmpty()) {
                return new UnsuccessfulResponse("404", "Detalles de Ventas no encontradas", null);
            }

            return new SuccessfulResponse("200", "Detalles de Ventas obtenidas exitosamente", salesDetails);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener los detalles de ventas", e.getMessage());
        }
    }

    public Object getSaleDetail(Long saleDetailId) {
        try {
            SaleDetailResponse saleDetail = saleDetailRepository.findById(saleDetailId)
                    .map(saleDetailResponse -> new SaleDetailResponse(
                            saleDetailResponse.getSaleDetailId(),
                            saleDetailResponse.getProductQuantity(),
                            saleDetailResponse.getUnitPrice(),
                            saleDetailResponse.isActive(),
                            SaleSummary.from(saleDetailResponse.getSale()),
                            ProductSummary.from(saleDetailResponse.getProduct())
                    ))
                    .orElse(null);

            if (saleDetail == null) {
                return new UnsuccessfulResponse("404", "Detalle de venta no encontrada", null);
            }

            return new SuccessfulResponse("200", "Detalle de venta obtenida exitosamente", saleDetail);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener detalle de venta", e.getMessage());
        }
    }

    public Object updateSaleDetail(UpdateSaleDetailRequest request) {
        try {
            SaleDetailEntity saleDetail = saleDetailRepository.findById(request.saleDetailId())
                    .orElse(null);

            if (saleDetail == null) {
                return new UnsuccessfulResponse("404", "Detalle de venta no encontrada", null);
            }

            SaleEntity sale = saleRepository.findById(request.saleId())
                    .orElse(null);

            if (sale == null) {
                return new UnsuccessfulResponse("404", "Venta no encontrada", null);
            }

            ProductEntity product = productRepository.findById(request.productId())
                    .orElse(null);

            if (product == null) {
                return new UnsuccessfulResponse("404", "Producto no encontrada", null);
            }

            saleDetail.setProductQuantity(request.productQuantity());
            saleDetail.setUnitPrice(request.unitPrice());
            saleDetail.setActive(request.active());
            saleDetail.setSale(sale);
            saleDetail.setProduct(product);
            saleDetail.setUpdatedAt(LocalDateTime.now());

            saleDetailRepository.save(saleDetail);
            return new SuccessfulResponse("200", "Detalle de venta actualizado exitosamente", saleDetail.getSaleDetailId());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al actualizar detalle de venta", e.getMessage());
        }
    }

    public Object disableSaleDetail(Long saleDetailId) {
        try {
            SaleDetailEntity saleDetail = saleDetailRepository.findById(saleDetailId)
                    .orElse(null);

            if (saleDetail == null) {
                return new UnsuccessfulResponse("404", "Detalle de venta no encontrada", null);
            }

            saleDetail.setActive(false);
            saleDetail.setUpdatedAt(LocalDateTime.now());

            saleDetailRepository.save(saleDetail);
            return new SuccessfulResponse("200", "Detalle de venta eliminado exitosamente", null);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al eliminar detalle de venta", e.getMessage());
        }
    }

}
