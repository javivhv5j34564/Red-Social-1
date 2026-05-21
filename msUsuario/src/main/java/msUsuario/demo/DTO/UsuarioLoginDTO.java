package msUsuario.demo.DTO;


public class UsuarioLoginDTO {
    private String telefono;
    private String password;

    public UsuarioLoginDTO() {}

    public UsuarioLoginDTO(String telefono, String password) {
        this.telefono = telefono;
        this.password = password;
    }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

