@echo off
title msContenido
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd contenido\demo
echo Iniciando Microservicio Contenido con Java 17...
mvnw.cmd spring-boot:run
pause
