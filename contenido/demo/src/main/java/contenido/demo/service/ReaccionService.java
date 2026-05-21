package contenido.demo.service;

import contenido.demo.dto.ReaccionDTO;
import contenido.demo.model.Reaccion;
import contenido.demo.repository.ReaccionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReaccionService {

    private final ReaccionRepository repository;

    public ReaccionService(ReaccionRepository repository) {
        this.repository = repository;
    }

    public Reaccion crear(ReaccionDTO dto) {
        Reaccion r = new Reaccion();
        r.setIdPublicacion(dto.getIdPublicacion());
        r.setIdUsuario(dto.getIdUsuario());
        r.setTipo(dto.getTipo());
        return repository.save(r);
    }

    public List<Reaccion> obtenerPorPublicacion(String idPublicacion) {
        return repository.findByIdPublicacion(idPublicacion);
    }

    public void eliminar(String id) {
        repository.deleteById(id);
    }
}
