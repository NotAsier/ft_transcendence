Fase 1 - Semana 1: Infraestructura y base (equipo de 5)

Objetivo:
Dejar el proyecto listo para que los 5 puedan trabajar en paralelo sin bloquearse.
Esta fase sigue siendo bloqueante, pero se divide para acelerar la entrega.

Responsabilidades por persona

Persona 1 - Infra Docker
- Docker Compose con contenedores: frontend, backend, PostgreSQL.
- Volumenes, red interna y healthchecks basicos.
- Comando unico de arranque del entorno local.

Persona 2 - HTTPS y entorno
- HTTPS configurado desde el principio (dev + base para prod).
- Certificados para desarrollo y documentacion de uso.
- Variables de entorno globales y validacion inicial.

Persona 3 - Base NestJS
- Estructura modular vacia de NestJS:
	AppModule, AuthModule, UsersModule, GameModule, ChatModule.
- Convencion de carpetas comun para todos los modulos.
- Endpoint de healthcheck del backend.

Persona 4 - Prisma y base de datos
- Preparar Prisma en backend.
- Proponer primer borrador de schema (entidades y relaciones base).
- Configurar migracion inicial y seed minimo de prueba.

Persona 5 - Integracion y calidad
- Integrar lo de las personas 1-4 en una rama de integracion.
- Crear .env.example completo y revisar que nadie suba secretos.
- Documentar pasos de setup en README (arranque limpio en maquina nueva).

Trabajo conjunto obligatorio (1-2 horas)
- Sesion de schema Prisma con las 5 personas.
- Cada persona define los datos que necesita para su modulo.
- Se cierra schema v1 con acuerdos de nombres y relaciones.

Dependencias y orden recomendado
1. Personas 1, 2 y 3 arrancan en paralelo desde el dia 1.
2. Persona 4 prepara borrador de schema mientras se estabiliza backend.
3. Se hace la sesion conjunta y se congela schema v1.
4. Persona 5 valida integracion final y documentacion.

Cronograma sugerido (Semana 1)
- Dia 1: Docker base + Nest base + HTTPS base.
- Dia 2: Prisma setup + borrador schema + .env.example.
- Dia 3: Sesion conjunta de schema y ajustes.
- Dia 4: Migraciones, seed minimo, pruebas de arranque.
- Dia 5: Integracion final, checklist y cierre de fase.

Checklist de salida de la fase
- docker compose up levanta todo sin errores.
- Frontend, backend y PostgreSQL conectan correctamente.
- HTTPS activo en entorno de desarrollo.
- .env.example completo y consistente con el codigo.
- Modulos NestJS creados y compilando.
- Prisma schema v1 cerrado + migracion inicial aplicada.
- README con pasos de instalacion y arranque desde cero.

Definicion de terminado
Al terminar esta fase, cualquier persona puede empezar su modulo sin bloquear a las demas.