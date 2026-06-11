# 🐳 Guía Rápida: Ejecutar en Docker

> Esta es la forma más fácil para que todos los desarrolladores usen la misma configuración sin problemas de Vercel.

## ✅ Requisitos Previos

- **Docker Desktop** instalado y corriendo
  - [Descargar Docker Desktop](https://www.docker.com/products/docker-desktop)
  - Verificar: `docker --version` en terminal

## 🚀 Inicio Rápido (Windows, Mac, Linux)

### Opción 1: Script Automático (Recomendado)

**Windows (PowerShell):**
```powershell
.\docker-start.ps1
```

**Mac/Linux (Bash):**
```bash
chmod +x docker-start.sh
./docker-start.sh
```

### Opción 2: Comandos Manuales

```bash
# 1. Construir las imágenes
docker-compose build

# 2. Iniciar servicios
docker-compose up -d

# 3. Esperar ~30 segundos, luego acceder a:
# http://localhost:3000
```

## 📋 Comandos Útiles

```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs de la aplicación
docker-compose logs -f app

# Ver logs de MySQL
docker-compose logs -f mysql

# Detener todo
docker-compose down

# Detener y limpiar volúmenes (BORRA datos)
docker-compose down -v

# Reiniciar la aplicación
docker-compose restart app

# Ejecutar comando dentro del contenedor
docker-compose exec app npm run build
```

## 🔧 Configuración Personalizada

Editar `.env.docker` para cambiar:
- `APP_PORT`: Puerto donde corre la app (default: 3000)
- `MYSQL_PASSWORD`: Contraseña de MySQL (default: tramites_pass)
- Base de datos, usuario, etc.

Después de editar, reiniciar:
```bash
docker-compose up -d --force-recreate
```

## 🐛 Troubleshooting

### Puerto 3000 ya en uso
```bash
# Cambiar en .env.docker:
APP_PORT=3001
docker-compose up -d
```

### MySQL no inicia
```bash
# Ver logs
docker-compose logs mysql

# Si sigue fallando, limpiar volúmenes
docker-compose down -v
docker-compose up -d
```

### Cambios en código no se ven
```bash
# Reconstruir imagen
docker-compose build app
docker-compose restart app
```

## 📦 Estructura Docker

```
app (Next.js 16)
  ↓ (localhost:3000)
  
mysql (Base de datos)
  ↓ (localhost:3306)
```

## ✨ Notas Importantes

- ✅ **Base de datos persiste** entre reinicios (en volumen `mysql_data`)
- ✅ **Variables de entorno** se cargan de `.env.docker`
- ✅ **Hot reload** NO funciona en Docker (cambios requieren `docker-compose restart app`)
- ✅ **Sin dependencia de Vercel** - completamente local

## 🎯 Para Pasar a Compañeros

1. Compartir este repo
2. Decirles que ejecuten el script `docker-start.sh` (o `.ps1` en Windows)
3. ¡Listo! Funciona igual para todos

---

**¿Problemas?** Revisar logs:
```bash
docker-compose logs
```
