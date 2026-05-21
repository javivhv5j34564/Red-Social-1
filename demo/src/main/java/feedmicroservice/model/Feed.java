package feedmicroservice.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "feed")
public class Feed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idFeed;

    private Long usuarioDestinatario;

    @Enumerated(EnumType.STRING)
    private TipoFeed tipo;

    public enum TipoFeed {
        ACTIVIDAD,
        PUBLICACION
    }

    // getters y setters
    public Long getIdFeed() { return idFeed; }
    public void setIdFeed(Long idFeed) { this.idFeed = idFeed; }
    public Long getUsuarioDestinatario() { return usuarioDestinatario; }
    public void setUsuarioDestinatario(Long usuarioDestinatario) { this.usuarioDestinatario = usuarioDestinatario; }
    public TipoFeed getTipo() { return tipo; }
    public void setTipo(TipoFeed tipo) { this.tipo = tipo; }
}
