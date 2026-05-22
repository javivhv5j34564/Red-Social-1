Configuración MySQL para msUsuario

Para usar MySQL en lugar de H2 (producción/desarrollo local con MySQL):

1. Asegúrate de tener MySQL corriendo en localhost:3306.
2. Crea la base de datos si no existe:

```sql
CREATE DATABASE msusuario CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Usuario y contraseña por defecto en `application.properties`:

spring.datasource.url=jdbc:mysql://localhost:3306/msusuario?useSSL=false&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root

Cambia `root`/`root` por las credenciales reales en entornos seguros.

4. Ejecuta la aplicación (Maven wrapper):

```bash
cd msUsuario
mvnw.cmd spring-boot:run
```

Hibernate usará `spring.jpa.hibernate.ddl-auto=update` para crear/actualizar las tablas automáticamente.

Notas:
- Si prefieres usar perfiles, crea `application-local.properties` y `application-prod.properties` y activa con `-Dspring.profiles.active=local`.
- Para entornos compartidos, considera gestionar credenciales con variables de entorno o un vault.