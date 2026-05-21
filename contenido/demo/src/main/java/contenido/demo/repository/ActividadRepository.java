package contenido.demo.repository;

import contenido.demo.model.Actividad;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ActividadRepository extends MongoRepository<Actividad, String> {

    List<Actividad> findByIdUsuario(String idUsuario);
}
