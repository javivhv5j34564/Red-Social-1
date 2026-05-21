@echo off
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo ==============================================
echo   INICIANDO MICROSERVICIOS DE LA RED SOCIAL
echo ==============================================
echo Asegurate de tener encendidos MySQL y MongoDB.
echo.

echo 1. Iniciando Eureka Server...
start "Eureka Server" cmd /k "cd server\server && mvnw.cmd spring-boot:run"
timeout /t 10 /nobreak > nul

echo 2. Iniciando API Gateway...
start "API Gateway" cmd /k "cd API-GATEWAY && mvnw.cmd spring-boot:run"
timeout /t 5 /nobreak > nul

echo 3. Iniciando MS-Usuario...
start "Microservicio Usuario" cmd /k "cd msUsuario && mvnw.cmd spring-boot:run"

echo 4. Iniciando MS-Contenido...
start "Microservicio Contenido" cmd /k "cd contenido\demo && mvnw.cmd spring-boot:run"

echo 5. Iniciando MS-Feed...
start "Microservicio Feed" cmd /k "cd demo && mvnw.cmd spring-boot:run"

echo.
echo ==============================================
echo Todos los microservicios se estan iniciando en ventanas separadas.
echo Espera unos segundos a que carguen completamente (veras que las letras dejan de moverse).
echo.
echo Despues, abre el archivo "index.html" de tu carpeta del frontend.
echo ==============================================
pause
