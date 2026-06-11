# 📋 Instrucciones Docker para Compañeros

## ¿Por qué Docker y no Vercel?

❌ **Vercel tenía problemas con:**
- Context hooks (`useAuth()`) durante prerendering
- Arquitectura Edge Functions incompatible con base de datos
- Middleware que no puede acceder a conexiones complejas

✅ **Docker ofrece:**
- Control total del entorno
- Same setup para todo el equipo
- Fácil de compartir y reproducir
- Sin sorpresas en producción

---

## 🚀 Cómo Empezar (3 minutos)

### 1️⃣ Requisitos Mínimos
- Descargar e instalar **Docker Desktop**
  - [Windows/Mac](https://www.docker.com/products/docker-desktop)
  - [Linux](https://docs.docker.com/engine/install/)
- Tener git clonado (ya tienes el repo)

### 2️⃣ Comando Mágico

**Windows (PowerShell/CMD):**
```powershell
.\docker-start.ps1
```

**Mac/Linux (Terminal):**
```bash
chmod +x docker-start.sh
./docker-start.sh
```

### 3️⃣ Esperar 30 segundos y acceder
```
👉 http://localhost:3000
```

✅ ¡Listo! La app está corriendo localmente con su propia base de datos.

---

## 🔧 Cambiar Configuración

Editar `.env.docker` en la raíz del proyecto:

```env
# Puerto de la app (default 3000)
APP_PORT=3001

# Password de MySQL
MYSQL_PASSWORD=tu_password_segura
```

Luego reiniciar:
```bash
docker-compose up -d --force-recreate
```

---

## 📍 Arquitectura Local

```
Tu Computadora
│
├─ Docker Network (tramites_network)
│  │
│  ├─ App Container (Next.js 16)
│  │  ├─ Puerto: 3000
│  │  └─ Env: .env.docker
│  │
│  └─ MySQL Container
│     ├─ Puerto: 3306
│     ├─ Database: tramites_univalle
│     └─ Datos: volumen persistente
│
└─ Browser
   └─ http://localhost:3000
```

---

## 🛠️ Comandos Útiles

| Comando | Qué hace |
|---------|----------|
| `docker-compose ps` | Ver estado de containers |
| `docker-compose logs app` | Ver logs de la app |
| `docker-compose logs mysql` | Ver logs de MySQL |
| `docker-compose restart app` | Reiniciar app |
| `docker-compose down` | Parar todo (datos persisten) |
| `docker-compose down -v` | Parar y limpiar TODO |

---

## 🐛 Solucionar Problemas

### ❌ "Puerto 3000 en uso"
```bash
# Opción 1: Cambiar puerto en .env.docker
APP_PORT=3001

# Opción 2: Matar lo que usa el puerto (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### ❌ "Docker no inicia"
```bash
# Docker Desktop no está corriendo
# → Abre Docker Desktop y espera a que inicie completamente
```

### ❌ "MySQL connection error"
```bash
# MySQL puede necesitar más tiempo
docker-compose logs mysql

# Si falla:
docker-compose down -v
docker-compose up -d
```

### ❌ "Los cambios de código no aparecen"
```bash
# Docker no hace hot-reload automático
# Opción 1: Reiniciar app
docker-compose restart app

# Opción 2: Reconstruir todo
docker-compose down
docker-compose up -d
```

---

## 🎯 Flujo de Trabajo para el Equipo

### Día 1: Setup
```bash
1. git clone <repo>
2. cd <repo>
3. ./docker-start.sh  (o .ps1 en Windows)
4. Esperar 30 segundos
5. http://localhost:3000 ✅
```

### Días Siguientes: Desarrollo
```bash
# Al iniciar sesión
./docker-start.sh

# Hacer cambios en el código
# ...

# Si cambios no aparecen, reiniciar
docker-compose restart app

# Al terminar
docker-compose down  (datos se guardan)
```

---

## 📦 Estructura del Proyecto

```
PR2-26-APP-Tramites-UV-B--C-/
├─ Dockerfile          ← Imagen de la app
├─ docker-compose.yml  ← Configuración de servicios
├─ .env.docker.example ← Variables de ejemplo
├─ docker-start.sh     ← Script de inicio (Mac/Linux)
├─ docker-start.ps1    ← Script de inicio (Windows)
├─ DOCKER_INICIO.md    ← Esta documentación
└─ app/                ← Código Next.js
```

---

## ✨ Ventajas de usar Docker

| Aspecto | Vercel | Docker |
|--------|--------|--------|
| Setup | Complejo con errores | Un comando |
| Base de datos | En la nube (lento) | Local (rápido) |
| Consistencia | Problemas | Todos igual |
| Debugging | Difícil | Fácil |
| Costos | Por mensajes | Gratis |
| Offline | ❌ | ✅ |

---

## 🎓 Preguntas Frecuentes

**P: ¿Necesito saber de Docker?**
A: No, solo ejecuta los scripts.

**P: ¿Se pierden los datos al apagar?**
A: No, todo se guarda en volúmenes de Docker.

**P: ¿Puedo cambiar la password de MySQL?**
A: Sí, en `.env.docker` y luego `docker-compose restart`.

**P: ¿Cómo paso esto a producción?**
A: El mismo Dockerfile funciona en cualquier servidor con Docker.

---

## 🆘 Ayuda Rápida

Si algo falla:
1. Verifica que Docker Desktop esté corriendo
2. `docker-compose logs` para ver errores
3. `docker-compose down -v && docker-compose up -d` para reset
4. Si sigue fallando, compartir los logs del comando anterior

---

**¡Listo para compartir con el equipo!** 🚀
