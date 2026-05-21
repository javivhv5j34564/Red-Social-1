package msUsuario.demo.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import msUsuario.demo.Model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByTelefono(String telefono);
}
