package feedmicroservice.repository;

import feedmicroservice.model.Feed;
import feedmicroservice.model.FeedPublicaciones;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PublicacionesRepository extends JpaRepository<FeedPublicaciones, Long> {
    List<FeedPublicaciones> findByFeed(Feed feed);
}