---
description: implementation checklist — mandatory compilation, linting, and build checks before any git commit
---

# Implementation Checklist (Pre-Commit Verification)

Este flujo de trabajo define los pasos **NO NEGOCIABLES** que el agente DEBE ejecutar **ANTES** de realizar cualquier `git commit`, `merge` o cierre de sprint. 

**Nunca hagas commit a ciegas.** Es tu responsabilidad absoluta comprobar que el código funciona y compila antes de registrarlo en el historial de versiones del proyecto.

## Paso 1: Verificación del Frontend (Si se alteraron archivos en `/frontend`)

1. **Verificación de Tipos TypeScript:**
   Ejecuta `npx tsc --noEmit` en el directorio `/frontend` para garantizar la consistencia estricta de tipos.
2. **Construcción del Build de Next.js (CRÍTICO):**
   Ejecuta `npm run build` en el directorio `/frontend`. 
   - *¿Por qué?* El App Router de Next.js y CSS compilers (como Tailwind v4) pueden fallar en casos límite que no siempre el entorno local o dev server acusa inmediatamente.
3. **Verificación del Linter:**
   Ejecuta `npm run lint` para analizar promesas sueltas, imports no usados o reglas de React no respetadas.

## Paso 2: Verificación del Backend (Si se alteraron archivos en `/backend`)

1. **Verificación Rápida de Sintaxis e Imports:**
   Ejecuta `python -c "import app.main"` desde el directorio `/backend`. Un exit code de `0` descarta errores circulares, dependencias faltantes y syntax errors graves.
2. **Tests (opcional pero sugerido):**
   Ejecuta `pytest` si escribiste pruebas automatizadas o de unidad.

## Paso 3: Corrección Activa (No-Commit Zone)

Si **cualesquiera** de los comandos del Paso 1 o Paso 2 terminan con un error (exit code distinto de `0`), **TIENES PROHIBIDO HACER COMMIT**.
- Analiza el log de error de consola.
- Realiza el hotfix o el parche en el código activo.
- Repite los comandos de análisis. 
- Debes obtener un estado limpio (success) repetible.

## Paso 4: Proceder al Commit

Exclusivamente cuando la validación del "build" y la compilación técnica sean 100% exitosas, puedes invocar la habilidad `git-commit` (Regla 3) para registrar formalmente los cambios.
