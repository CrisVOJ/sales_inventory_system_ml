package bo.edu.ucb.backend_simsml.repository;

import bo.edu.ucb.backend_simsml.entity.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface RolesRepository extends JpaRepository<RoleEntity, Long> {

    Optional<RoleEntity> findByName(String name);
    List<RoleEntity> findByNameIn(Collection<String> names);

}
