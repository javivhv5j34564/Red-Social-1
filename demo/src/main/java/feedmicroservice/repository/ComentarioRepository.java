package feedmicroservice.repository;

import feedmicroservice.model.Comentario;
import feedmicroservice.model.FeedPublicaciones;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComentarioRepository extends JpaRepository<Comentario, Long> {
    List<Comentario> findByPublicacion(FeedPublicaciones publicacion);
}