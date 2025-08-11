package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findUserEntityByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

}
