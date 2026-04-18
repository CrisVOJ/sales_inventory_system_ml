package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.entity.InventoryEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:no-reply@simsml.com}")
    private String from;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

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

    public void sendThresholdAlert(InventoryEntity inventory, String to, int thresholdPercent, long recommendedQuantity, boolean recommendedFromPredictions) {
        try {
            String subject = "Notificación de umbral de inventario - " + inventory.getProduct().getName();

            String body = """
                    Hola,
                    
                    Se ha detectado que el inventario ha alcanzado el umbral de %d%% de su capacidad base.
                    
                    Producto: %s
                    Código inventario: %s
                    Stock actual: %d
                    Capacidad base: %s
                    Umbral detectado: %d%%
                    
                    Cantidad recomendada a reponer: %d
                    Recomendación %s
                    
                    Fecha de detección: %s
                    
                    Atentamente,
                    Sistema de Gestión de Ventas e Inventarios
                    """.formatted(
                    thresholdPercent,
                    inventory.getProduct().getName(),
                    inventory.getInventoryId(),
                    inventory.getCurrentStock(),
                    inventory.getBaseCapacity() == null ? "N/A" : inventory.getBaseCapacity().toString(),
                    thresholdPercent,
                    recommendedQuantity,
                    (recommendedFromPredictions ? "(basada en predicciones)" : "(basada en capacidad base)"),
                    java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
            );

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

            log.info("Alerta de umbral {}% enviada para inventario {}", thresholdPercent, inventory.getInventoryId());
        } catch (Exception e) {
            log.error("Error al enviar alerta de umbral para inventario {}: {}", inventory.getInventoryId(), e.getMessage(), e);
        }
    }

    public void sendCriticInventoryAlert(InventoryEntity inventory, String to, int thresholdPercent, long recommendedQuantity) {
        try {
            String subject = "Inventario en Nivel Crítico - " + inventory.getProduct().getName();

            String body = """
                    Hola,
                    
                    Se ha detectado que el inventario ha alcanzado el nivel crítico de %d%%.
                    
                    Producto: %s
                    Código inventario: %s
                    Stock actual: %d
                    Capacidad recomendada a tener por mes: %s
                    
                    Cantidad recomendada a reponer: %d
                    
                    Fecha de detección: %s
                    
                    Atentamente,
                    Sistema de Gestión de Ventas e Inventarios
                    """.formatted(
                    thresholdPercent,
                    inventory.getProduct().getName(),
                    inventory.getInventoryId(),
                    inventory.getCurrentStock(),
                    recommendedQuantity,
                    Math.max(0, recommendedQuantity - inventory.getCurrentStock()),
                    java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
            );

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

            log.info("Alerta de umbral {}% enviada para inventario {}", thresholdPercent, inventory.getInventoryId());
        } catch (Exception e) {
            log.error("Error al enviar alerta de umbral para inventario {}: {}", inventory.getInventoryId(), e.getMessage(), e);
        }
    }

    public void sendPasswordResetEmail(String to, String token) {
        try {
            String subject = "Restablecer contraseña";

            String resetUrl = frontendBaseUrl + "/auth/reset-password/" + token;

            String text = """
                Hola,
                
                Has solicitado restablecer tu contraseña.
                Por favor haz clic en el siguiente enlace (o cópialo en tu navegador):
                %s

                Si no solicitaste este cambio, simplemente ignora este correo.
                """.formatted(resetUrl);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            mailSender.send(message);

            log.info("Correo de restauración enviado correctamente");
        } catch (Exception e) {
            log.error("Error al enviar el correo para resetear contraseña {}", e.getMessage(), e);
        }
    }
}
