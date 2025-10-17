package bo.edu.ucb.backend_simsml.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.Set;

public record CreateUserRequest(@NotBlank String identityDoc,
                                @NotBlank String phone,
                                String address,
                                @NotBlank String name,
                                @NotBlank String paternalSurname,
                                String maternalSurname,
                                @NotBlank String username,
                                @Email @NotBlank String email,
                                Set<@NotBlank String> roles) {
}
