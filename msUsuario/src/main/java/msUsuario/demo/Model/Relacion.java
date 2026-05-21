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
    private Usuario seguidor;

    @ManyToOne
    private Usuario seguido;

    private LocalDateTime fecha;
}

