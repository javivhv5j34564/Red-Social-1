package contenido.demo.service;

import contenido.demo.dto.PublicacionDTO;
import contenido.demo.model.Publicacion;
import contenido.demo.repository.PublicacionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PublicacionService {

    private final PublicacionRepository repository;

    public PublicacionService(PublicacionRepository repository) {
        this.repository = repository;
    }

    public Publicacion crearPublicacion(PublicacionDTO dto) {
        Publicacion p = new Publicacion();
        p.setIdUsuario(dto.getIdUsuario());
        p.setTexto(dto.getTexto());
        p.setMultimedia(dto.getMultimedia());
        return repository.save(p);
    }

    public List<Publicacion> obtenerTodas() {
        return repository.findAll();
    }

    public List<Publicacion> obtenerPorUsuario(String idUsuario) {
        return repository.findByIdUsuario(idUsuario);
    }

    public void eliminar(String id) {
        repository.deleteById(id);
    }
}
