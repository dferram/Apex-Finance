@echo off
setlocal
title Apex Finance - Lanzador Local (Dev)
color 0b

:: Cambiar al directorio del proyecto
cd /d "D:\Ferram\Personal\Apex Finance"

echo ==========================================
echo       APEX FINANCE - MODO DESARROLLO
echo ==========================================
echo.

:: Iniciar el servidor de Next.js en modo dev (ventana minimizada)
echo [+] Arrancando servidor de desarrollo...
start /min "Apex Dev Server" cmd /c "npm run dev"

:: Esperar a que el servidor este listo (suele ser mas rapido que el start)
echo [+] Esperando que el servidor se eleve (8s)...
timeout /t 8 /nobreak >nul

:: Abrir la aplicacion en el navegador predeterminado
echo [+] Abriendo Apex Finance en el navegador...
start http://localhost:3000

echo.
echo ==========================================
echo       APEX FINANCE ESTA CORRIENDO!
echo ==========================================
echo El servidor sigue activo en la ventana minimizada.
echo Para detenerlo, cierra la ventana llamada "Apex Dev Server".
echo.

pause
exit
