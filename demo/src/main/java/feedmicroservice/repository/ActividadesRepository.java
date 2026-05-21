package feedmicroservice.repository;

import feedmicroservice.model.Feed;
import feedmicroservice.model.FeedActividades;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActividadesRepository extends JpaRepository<FeedActividades, Long> {
    List<FeedActividades> findByFeed(Feed feed);
}