package msUsuario.demo.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import msUsuario.demo.Model.Relacion;
import msUsuario.demo.Model.Usuario;

public interface RelacionRepository extends JpaRepository<Relacion, Long> {

    boolean existsBySeguidorAndSeguido(Usuario seguidor, Usuario seguido);

    int countBySeguidor(Usuario seguidor);

    int countBySeguido(Usuario seguido);
}
