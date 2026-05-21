package contenido.demo.controller;

import contenido.demo.dto.ActividadDTO;
import contenido.demo.model.Actividad;
import contenido.demo.service.ActividadService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/actividades")
public class ActividadController {

    private final ActividadService service;

    public ActividadController(ActividadService service) {
        this.service = service;
    }

    @PostMapping
    public Actividad crear(@RequestBody ActividadDTO dto) {
        return service.crear(dto);
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<Actividad> obtenerPorUsuario(@PathVariable String idUsuario) {
        return service.obtenerPorUsuario(idUsuario);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable String id) {
        service.eliminar(id);
    }
}
