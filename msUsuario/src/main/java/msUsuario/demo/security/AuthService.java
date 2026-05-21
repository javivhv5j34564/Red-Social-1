
package msUsuario.demo.security;

import msUsuario.demo.Model.Usuario;
import msUsuario.demo.Repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import msUsuario.demo.DTO.UsuarioLoginDTO;
import msUsuario.demo.Exception.CredencialesInvalidasException;


@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Usuario login(UsuarioLoginDTO dto) {
        Usuario usuario = usuarioRepository.findByTelefono(dto.getTelefono())
                .orElseThrow(() -> new CredencialesInvalidasException("Teléfono o contraseña incorrectos"));

        if (!passwordEncoder.matches(dto.getPassword(), usuario.getPassword())) {
            throw new CredencialesInvalidasException("Teléfono o contraseña incorrectos");
        }

        return usuario;
    }
}

