package bo.edu.ucb.backend_simsml.dto.user;

import jakarta.validation.constraints.NotBlank;

public record UpdatePasswordProfile(
        @NotBlank String currentPassword,
        @NotBlank String newPassword
) {
}
