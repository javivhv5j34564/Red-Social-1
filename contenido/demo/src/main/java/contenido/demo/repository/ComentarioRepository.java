package contenido.demo.repository;

import contenido.demo.model.Comentario;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ComentarioRepository extends MongoRepository<Comentario, String> {

    List<Comentario> findByIdPublicacion(String idPublicacion);
}
