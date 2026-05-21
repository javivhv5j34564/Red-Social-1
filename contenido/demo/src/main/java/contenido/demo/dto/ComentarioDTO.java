package contenido.demo.dto;

import lombok.Data;

@Data
public class ComentarioDTO {

    private String idPublicacion;
    private String idUsuario;
    private String texto;
}
