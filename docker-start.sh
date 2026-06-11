#!/bin/bash

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🐳 Iniciando Docker Compose...${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker no está corriendo. Por favor abre Docker Desktop.${NC}"
    exit 1
fi

echo -e "${YELLOW}1. Construyendo imágenes...${NC}"
docker-compose build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al construir imágenes${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}2. Iniciando servicios...${NC}"
docker-compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al iniciar servicios${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}3. Esperando a que MySQL esté listo...${NC}"
sleep 15

echo ""
echo -e "${GREEN}✅ ¡Listo!${NC}"
echo ""
echo -e "📱 Accede a: ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "Ver logs: ${YELLOW}docker-compose logs -f app${NC}"
echo -e "Parar todo: ${YELLOW}docker-compose down${NC}"
