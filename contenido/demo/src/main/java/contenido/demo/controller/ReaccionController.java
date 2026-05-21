package contenido.demo.controller;

import contenido.demo.dto.ReaccionDTO;
import contenido.demo.model.Reaccion;
import contenido.demo.service.ReaccionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reacciones")
public class ReaccionController {

    private final ReaccionService service;

    public ReaccionController(ReaccionService service) {
        this.service = service;
    }

    @PostMapping
    public Reaccion crear(@RequestBody ReaccionDTO dto) {
        return service.crear(dto);
    }

    @GetMapping("/publicacion/{idPublicacion}")
    public List<Reaccion> obtenerPorPublicacion(@PathVariable String idPublicacion) {
        return service.obtenerPorPublicacion(idPublicacion);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable String id) {
        service.eliminar(id);
    }
}

