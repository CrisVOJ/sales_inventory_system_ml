package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.user.CreateUserRequest;
import bo.edu.ucb.backend_simsml.dto.user.UpdateUserRequest;
import bo.edu.ucb.backend_simsml.entity.RoleEntity;
import bo.edu.ucb.backend_simsml.entity.UserEntity;
import bo.edu.ucb.backend_simsml.repository.RolesRepository;
import bo.edu.ucb.backend_simsml.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class UserServiceTest {

    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RolesRepository rolesRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateUser_Success() {
        CreateUserRequest request = new CreateUserRequest(
                "12345678",
                "7654321",
                "Calle Falsa 123",
                "Juan",
                "Perez",
                "Quiroz",
                "jperez",
                "jperez@gmail.com",
                Set.of("ADMIN")
        );

        RoleEntity role = new RoleEntity();
        role.setName("ADMIN");

        when(rolesRepository.findByNameIn(anyCollection())).thenReturn(List.of(role));
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any())).thenAnswer(new Answer<UserEntity>() {
            @Override
            public UserEntity answer(InvocationOnMock invocation) {
                return invocation.getArgument(0);
            }
        });

        Object response = userService.createUser(request);

        assertInstanceOf(SuccessfulResponse.class, response);
        SuccessfulResponse r = (SuccessfulResponse) response;
        assertEquals("Usuario creado exitosamente", r.getMessage());
        verify(userRepository, times(1)).save(any(UserEntity.class));
    }

    @Test
    void testCreateUser_RoleNotFound() {
        CreateUserRequest request = new CreateUserRequest(
                "123456", "77777777", "Calle Falsa 123",
                "Carlos", "Nina", "Reynaga", "cnina", "cnina@mail.com",
                Set.of("ROLE_UNKNOWN")
        );

        when(rolesRepository.findByNameIn(anyCollection())).thenReturn(Collections.emptyList());

        Object response = userService.createUser(request);

        assertInstanceOf(UnsuccessfulResponse.class, response);
        UnsuccessfulResponse r = (UnsuccessfulResponse) response;
        assertEquals("Error al crear usuario", r.getError());
    }

    @Test
    void testUpdateUser_Success() {
        UpdateUserRequest request = new UpdateUserRequest(
                1L, "999999", "8888888", "Nueva Dirección",
                "Carlos", "Nina", "Reynaga", "cnina", "cnina@mail.com",
                Set.of("SELLER")
        );

        RoleEntity role = new RoleEntity();
        role.setName("SELLER");

        UserEntity user = new UserEntity();
        user.setUserId(1L);
        user.setUsername("cnina");

        when(rolesRepository.findByNameIn(anyCollection())).thenReturn(List.of(role));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(UserEntity.class))).thenReturn(user);

        Object response = userService.updateUser(request);

        assertInstanceOf(SuccessfulResponse.class, response);
        SuccessfulResponse r = (SuccessfulResponse) response;
        assertEquals("Usuario actualizado exitosamente", r.getMessage());
        verify(userRepository, times(1)).save(any(UserEntity.class));
    }

    @Test
    void testUpdateUser_NotFound() {
        UpdateUserRequest request = new UpdateUserRequest(
                99L, "999999", "8888888", "Dir",
                "A", "B", "C", "test", "test@mail.com", Set.of("ADMIN")
        );

        RoleEntity role = new RoleEntity();
        role.setName("ADMIN");

        when(rolesRepository.findByNameIn(anyCollection())).thenReturn(List.of(role));

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        Object response = userService.updateUser(request);

        assertInstanceOf(UnsuccessfulResponse.class, response);
        UnsuccessfulResponse r = (UnsuccessfulResponse) response;
        assertEquals("Usuario no encontrado", r.getError());
    }

    @Test
    void testDisableUser_Success() {
        UserEntity user = new UserEntity();
        user.setUserId(1L);
        user.setUsername("cnina");
        user.setEnabled(true);
        user.setAccountNoLocked(true);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        Object response = userService.disableUser(1L);

        assertInstanceOf(SuccessfulResponse.class, response);
        SuccessfulResponse r = (SuccessfulResponse) response;
        assertEquals("Usuario deshabilitado exitosamente", r.getMessage());
        assertFalse(user.isEnabled());
        assertFalse(user.isAccountNoLocked());
    }

    @Test
    void testDisableUser_NotFound() {
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());
        Object response = userService.disableUser(123L);

        assertInstanceOf(UnsuccessfulResponse.class, response);
        UnsuccessfulResponse r = (UnsuccessfulResponse) response;
        assertEquals("Usuario no encontrado", r.getError());
    }
}
