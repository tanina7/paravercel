# ⚡ Inicio Rápido - Docker

## Pasos en 5 minutos

### 1️⃣ Copiar configuración
```bash
cp .env.docker .env
```

### 2️⃣ Iniciar aplicación
```bash
docker-compose up -d
```

### 3️⃣ Abrir en navegador
```
http://localhost:3000
```

### 4️⃣ Ver estado
```bash
docker-compose ps
```

### 5️⃣ Ver logs (si algo no funciona)
```bash
docker-compose logs -f app
```

---

## Detener
```bash
docker-compose down
```

## Más detalles
Ver [DOCKER.md](DOCKER.md) para guía completa.

---

**¡Eso es todo! La aplicación estará disponible en http://localhost:3000**
