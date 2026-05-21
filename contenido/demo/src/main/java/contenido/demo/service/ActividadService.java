package contenido.demo.service;

import contenido.demo.dto.ActividadDTO;
import contenido.demo.model.Actividad;
import contenido.demo.repository.ActividadRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActividadService {

    private final ActividadRepository repository;

    public ActividadService(ActividadRepository repository) {
        this.repository = repository;
    }

    public Actividad crear(ActividadDTO dto) {
        Actividad a = new Actividad();
        a.setIdUsuario(dto.getIdUsuario());
        a.setTipo(dto.getTipo());
        a.setReferenciaId(dto.getReferenciaId());
        return repository.save(a);
    }

    public List<Actividad> obtenerPorUsuario(String idUsuario) {
        return repository.findByIdUsuario(idUsuario);
    }

    public void eliminar(String id) {
        repository.deleteById(id);
    }
}
