@echo off
title msUsuario
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd msUsuario
echo Iniciando Microservicio Usuario con Java 17...
mvnw.cmd spring-boot:run
pause
