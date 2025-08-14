package bo.edu.ucb.backend_simsml.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record UpdateUserRequest(@NotNull Long userId,
                                @NotBlank String identityDoc,
                                @NotBlank String phone,
                                String address,
                                @NotBlank String name,
                                @NotBlank String paternalSurname,
                                String maternalSurname,
                                @NotBlank @Email String email,
                                @NotBlank String username,
                                @NotBlank String password,
                                @NotNull boolean isEnabled,
                                @NotNull boolean accountNoLocked,
                                Set<@NotBlank String> roles) {
}
