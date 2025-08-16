package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.user.CreateUserRequest;
import bo.edu.ucb.backend_simsml.dto.user.UpdateUserRequest;
import bo.edu.ucb.backend_simsml.dto.user.UserResponse;
import bo.edu.ucb.backend_simsml.entity.RoleEntity;
import bo.edu.ucb.backend_simsml.entity.UserEntity;
import bo.edu.ucb.backend_simsml.repository.RolesRepository;
import bo.edu.ucb.backend_simsml.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
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

    // Update User
    public Object updateUser(UpdateUserRequest request) {
        try {
            Set<RoleEntity> roles = resolveRolesOrDefault(request.roles());

            UserEntity user = userRepository.findById(request.userId()).orElse(null);

            if (user == null) {
                return new UnsuccessfulResponse("404", "Usuario no encontrado", request.username());
            }

            String pass = user.getPassword();

            if (!passwordEncoder.matches(request.password(), pass)) {
                pass = passwordEncoder.encode(request.password().trim());
            }

            user.setIdentityDoc(request.identityDoc().trim());
            user.setPhone(request.phone().trim());
            user.setAddress(request.address().trim());
            user.setName(request.name().trim());
            user.setPaternalSurname(request.paternalSurname().trim());
            user.setMaternalSurname(request.maternalSurname().trim());
            user.setEmail(request.email().trim().toLowerCase());
            user.setUsername(request.username().trim().toLowerCase());
            user.setPassword(pass);
            user.setEnabled(request.isEnabled());
            user.setAccountNoLocked(request.accountNoLocked());

            user.getRoles().clear();
            user.getRoles().addAll(roles);

            userRepository.save(user);
            return new SuccessfulResponse("200", "Usuario actualizado exitosamente", request.username());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al actualizar usuario: " + e.getMessage(), e.getMessage());
        }
    }

    // Find all users
    public Object getUsers(String filter, Boolean status, Pageable pageable) {
        try {
            Page<UserResponse> users = userRepository.findAlleUsers(filter, status, pageable)
                    .map(userResponse -> new UserResponse(
                            userResponse.getUserId(),
                            userResponse.getIdentityDoc(),
                            userResponse.getPhone(),
                            userResponse.getAddress(),
                            userResponse.getName(),
                            userResponse.getPaternalSurname(),
                            userResponse.getMaternalSurname(),
                            userResponse.getEmail(),
                            userResponse.getUsername(),
                            userResponse.isEnabled(),
                            userResponse.isAccountNoLocked(),
                            userResponse.getRoles()
                                    .stream()
                                    .map(RoleEntity::getName)
                                    .collect(Collectors.toSet())));

            if (!users.isEmpty()) {
                return new SuccessfulResponse("200", "Usuarios encontrados exitosamente", users);
            }

            return new UnsuccessfulResponse("404", "No hay usuarios registrados", null);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al encontrar usuarios", e.getMessage());
        }
    }

    // Find user by ID
    public Object getUserById(Long userId) {
        try {
            UserResponse user = userRepository.findById(userId)
                    .map(userResponse -> new UserResponse(
                            userResponse.getUserId(),
                            userResponse.getIdentityDoc(),
                            userResponse.getPhone(),
                            userResponse.getAddress(),
                            userResponse.getName(),
                            userResponse.getPaternalSurname(),
                            userResponse.getMaternalSurname(),
                            userResponse.getEmail(),
                            userResponse.getUsername(),
                            userResponse.isEnabled(),
                            userResponse.isAccountNoLocked(),
                            userResponse.getRoles()
                                    .stream()
                                    .map(RoleEntity::getName)
                                    .collect(Collectors.toSet())))
                    .orElse(null);

            if (user != null) {
                return new SuccessfulResponse("200", "Usuario encontrado exitosamente", user);
            }

            return new UnsuccessfulResponse("404", "Usuario no encontrado", null);
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al encontrar usuario", e.getMessage());
        }
    }

    // Disable user
    public Object disableUser(Long userId) {
        try {
            UserEntity user = userRepository.findById(userId).orElse(null);

            if (user == null) {
                return new UnsuccessfulResponse("404", "Usuario no encontrado", null);
            }

            user.setEnabled(false);
            user.setAccountNoLocked(false);

            userRepository.save(user);

            return new SuccessfulResponse("200", "Usuario deshabilitado exitosamente", user.getUsername());
        } catch (Exception e) {
            return new UnsuccessfulResponse("500", "Error al desabilitar usuario", e.getMessage());
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

        return new HashSet<>(roles);
    }
}
