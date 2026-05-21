package contenido.demo.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "comentarios")
public class Comentario {

    @Id
    private String id;

    private String idPublicacion;
    private String idUsuario;
    private String texto;
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}

