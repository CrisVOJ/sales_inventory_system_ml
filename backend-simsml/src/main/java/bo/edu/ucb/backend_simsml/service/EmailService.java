package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.entity.InventoryEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@simsml.com}")
    private String from;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendLowStockAlert(InventoryEntity inventory, String lowStockTo) {
        try {
            String subject = "Alerta de stock bajo - " + inventory.getProduct().getName();

            String body = """
                    Estimado equipo,
                    
                    El inventario de uno de los productos ha alcanzado el nivel minimo o se encuentra por debajo del mismo.
                    
                    Producto: %s
                    Código inventario: %s
                    Stock actual: %d
                    Stock mínimo: %d
                    Ubicación: %s
                    
                    Fecha de detección: %s
                    
                    Por favor, revise este stock y considere la reposición correspondiente.
                    
                    Atentamient,
                    Sistema de Gestión de Ventas e Inventarios
                    """.formatted(
                            inventory.getProduct().getName(),
                            inventory.getInventoryId(),
                            inventory.getCurrentStock(),
                            inventory.getMinimumStock(),
                            inventory.getLocation().getName(),
                            java.time.LocalDateTime.now()
                    );

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(lowStockTo);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

            log.info("Alerta de stock bajo enviado para inventario {} (productos: {})",
                    inventory.getInventoryId(), inventory.getProduct().getName());
        } catch (Exception e) {
            log.error("Error al enviar correo de stock bajo para inventario {}: {}",
                    inventory.getInventoryId(), e.getMessage(), e);
        }
    }
}
