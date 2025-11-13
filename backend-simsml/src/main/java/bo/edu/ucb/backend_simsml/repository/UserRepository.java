package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.dto.user.UserResponse;
import bo.edu.ucb.backend_simsml.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.userdetails.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    @EntityGraph(attributePaths = "roles")
    @Query(value = "SELECT u FROM users u " +
            "WHERE (" +
            ":filter IS NULL OR " +
            "u.identityDoc ILIKE %:filter% OR " +
            "u.name ILIKE %:filter% OR " +
            "u.paternalSurname ILIKE %:filter% OR " +
            "u.maternalSurname ILIKE %:filter%) AND " +
            "(:status IS NULL OR u.isEnabled = :status)"
    )
    Page<UserEntity> findAlleUsers(@Param("filter") String filter, @Param("status") Boolean status, Pageable pageable);

    Optional<UserEntity> findUserEntityByUsername(String username);

    @Query(value = "SELECT u.userId FROM users u WHERE u.username = :username")
    Optional<Long> findIdByUsername(@Param("username") String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

}
