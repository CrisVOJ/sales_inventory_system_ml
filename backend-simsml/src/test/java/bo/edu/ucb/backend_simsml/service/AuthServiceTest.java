package bo.edu.ucb.backend_simsml.service;

import bo.edu.ucb.backend_simsml.config.security.jwt.JwtUtils;
import bo.edu.ucb.backend_simsml.dto.auth.AuthLoginRequest;
import bo.edu.ucb.backend_simsml.dto.auth.AuthResponse;
import bo.edu.ucb.backend_simsml.entity.PermissionEntity;
import bo.edu.ucb.backend_simsml.entity.RoleEntity;
import bo.edu.ucb.backend_simsml.entity.UserEntity;
import bo.edu.ucb.backend_simsml.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class AuthServiceTest {

    @InjectMocks
    private AuthService authService;

    @Mock
    private UserRepository userRepository;
    @Mock
    private JwtUtils jwtUtils;
    @Mock
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    private UserEntity createMockUser() {
        PermissionEntity perm1 = new PermissionEntity();
        perm1.setName("READ");

        RoleEntity role = new RoleEntity();
        role.setName("ADMIN");
        role.setPermissions(Set.of(perm1));

        UserEntity user = new UserEntity();
        user.setUsername("testuser");
        user.setPassword("encodedpass");
        user.setEnabled(true);
        user.setAccountNoExpired(true);
        user.setCredentialNoExpired(true);
        user.setAccountNoLocked(true);
        user.setRoles(Set.of(role));

        return user;
    }

    @Test
    void testLoadUserByUsername_Success_ReturnUserDetails() {
        UserEntity mockUser = createMockUser();
        when(userRepository.findUserEntityByUsername("testuser")).thenReturn(Optional.of(mockUser));

        UserDetails userDetails = authService.loadUserByUsername("testuser");

        assertNotNull(userDetails);
        assertEquals("testuser", userDetails.getUsername());
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("READ")));
    }

    @Test
    void testLoadUserByUsername_UserNotFound() {
        when(userRepository.findUserEntityByUsername("unknown")).thenReturn(Optional.empty());

        assertThrows(
                org.springframework.security.core.userdetails.UsernameNotFoundException.class,
                () -> authService.loadUserByUsername("unknown")
        );
    }

    @Test
    void testLoadUserByUsername_UserDisabled() {
        UserEntity mockUser = createMockUser();
        mockUser.setEnabled(false);
        when(userRepository.findUserEntityByUsername("disabledUser")).thenReturn(Optional.of(mockUser));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.loadUserByUsername("disabledUser"));
        assertTrue(ex.getMessage().contains("no esta habilitada"));
    }

    @Test
    void testAuthenticate_Success_ReturnAuthToken() {
        UserEntity mockUser = createMockUser();
        when(userRepository.findUserEntityByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("1234", "encodedpass")).thenReturn(true);

        Authentication auth = authService.authenticate("testuser", "1234");

        assertNotNull(auth);
        assertEquals("testuser", auth.getPrincipal());
    }

    @Test
    void testAuthenticate_UserNotFound() {
        when(userRepository.findUserEntityByUsername("noexist")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> authService.authenticate("noexist", "1234"));
    }

    @Test
    void testAuthenticate_PasswordIncorrect() {
        UserEntity mockUser = createMockUser();
        when(userRepository.findUserEntityByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("wrong", "encodedpass")).thenReturn(false);

        assertThrows(BadCredentialsException.class,
                () -> authService.authenticate("testuser", "wrong"));
    }

    @Test
    void testLoginUser_Success_ValidCredentials() {
        UserEntity mockUser = createMockUser();
        when(userRepository.findUserEntityByUsername("testuser")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("1234", "encodedpass")).thenReturn(true);
        when(jwtUtils.createToken(any())).thenReturn("fake-jwt-token");

        AuthLoginRequest request = new AuthLoginRequest("testuser", "1234");
        AuthResponse response = authService.loginUser(request);

        assertNotNull(response);
        assertEquals("testuser", response.username());
        assertEquals("fake-jwt-token", response.jwt());
        assertTrue(response.status());
    }
}
