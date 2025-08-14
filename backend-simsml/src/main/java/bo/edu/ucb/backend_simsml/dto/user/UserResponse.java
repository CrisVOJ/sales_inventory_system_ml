package bo.edu.ucb.backend_simsml.dto.user;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.Set;

@JsonPropertyOrder({
        "userId",
        "identityDoc",
        "phone",
        "address",
        "name",
        "paternalSurname",
        "maternalSurname",
        "email",
        "username",
        "isEnabled",
        "accountNoLocked",
        "roles"
})
public record UserResponse(@NotBlank Long userId,
                           @NotBlank String identityDoc,
                           @NotBlank String phone,
                           String address,
                           @NotBlank String name,
                           @NotBlank String paternalSurname,
                           String maternalSurname,
                           @NotBlank @Email String email,
                           @NotBlank String username,
                           @NotBlank boolean isEnabled,
                           @NotBlank boolean accountNoLocked,
                           Set<@NotBlank String> roles) {
}
