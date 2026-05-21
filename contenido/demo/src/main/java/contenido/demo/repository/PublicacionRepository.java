package contenido.demo.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import contenido.demo.model.Publicacion;

public interface PublicacionRepository extends MongoRepository<Publicacion, String> {

    List<Publicacion> findByIdUsuario(String idUsuario);
}

