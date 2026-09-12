# MaestroArch Control Plane — Vercel

Frontend serverless para usar MaestroArch desde una web sin mantener un servidor de build encendido.

## Arquitectura

1. El usuario describe el producto en esta app Next.js.
2. `/api/build` dispara `product-builder.yml` mediante GitHub Actions.
3. GitHub Actions ejecuta MaestroArch, genera el producto y valida el build.
4. Opcionalmente publica el producto en GitHub y/o lo despliega en Vercel si los secretos correspondientes están configurados en el repositorio worker.
5. `/api/runs` consulta el estado del worker para mostrar progreso.

Este diseño separa el frontend liviano del trabajo pesado de generación y mantiene el control plane compatible con Vercel.

## Deploy

Crear un proyecto Vercel usando `control-plane/` como Root Directory.

Variables del proyecto Vercel:

```text
MAESTROARCH_CONTROL_GITHUB_TOKEN=
MAESTROARCH_CONTROL_REPOSITORY=sebastisnzoth/maestroarch
MAESTROARCH_CONTROL_BRANCH=main
```

El token queda únicamente del lado servidor y no se envía al navegador.

## Secretos del worker GitHub

Solo son necesarios para entrega externa:

```text
MAESTROARCH_GITHUB_TOKEN=
VERCEL_TOKEN=
```

Sin esos secretos, el worker puede seguir generando y validando productos; simplemente no publica/deploya externamente.
