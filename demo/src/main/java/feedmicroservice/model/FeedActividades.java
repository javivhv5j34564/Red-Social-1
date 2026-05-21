package feedmicroservice.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "actividades")
public class FeedActividades {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idActividades;

    @ManyToOne
    @JoinColumn(name = "idFeed")
    private Feed feed;

    private String descripcion;

    // getters y setters
    public Long getIdActividades() { return idActividades; }
    public void setIdActividades(Long idActividades) { this.idActividades = idActividades; }
    public Feed getFeed() { return feed; }
    public void setFeed(Feed feed) { this.feed = feed; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}