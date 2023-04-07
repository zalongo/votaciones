# Aplicación de Votaciones

Esta es una pequeña aplicación de votaciones desarrollada en HTML con Bootstrap 5.2.3, jQuery 3.6.4 y SASS 1.60.0. La aplicación consume una API Rest desarrollada en PHP que se encuentra en la dirección https://github.com/zalongo/votaciones-back.

## Dependencias

La aplicación utiliza las siguientes dependencias de NPM:

- inputmask
- jquery-validation
- sweetalert2
- chart.js

## Estructura de Archivos

- `src`: aquí se encuentra el código fuente de la aplicación.
- `dist`: aquí se encuentra la aplicación compilada y lista para ser desplegada.

## Instalación

Para instalar la aplicación, sigue estos pasos:

1. Clona el repositorio en tu computadora.
2. Instala las dependencias utilizando NPM: `npm install`.
3. Modifica la URL de la API en el archivo `src/js/config.js`.

## Scripts de NPM

El archivo package.json incluye los siguientes scripts:

1. start: inicia la aplicación en modo de desarrollo utilizando Webpack Dev Server y abre la aplicación en el navegador.
2. build: compila el código para producción utilizando Webpack. La aplicación compilada estará en la carpeta `dist`.

Para ejecutar cualquiera de estos scripts, abre una terminal y navega hasta el directorio raíz del proyecto, luego escribe `npm run <nombre_del_script>`.

## Uso

Abre el archivo `index.html` en tu navegador para utilizar la aplicación.

