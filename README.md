# test-manager-library-3145556-tool

> **Prueba técnica · Ficha ADSO 3145556**
> Entrega: **martes 13 de octubre de 2026, a las 5:00 p. m.** (17:00, hora Colombia).

Este repositorio guarda las **utilidades** de *Manager Library*: el sembrador de datos de demostración, que usa la API. **Empieza vacío a propósito**: se construye en el fork de cada aprendiz.

## Instrucciones

Cada aprendiz debe **crear el fork** de los seis repositorios del proyecto y **resolver el proyecto
con el spec planteado**.

1. Hacer fork, a su cuenta de GitHub, de cada repositorio de la tabla del final.
2. Leer el spec en [`test-manager-library-3145556-docs`](https://github.com/code-sena/test-manager-library-3145556-docs).
   Se entrega en dos versiones: `spec-python/` y `spec-.net/`.
3. Desarrollar en los forks.

## El reto se desarrolla con React y PHP (Laravel)

El spec está escrito para Python y para .NET, pero el reto **no** se hace en esos lenguajes:

| Capa | Tecnología del reto |
|---|---|
| Frontend | React |
| Backend | PHP con Laravel |

Lo que el spec define sobre el negocio —historias, criterios de aceptación, reglas, contrato de la
API, modelo de datos— se respeta. Lo que define sobre la tecnología se traduce a React y Laravel.

## La prueba no consiste en escribir el código

El propósito principal es ver la **capacidad de desempeño con SDD** (*Spec-Driven Development*,
desarrollo guiado por especificación): cómo se lee, se interpreta y se aplica una especificación
para llevarla a un stack distinto. El código es el medio, no el fin.

## Entrega

Cuenta lo que quede **subido a los forks antes de las 5:00 p. m.** (17:00). Lo que llegue después no se revisa.
No hay prórroga: suban avances parciales con commits pequeños durante la prueba.

## Los seis repositorios

| Repositorio | Qué va ahí |
|---|---|
| [`test-manager-library-3145556-docs`](https://github.com/code-sena/test-manager-library-3145556-docs) | El spec: `spec-python/` y `spec-.net/` |
| [`test-manager-library-3145556-api`](https://github.com/code-sena/test-manager-library-3145556-api) | Backend en PHP (Laravel) |
| [`test-manager-library-3145556-app`](https://github.com/code-sena/test-manager-library-3145556-app) | Frontend en React |
| [`test-manager-library-3145556-page`](https://github.com/code-sena/test-manager-library-3145556-page) | Sitio público estático de presentación |
| [`test-manager-library-3145556-infra`](https://github.com/code-sena/test-manager-library-3145556-infra) | Contenedores, red, volúmenes y motor de base de datos vacío |
| [`test-manager-library-3145556-tool`](https://github.com/code-sena/test-manager-library-3145556-tool) | Utilidades: sembrador de datos de demostración |


---

# Manager Library — tool (demo data seeder)

Fills a running Manager Library API with demo data **using only the HTTP contract** (no database access), as required by task T-21:

| Data | Amount |
|---|---|
| Books (all five categories) | 42 |
| Members | 10 |
| Loans | 15 (10 returned, 2 open and not yet due, **3 overdue**) |
| Users | 1 librarian (`bibliotecario`) next to the admin |

Past and overdue loans are created with the `X-Demo-Now` header (api-contract §5). The API honors it **only when it runs with `APP_ENV=demo`**;
the seeder detects when it was ignored and stops with a clear message.

## Requirements

Node.js 20+ (no dependencies to install).

## Run

1. In `infra/.env` set `APP_ENV=demo`, then restart the API: `docker compose up -d api` (from the `infra` repository).
2. Export the admin credentials (same values as `infra/.env`) and run:

```powershell
$env:ADMIN_USERNAME = "<admin user>"
$env:ADMIN_PASSWORD = "<admin password>"
node seed.mjs
```

Optional: `API_URL` (default `http://localhost:8000/api/v1`) and `SEED_LIBRARIAN_PASSWORD` (otherwise a random one is printed once).
No credential is stored in this repository; see `.env.example` for the variable names.

The seeder is **re-runnable**: books and members are matched by ISBN / document number, and loans are created only if none exist yet.

## Expected evidence

```
Books: 42
Members: 10
Loans created: 15
Overdue lines: 3
Report <from>..<to>: <n> rows; top: <title> (<times>)
```

`GET /loans/overdue` then returns 3 lines and `GET /reports/most-borrowed` has rows.

## Tests

```
npm test
```

Checks the plan (minimums of T-21, exactly 3 overdue loans, no member ever blocked by an overdue line while seeding, never more than 3 unreturned
books per member). The rule "the header is ignored outside demo mode" is tested in the API (`DemoHeaderClock`).
