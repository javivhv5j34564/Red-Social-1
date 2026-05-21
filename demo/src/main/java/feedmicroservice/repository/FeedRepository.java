package feedmicroservice.repository;

import feedmicroservice.model.Feed;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedRepository extends JpaRepository<Feed, Long> {

    List<Feed> findByUsuarioDestinatario(Long usuarioDestinatario);
}