package contenido.demo.repository;

import contenido.demo.model.Reaccion;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReaccionRepository extends MongoRepository<Reaccion, String> {

    List<Reaccion> findByIdPublicacion(String idPublicacion);
}
