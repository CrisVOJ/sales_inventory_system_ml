package bo.edu.ucb.backend_simsml.controller;

import bo.edu.ucb.backend_simsml.config.security.jwt.JwtUtils;
import bo.edu.ucb.backend_simsml.config.util.Globals;
import bo.edu.ucb.backend_simsml.dto.SuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.UnsuccessfulResponse;
import bo.edu.ucb.backend_simsml.dto.auth.AuthLoginRequest;
import bo.edu.ucb.backend_simsml.dto.auth.AuthResponse;
import bo.edu.ucb.backend_simsml.dto.user.CreateUserRequest;
import bo.edu.ucb.backend_simsml.dto.user.UpdatePasswordProfile;
import bo.edu.ucb.backend_simsml.dto.user.UpdateUserRequest;
import bo.edu.ucb.backend_simsml.service.AuthService;
import bo.edu.ucb.backend_simsml.service.UserService;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping(Globals.baseApi + "user")
//@PreAuthorize("hasRole('ADMIN')")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    @Autowired
    private AuthService authService;
    @Autowired
    private UserService userService;
    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/login")
    @PreAuthorize("permitAll()")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid AuthLoginRequest userRequest) {
        return new ResponseEntity<>(this.authService.loginUser(userRequest), HttpStatus.OK);
    }

    @PostMapping("/create")
    public ResponseEntity<Object> createUser(@Valid @RequestBody CreateUserRequest request) {
        try {
            Object response = userService.createUser(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al crear usuario", e.getMessage()));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<Object> updateUser(@Valid @RequestBody UpdateUserRequest request) {
        try {
            Object response = userService.updateUser(request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al actualizar usuario", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Object> getUsers(
            @RequestParam(value = "filter", required = false) String filter,
            @RequestParam(value = "status", required = false) Boolean status,
            @PageableDefault(sort = "name", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        try {
            Object response = userService.getUsers(filter, status, pageable);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener usuarios", e.getMessage()));
        }
    }

    @GetMapping("/")
    public ResponseEntity<Object> getUser(@RequestParam("userId") Long userId) {
        try {
            Object response = userService.getUserById(userId);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener usuario", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Object> getMyUser(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader
    ) {
        try {
            Long userId = jwtUtils.extractUserId(authHeader)
                    .orElseThrow(() -> new JWTVerificationException("User ID not found in token"));

            Object response = userService.getUserById(userId);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al obtener el usuario actual", e.getMessage()));
        }
    }

    @PutMapping("/updatePassword")
    public ResponseEntity<Object> updatePassword(
            @Valid @RequestBody UpdatePasswordProfile request,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader
    ) {
        try {
            Long userId = jwtUtils.extractUserId(authHeader)
                    .orElseThrow(() -> new JWTVerificationException("User ID not found in token"));

            Object response = userService.updatePassword(userId, request);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al actualizar contraseña", e.getMessage()));
        }
    }

    @DeleteMapping("/disable")
    public ResponseEntity<Object> disableUser(@RequestParam("userId") Long userId) {
        try {
            Object response = userService.disableUser(userId);
            return generateResponse(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UnsuccessfulResponse("400", "Error al deshabilitar usuario", e.getMessage()));
        }
    }

    private ResponseEntity<Object> generateResponse(Object response) {
        if (response instanceof SuccessfulResponse) {
            return ResponseEntity.ok(response);
        } else if (response instanceof UnsuccessfulResponse) {
            return ResponseEntity.status(Integer.parseInt(((UnsuccessfulResponse) response).getStatus()))
                    .body(response);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
