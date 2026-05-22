package msUsuario.demo.Model;
import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(name = "relaciones")
public class Relacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "seguidor_id")
    private Usuario seguidor;

    @ManyToOne
    @JoinColumn(name = "seguido_id")
    private Usuario seguido;

    private LocalDateTime fecha;

    public Relacion() {} // ← IMPORTANTE

    public void setSeguidor(Usuario seguidor) {
        this.seguidor = seguidor;
    }

    public void setSeguido(Usuario seguido) {
        this.seguido = seguido;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}


