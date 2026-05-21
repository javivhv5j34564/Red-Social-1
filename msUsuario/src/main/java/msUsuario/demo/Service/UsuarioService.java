package msUsuario.demo.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import msUsuario.demo.DTO.UsuarioCreateDTO;
import msUsuario.demo.DTO.UsuarioResponseDTO;
import msUsuario.demo.Model.Usuario;
import msUsuario.demo.Repository.UsuarioRepository;
import msUsuario.demo.Exception.RelacionInvalidaException;
import msUsuario.demo.Exception.UsuarioNotFoundException;

import java.util.List;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UsuarioResponseDTO crearUsuario(UsuarioCreateDTO dto) {
        Usuario u = new Usuario();
        u.setNombre(dto.getNombre());
        u.setDescripcion(dto.getDescripcion());
        u.setTelefono(dto.getTelefono());
        u.setPassword(passwordEncoder.encode(dto.getPassword()));

        usuarioRepository.save(u);
        return mapToDTO(u);
    }

    public UsuarioResponseDTO obtenerUsuario(Long id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new UsuarioNotFoundException("Usuario no encontrado"));

        return mapToDTO(u);
    }

    public List<UsuarioResponseDTO> obtenerTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    public void seguir(Long idSeguidor, Long idSeguido) {
        if (idSeguidor.equals(idSeguido)) {
            throw new RelacionInvalidaException("No puedes seguirte a ti mismo");
        }

        Usuario seguidor = usuarioRepository.findById(idSeguidor)
                .orElseThrow(() -> new UsuarioNotFoundException("Seguidor no encontrado"));

        Usuario seguido = usuarioRepository.findById(idSeguido)
                .orElseThrow(() -> new UsuarioNotFoundException("Seguido no encontrado"));

        seguidor.getSiguiendo().add(seguido);
        usuarioRepository.save(seguidor);
    }

    private UsuarioResponseDTO mapToDTO(Usuario u) {
        return new UsuarioResponseDTO(
                u.getId(),
                u.getNombre(),
                u.getDescripcion(),
                u.getTelefono(),
                u.getFotoPerfil(),
                0,
                u.getSiguiendo().size()
        );
    }
}
