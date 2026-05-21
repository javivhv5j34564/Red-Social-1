package contenido.demo.controller;

import contenido.demo.model.Comentario;
import contenido.demo.service.ComentarioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comentarios")
public class ComentarioController {

    private final ComentarioService service;

    public ComentarioController(ComentarioService service) {
        this.service = service;
    }

    @PostMapping
    public Comentario crear(@RequestBody Comentario comentario) {
        return service.crear(comentario);
    }

    @GetMapping("/publicacion/{idPublicacion}")
    public List<Comentario> obtenerPorPublicacion(@PathVariable String idPublicacion) {
        return service.obtenerPorPublicacion(idPublicacion);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable String id) {
        service.eliminar(id);
    }
}
