package msUsuario.demo.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import msUsuario.demo.DTO.UsuarioCreateDTO;
import msUsuario.demo.DTO.UsuarioResponseDTO;
import msUsuario.demo.Model.Usuario;
import msUsuario.demo.Model.Relacion;
import msUsuario.demo.Repository.UsuarioRepository;
import msUsuario.demo.Repository.RelacionRepository;
import msUsuario.demo.Exception.RelacionInvalidaException;
import msUsuario.demo.Exception.UsuarioNotFoundException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RelacionRepository relacionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ============================
    // CREAR USUARIO
    // ============================
    public UsuarioResponseDTO crearUsuario(UsuarioCreateDTO dto) {
        Usuario u = new Usuario();
        u.setNombre(dto.getNombre());
        u.setDescripcion(dto.getDescripcion());
        u.setTelefono(dto.getTelefono());
        u.setPassword(passwordEncoder.encode(dto.getPassword()));
        u.setFotoPerfil(dto.getFotoPerfil());

        usuarioRepository.save(u);
        return mapToDTO(u);
    }

    // ============================
    // OBTENER USUARIO
    // ============================
    public UsuarioResponseDTO obtenerUsuario(Long id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new UsuarioNotFoundException("Usuario no encontrado"));

        return mapToDTO(u);
    }

    // ============================
    // OBTENER TODOS
    // ============================
    public List<UsuarioResponseDTO> obtenerTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // ============================
    // ACTUALIZAR USUARIO
    // ============================
    public UsuarioResponseDTO actualizarUsuario(Long id, UsuarioCreateDTO dto) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new UsuarioNotFoundException("Usuario no encontrado"));

        if (dto.getNombre() != null) u.setNombre(dto.getNombre());
        if (dto.getDescripcion() != null) u.setDescripcion(dto.getDescripcion());
        if (dto.getTelefono() != null) u.setTelefono(dto.getTelefono());
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            u.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        if (dto.getFotoPerfil() != null) u.setFotoPerfil(dto.getFotoPerfil());

        usuarioRepository.save(u);
        return mapToDTO(u);
    }

    // ============================
    // SEGUIR A OTRO USUARIO
    // ============================
    public void seguir(Long idSeguidor, Long idSeguido) {

        if (idSeguidor.equals(idSeguido)) {
            throw new RelacionInvalidaException("No puedes seguirte a ti mismo");
        }

        Usuario seguidor = usuarioRepository.findById(idSeguidor)
                .orElseThrow(() -> new UsuarioNotFoundException("Seguidor no encontrado"));

        Usuario seguido = usuarioRepository.findById(idSeguido)
                .orElseThrow(() -> new UsuarioNotFoundException("Seguido no encontrado"));

        // Verificar si ya existe la relación
        boolean existe = relacionRepository.existsBySeguidorAndSeguido(seguidor, seguido);
        if (existe) {
            throw new RelacionInvalidaException("Ya sigues a este usuario");
        }

        // Crear relación
        Relacion r = new Relacion();
        r.setSeguidor(seguidor);
        r.setSeguido(seguido);
        r.setFecha(LocalDateTime.now());

        relacionRepository.save(r);
    }

    // ============================
    // MAPEO A DTO
    // ============================
    private UsuarioResponseDTO mapToDTO(Usuario u) {
        int siguiendo = relacionRepository.countBySeguidor(u);
        int seguidores = relacionRepository.countBySeguido(u);

        return new UsuarioResponseDTO(
                u.getId(),
                u.getNombre(),
                u.getDescripcion(),
                u.getTelefono(),
                u.getFotoPerfil(),
                seguidores,
                siguiendo
        );
    }
}
