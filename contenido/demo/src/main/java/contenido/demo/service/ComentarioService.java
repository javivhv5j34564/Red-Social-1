package contenido.demo.service;

import contenido.demo.model.Comentario;
import contenido.demo.repository.ComentarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ComentarioService {

    private final ComentarioRepository repository;

    public ComentarioService(ComentarioRepository repository) {
        this.repository = repository;
    }

    public Comentario crear(Comentario comentario) {
        return repository.save(comentario);
    }

    public List<Comentario> obtenerPorPublicacion(String idPublicacion) {
        return repository.findByIdPublicacion(idPublicacion);
    }

    public void eliminar(String id) {
        repository.deleteById(id);
    }
}
