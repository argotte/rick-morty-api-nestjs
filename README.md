# Proyecto NestJS con Prisma

Este proyecto utiliza el framework [NestJS](https://nestjs.com/) junto con [Prisma](https://www.prisma.io/) para la gestión de la base de datos.

## Descripción

Este proyecto es una aplicación de servidor construida con NestJS y Prisma. 

Consume la API de Rick & Morty que se puede conseguir en: https://rickandmortyapi.com/


## Instalación

Para instalar las dependencias del proyecto, ejecuta:

```bash
yarn install
```
Asegúrate de tener un archivo ```.env``` con las configuraciones necesarias para tu base de datos y otros servicios. En el repo existe el archivo ```.env.example``` donde se puede ver un ejemplo de como introducir credenciales. Copiar y pegar en ```env``` y modificar.

Instalar la migracion en tu base de datos de postgres

```bash
yarn prisma migrate dev
```
Luego para ejecutar

```bash
yarn start:dev
```

## Documentacion en Swagger

La documentación de la API está disponible en:

http://localhost:3000/api

## Al ejecutar por primera vez...

Al crearse la base de datos y estar todo vacío, se ejecutará el método de "alimentador" de base de datos, que llenará de registros las tablas creadas.
