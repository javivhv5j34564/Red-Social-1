package msUsuario.demo.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import msUsuario.demo.DTO.UsuarioResponseDTO;
import msUsuario.demo.DTO.UsuarioCreateDTO;
import msUsuario.demo.Service.UsuarioService;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> crear(@RequestBody UsuarioCreateDTO dto) {
        return ResponseEntity.ok(usuarioService.crearUsuario(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obtenerUsuario(id));
    }

    @PostMapping("/{idSeguidor}/seguir/{idSeguido}")
    public ResponseEntity<String> seguir(
            @PathVariable Long idSeguidor,
            @PathVariable Long idSeguido) {

        usuarioService.seguir(idSeguidor, idSeguido);
        return ResponseEntity.ok("Ahora sigues a este usuario");
    }

    @GetMapping("/all")
    public ResponseEntity<List<UsuarioResponseDTO>> obtenerTodos() {
        return ResponseEntity.ok(usuarioService.obtenerTodos());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> actualizar(@PathVariable Long id, @RequestBody UsuarioCreateDTO dto) {
        return ResponseEntity.ok(usuarioService.actualizarUsuario(id, dto));
    }
}
