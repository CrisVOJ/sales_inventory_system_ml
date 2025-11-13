package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.payment.CreatePaymentRequest;
import bo.edu.ucb.backend_simsml.dto.payment.PaymentResponse;
import bo.edu.ucb.backend_simsml.dto.payment.UpdatePaymentRequest;
import bo.edu.ucb.backend_simsml.dto.paymentMethod.PaymentMethodSummary;
import bo.edu.ucb.backend_simsml.dto.sale.SaleSummary;
import bo.edu.ucb.backend_simsml.entity.PaymentEntity;
import bo.edu.ucb.backend_simsml.entity.PaymentMethodEntity;
import bo.edu.ucb.backend_simsml.entity.SaleEntity;
import bo.edu.ucb.backend_simsml.repository.PaymentMethodRepository;
import bo.edu.ucb.backend_simsml.repository.PaymentRepository;
import bo.edu.ucb.backend_simsml.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private SaleRepository saleRepository;
    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    public Object createPayment(CreatePaymentRequest request) {
        try {
            SaleEntity sale = saleRepository.findById(request.saleId())
                    .orElse(null);

            if (sale == null) {
                return new UnsuccessfulResponse("404", "Venta no encontrada", null);
            }

            PaymentMethodEntity paymentMethod = paymentMethodRepository.findById(request.paymentMethodId())
                    .orElse(null);

            if (paymentMethod == null) {
                return new UnsuccessfulResponse("404", "Metodo de pago no encontrado", null);
            }

            PaymentEntity payment = new PaymentEntity();
            payment.setAmount(request.amount());
            payment.setDate(request.date());
            payment.setReference(request.reference());
            payment.setSale(sale);
            payment.setPaymentMethod(paymentMethod);

            paymentRepository.save(payment);
            return new SuccessfulResponse("201", "Pago registrado exitosamente", payment.getPaymentId());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al registrar pago", e.getMessage());
        }
    }

    public Object getPayments(LocalDate startDate, LocalDate endDate, Boolean status, Pageable pageable) {
        try {
            Page<PaymentResponse> payments = paymentRepository.findAllPayments(startDate, endDate, status, pageable)
                    .map(paymentResponse -> new PaymentResponse(
                            paymentResponse.getPaymentId(),
                            paymentResponse.getAmount(),
                            paymentResponse.getDate(),
                            paymentResponse.getReference(),
                            paymentResponse.isActive(),
                            SaleSummary.from(paymentResponse.getSale()),
                            PaymentMethodSummary.from(paymentResponse.getPaymentMethod())
                    ));

            if (payments.isEmpty()) {
                return new UnsuccessfulResponse("404", "No se encontraron pagos registrados", null);
            }

            return new SuccessfulResponse("200", "Pagos obtenidos exitosamente", payments);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener pagos", e.getMessage());
        }
    }

    public Object getPayment(Long paymentId) {
        try {
            PaymentResponse payment = paymentRepository.findById(paymentId)
                    .map(paymentResponse -> new PaymentResponse(
                            paymentResponse.getPaymentId(),
                            paymentResponse.getAmount(),
                            paymentResponse.getDate(),
                            paymentResponse.getReference(),
                            paymentResponse.isActive(),
                            SaleSummary.from(paymentResponse.getSale()),
                            PaymentMethodSummary.from(paymentResponse.getPaymentMethod())
                    ))
                    .orElse(null);

            if (payment == null) {
                return new UnsuccessfulResponse("404", "Pago no encontrado", null);
            }

            return new SuccessfulResponse("200", "Pago obtenido exitosamente", payment);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al obtener pago", e.getMessage());
        }
    }

    public Object updatePayment(UpdatePaymentRequest request) {
        try {
            PaymentEntity payment = paymentRepository.findById(request.paymentId())
                    .orElse(null);

            if (payment == null) {
                return new UnsuccessfulResponse("404", "Pago no encontrado", null);
            }

            SaleEntity sale = saleRepository.findById(request.saleId())
                    .orElse(null);

            if (sale == null) {
                return new UnsuccessfulResponse("404", "Venta no encontrada", null);
            }

            PaymentMethodEntity paymentMethod = paymentMethodRepository.findById(request.paymentMethodId())
                    .orElse(null);

            if (paymentMethod == null) {
                return new UnsuccessfulResponse("404", "Metodo de pago no encontrado", null);
            }

            payment.setAmount(request.amount());
            payment.setDate(request.date());
            payment.setReference(request.reference());
            payment.setActive(request.active());
            payment.setSale(sale);
            payment.setPaymentMethod(paymentMethod);
            payment.setUpdatedAt(LocalDateTime.now());

            paymentRepository.save(payment);
            return new SuccessfulResponse("200", "Pago actualizado exitosamente", payment.getPaymentId());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al actualizar pago", e.getMessage());
        }
    }

    public Object disablePayment(Long paymentId) {
        try {
            PaymentEntity payment = paymentRepository.findById(paymentId)
                    .orElse(null);

            if (payment == null) {
                return new UnsuccessfulResponse("404", "Pago no encontrado", null);
            }

            payment.setActive(false);
            payment.setUpdatedAt(LocalDateTime.now());

            paymentRepository.save(payment);
            return new SuccessfulResponse("200", "Pago eliminado exitosamente", null);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al eliminar pago", e.getMessage());
        }
    }

}
