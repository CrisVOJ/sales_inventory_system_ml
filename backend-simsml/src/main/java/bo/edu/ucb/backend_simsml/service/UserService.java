package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.user.CreateUserRequest;
import bo.edu.ucb.backend_simsml.dto.user.CreatedUserResponse;
import bo.edu.ucb.backend_simsml.entity.RoleEntity;
import bo.edu.ucb.backend_simsml.entity.UserEntity;
import bo.edu.ucb.backend_simsml.repository.RolesRepository;
import bo.edu.ucb.backend_simsml.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private RolesRepository rolesRepository;

    // Create new user
    public Object createUser(CreateUserRequest request) {
        try {
            Set<RoleEntity> roles = resolveRolesOrDefault(request.roles());

            UserEntity user = new UserEntity();
            user.setIdentityDoc(request.identityDoc().trim());
            user.setPhone(request.phone().trim());
            user.setAddress(request.address().trim());
            user.setName(request.name().trim());
            user.setPaternalSurname(request.paternalSurname().trim());
            user.setMaternalSurname(request.maternalSurname().trim());
            user.setEmail(request.email().trim().toLowerCase());
            user.setUsername(request.username().trim().toLowerCase());
            user.setPassword(passwordEncoder.encode(request.password().trim()));
            user.setRoles(roles);

            userRepository.save(user);
            return new SuccessfulResponse("201", "Usuario creado exitosamente", user.getUsername());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al crear usuario", e.getMessage());
        }
    }

    private Set<RoleEntity> resolveRolesOrDefault(Set<String> roleNames) {
        Set<String> names = (roleNames == null || roleNames.isEmpty())
                ? Set.of("ROLE_SELLER")
                : roleNames;

        var roles = rolesRepository.findByNameIn(names);
        if (roles.size() != names.size()) {
            var found = roles.stream().map(RoleEntity::getName).collect(Collectors.toSet());
            var missing = names.stream().filter(name -> !found.contains(name)).collect(Collectors.toSet());

            throw new IllegalArgumentException("Roles not found: " + String.join(", ", missing));
        }

        return Set.copyOf(roles);
    }
}
