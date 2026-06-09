# 🐳 Guía de Dockerización - Sistema de Gestión de Trámites

## Descripción General
Esta guía te permitirá desplegar la aplicación completa (Next.js + MySQL) usando Docker y Docker Compose.

---

## 📋 Prerrequisitos
- ✅ Docker instalado (versión 20.10+)
- ✅ Docker Compose instalado (versión 2.0+)
- ✅ El repositorio clonado localmente

### Verificar instalación:
```bash
docker --version
docker-compose --version
```

---

## 🚀 Opción 1: Despliegue Rápido (Recomendado)

### Paso 1: Preparar variables de entorno
```bash
# Copiar el archivo de configuración
cp .env.docker .env

# (Opcional) Editar valores si quieres cambiar contraseñas o puertos
# Por defecto:
# - App en: http://localhost:3000
# - MySQL en: localhost:3306
```

### Paso 2: Iniciar servicios
```bash
# Construir imágenes e iniciar servicios
docker-compose up -d

# Ver logs en tiempo real (Ctrl+C para salir)
docker-compose logs -f app

# Ver solo logs de la app
docker-compose logs -f app

# Ver logs de MySQL
docker-compose logs -f mysql
```

### Paso 3: Verificar que está funcionando
```bash
# Esperar 20-30 segundos para que MySQL esté listo
# Luego visita: http://localhost:3000
```

### Paso 4: Detener servicios
```bash
# Detener sin eliminar datos
docker-compose stop

# Detener y eliminar contenedores (datos persisten en volumen)
docker-compose down

# Detener y eliminar TODO (volumen, red, etc)
docker-compose down -v
```

---

## 🔧 Opción 2: Construir imagen manualmente

### Construir imagen
```bash
# Construir con tag personalizado
docker build -t tramites-app:1.0 .

# Construir para plataforma específica (ej: ARM para Mac)
docker buildx build --platform linux/amd64 -t tramites-app:1.0 .
```

### Ejecutar contenedor
```bash
# Ejecutar aplicación solamente (sin MySQL)
docker run -d \
  --name tramites-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=3306 \
  -e DB_NAME=tramites_univalle \
  -e DB_USER=tramites_user \
  -e DB_PASSWORD=tramites_pass \
  tramites-app:1.0
```

---

## 🗄️ Configurar MySQL en Docker

### Con Docker Compose (RECOMENDADO)
El archivo `docker-compose.yml` ya incluye MySQL. Simplemente ejecuta:
```bash
docker-compose up -d
```

### Manual (sin Compose)
```bash
# Crear red Docker
docker network create tramites_network

# Ejecutar MySQL
docker run -d \
  --name tramites_mysql \
  --network tramites_network \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=tramites_univalle \
  -e MYSQL_USER=tramites_user \
  -e MYSQL_PASSWORD=tramites_pass \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  mysql:8.0-alpine

# Importar schema (después de esperar a que MySQL esté listo)
docker exec -i tramites_mysql mysql -u root -prootpassword tramites_univalle < db.sql
```

---

## 📊 Monitoreo y Logs

### Ver estado de servicios
```bash
docker-compose ps
# Salida esperada:
# NAME                STATUS              PORTS
# tramites_mysql      Up (healthy)        0.0.0.0:3306->3306/tcp
# tramites_app        Up                  0.0.0.0:3000->3000/tcp
```

### Ver logs en tiempo real
```bash
# Todos los servicios
docker-compose logs -f

# Solo aplicación
docker-compose logs -f app

# Solo MySQL
docker-compose logs -f mysql

# Últimas 50 líneas
docker-compose logs --tail=50 app
```

### Acceder a contenedor en ejecución
```bash
# Shell de la aplicación
docker-compose exec app sh

# Shell de MySQL
docker-compose exec mysql sh

# Comandos MySQL
docker-compose exec mysql mysql -u tramites_user -ptramites_pass tramites_univalle
```

---

## 🔐 Variables de Entorno en Docker

Las siguientes variables pueden configurarse en `.env`:

```env
# Aplicación
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://localhost:3000
APP_PORT=3000

# Base de datos
DB_HOST=mysql
DB_PORT=3306
DB_NAME=tramites_univalle
DB_USER=tramites_user
DB_PASSWORD=tramites_pass
MYSQL_ROOT_PASSWORD=rootpassword

# JWT
JWT_SECRET=tu_secret_seguro_aqui
```

### Cambiar variables en tiempo de ejecución
```bash
docker-compose stop
# Editar .env
docker-compose up -d
```

---

## 📦 Volúmenes Persistentes

### Estructura de volúmenes
```yaml
volumes:
  mysql_data:        # Datos de MySQL
  uploads:           # Archivos cargados por usuarios
  documents:         # Documentos adjuntos
```

### Ver volúmenes
```bash
docker volume ls | grep tramites

docker volume inspect tramites_mysql_data
```

### Backup de datos MySQL
```bash
# Crear backup
docker-compose exec mysql mysqldump -u tramites_user -ptramites_pass tramites_univalle > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar desde backup
docker-compose exec -T mysql mysql -u tramites_user -ptramites_pass tramites_univalle < backup_20240609_120000.sql
```

---

## 🐛 Troubleshooting

### "Connection refused" en aplicación
```bash
# Verificar que MySQL está listo
docker-compose ps

# Ver logs de MySQL
docker-compose logs mysql

# Esperar 30 segundos y reintentar
```

### Puerto ya en uso
```bash
# Cambiar puerto en .env
APP_PORT=3001

# O liberar puerto
lsof -i :3000
kill -9 <PID>
```

### Rebuild de imágenes
```bash
# Fuerza rebuild de imágenes
docker-compose up -d --build --force-recreate

# Limpiar imágenes sin usar
docker image prune -a
```

### Eliminar todo y comenzar de nuevo
```bash
# ADVERTENCIA: Esto elimina volúmenes y datos
docker-compose down -v
rm -rf mysql_data/

# Reconstruir
docker-compose up -d --build
```

---

## 🌍 Producción

### Variables seguras
Usar secretos de Docker en producción:
```bash
# En lugar de variables en .env
docker secret create jwt_secret -
docker secret create db_password -
```

### Limpieza antes de producción
```bash
# Remover archivos de desarrollo
rm -f .env.docker .env.local

# Cambiar contraseñas fuertes
# Usar secretos en lugar de variables de entorno
```

### Escalado (si usas Swarm)
```bash
docker service scale tramites_app=3
```

---

## 📝 Ejemplo: Workflow Típico

```bash
# 1. Clonar y navegar
cd app-tramites/

# 2. Preparar configuración
cp .env.docker .env
nano .env  # Editar si es necesario

# 3. Iniciar
docker-compose up -d

# 4. Verificar
docker-compose ps
curl http://localhost:3000

# 5. Ver logs
docker-compose logs -f app

# 6. Hacer cambios en código
# (Los cambios requieren rebuild)
docker-compose up -d --build

# 7. Cuando termines
docker-compose down
```

---

## ✅ Checklist pre-producción

- [ ] Cambiar `JWT_SECRET` a valor seguro
- [ ] Cambiar contraseña de MySQL
- [ ] Configurar backups automáticos
- [ ] Probar recuperación desde backup
- [ ] Configurar volúmenes para uploads
- [ ] Probar en ambiente staging
- [ ] Configurar health checks
- [ ] Documentar proceso de deployment
- [ ] Plan de rollback

---

## 📞 Soporte

Para más información sobre Docker:
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Node.js + Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

**Última actualización**: Junio 2026
**Versión de Next.js**: 16.2.0
**Versión de MySQL**: 8.0-alpine
**Versión de Node**: 20-alpine
