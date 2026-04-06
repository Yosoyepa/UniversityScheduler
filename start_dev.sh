#!/bin/bash

# UniversityScheduler - Local Development Startup Script
# This script initializes the database, backend, and frontend concurrently.

# Exit immediately if a command exits with a non-zero status
set -e

# Define color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}==============================================${NC}"
echo -e "${YELLOW}🚀 Iniciando entorno de desarrollo de UniScheduler${NC}"
echo -e "${BLUE}==============================================${NC}"

# Function to clean up background processes on script exit (Ctrl+C)
cleanup() {
    echo -e "\n${RED}🛑 Apagando servicios locales...${NC}"
    pkill -P $$ || true
    echo -e "${GREEN}Entorno detenido correctamente.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

DOCKER_CMD="docker compose"
if command -v docker-compose &> /dev/null; then
    DOCKER_CMD="docker-compose"
fi

# 1. Cleanup old containers to free ports
echo -e "\n${GREEN}[1/4] Limpiando contenedores Docker activos...${NC}"
# Baja los contenedores de este proyecto si los hubiera
$DOCKER_CMD down --remove-orphans || true

# Opcionalmente, detener TODOS los contenedores corriendo si el usuario lo necesita para limpiar puertos.
ACTIVE_CONTAINERS=$(docker ps -q)
if [ ! -z "$ACTIVE_CONTAINERS" ]; then
    echo -e "${YELLOW}Se detectaron otros contenedores corriendo. Deteniéndolos para asegurar puertos limpios...${NC}"
    docker stop $ACTIVE_CONTAINERS
fi

# 2. Start PostgreSQL
echo -e "\n${GREEN}[2/4] Iniciando la Base de Datos PostgreSQL...${NC}"
$DOCKER_CMD up -d

echo "Esperando 4 segundos a que la base de datos acepte conexiones..."
sleep 4

# 3. Apply Alembic Migrations
echo -e "\n${GREEN}[3/4] Ejecutando migraciones de base de datos (Alembic)...${NC}"
if [ -d "backend/.venv" ]; then
    (
        cd backend
        source .venv/bin/activate
        alembic upgrade head
    )
else
    echo -e "${RED}Error: El entorno virtual del backend no existe.${NC}"
    exit 1
fi

# 4. Start Backend (FastAPI) & Frontend (Next.js) Concurrently
echo -e "\n${GREEN}[4/4] Iniciando Servidores Web...${NC}"
(
    cd backend
    source .venv/bin/activate
    echo -e "${BLUE}Backend corriendo en http://localhost:8000${NC}"
    uvicorn app.main:app --reload --port 8000
) &

if [ -d "frontend/node_modules" ]; then
    (
        cd frontend
        echo -e "${BLUE}Frontend corriendo en http://localhost:3000${NC}"
        npm run dev
    ) &
else
    echo -e "${RED}Error: node_modules del frontend no existe.${NC}"
    echo "Ejecutando npm install en frontend..."
    (
        cd frontend
        npm install
        npm run dev
    ) &
fi

echo -e "\n${GREEN}✅ Todos los servicios han sido iniciados.${NC}"
echo -e "${YELLOW}Aplicación Web: http://localhost:3000${NC}"
echo -e "${YELLOW}API Docs (Swagger): http://localhost:8000/docs${NC}"
echo -e "\n${BLUE}Presiona Ctrl+C para detener ambos servidores.${NC}"

wait
