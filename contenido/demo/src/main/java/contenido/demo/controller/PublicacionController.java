package contenido.demo.controller;

import contenido.demo.dto.PublicacionDTO;
import contenido.demo.model.Publicacion;
import contenido.demo.service.PublicacionService;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/publicaciones")
public class PublicacionController {

    private final PublicacionService service;

    public PublicacionController(PublicacionService service) {
        this.service = service;
    }

    @PostMapping
    public Publicacion crear(@RequestBody PublicacionDTO dto) {
        return service.crearPublicacion(dto);
    }

    @GetMapping
    public List<Publicacion> obtenerTodas() {
        return service.obtenerTodas();
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<Publicacion> obtenerPorUsuario(@PathVariable String idUsuario) {
        return service.obtenerPorUsuario(idUsuario);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable String id) {
        service.eliminar(id);
    }
}
