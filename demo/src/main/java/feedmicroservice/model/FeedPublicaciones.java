package feedmicroservice.model;

import jakarta.persistence.*;

@Entity
@Table(name = "publicaciones")
public class FeedPublicaciones {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPublicaciones;

    @ManyToOne
    @JoinColumn(name = "idFeed")
    private Feed feed;

    private String contenido;

    // getters y setters
    public Long getIdPublicaciones() { return idPublicaciones; }
    public void setIdPublicaciones(Long idPublicaciones) { this.idPublicaciones = idPublicaciones; }
    public Feed getFeed() { return feed; }
    public void setFeed(Feed feed) { this.feed = feed; }
    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }
}