# TechMarket Orders - CI/CD Blue-Green Deployment

## Descripción del Proyecto

Este proyecto implementa una estrategia de despliegue continuo para el microservicio **TechMarket Orders**, encargado del procesamiento de pedidos en línea.

La solución fue diseñada considerando principios DevOps y metodologías ágiles, utilizando pipelines CI/CD automatizados con GitHub Actions y estrategias modernas de despliegue orientadas a minimizar downtime y mejorar la continuidad operativa.

---

# Objetivos

- Implementar un pipeline CI/CD automatizado.
- Aplicar una estrategia Blue-Green Deployment.
- Reducir el riesgo de fallos en producción.
- Garantizar alta disponibilidad del servicio.
- Facilitar rollback rápido ante incidentes.
- Mejorar la continuidad operativa y la agilidad del negocio.

---

# Estrategias de Despliegue Analizadas

## 1. All-In-Once

Despliega toda la nueva versión simultáneamente reemplazando la versión anterior.

### Ventajas
- Implementación rápida.
- Bajo costo operativo.

### Desventajas
- Alto riesgo de downtime.
- Rollback complejo.
- Riesgo elevado en sistemas críticos.

---

## 2. Rolling Update

Actualiza gradualmente las instancias o pods del sistema.

### Ventajas
- Menor downtime.
- Actualización progresiva.

### Desventajas
- Posibles inconsistencias entre versiones.
- Rollback más lento.

---

## 3. Canary Deployment

Despliega la nueva versión solo para un pequeño porcentaje de usuarios.

### Ventajas
- Reducción de riesgo.
- Permite validación gradual.

### Desventajas
- Mayor complejidad operativa.
- Requiere monitoreo avanzado.

---

## 4. Blue-Green Deployment

Mantiene dos entornos idénticos: Blue (activo) y Green (nuevo).

### Ventajas
- Cero downtime.
- Rollback inmediato.
- Alta disponibilidad.

### Desventajas
- Mayor consumo de infraestructura.
- Mayor costo operativo.

---

# Estrategia Seleccionada

## Blue-Green Deployment

La estrategia seleccionada para el microservicio "Orders" fue Blue-Green Deployment debido a que el servicio requiere:

- Alta disponibilidad.
- Continuidad operativa.
- Rollback rápido.
- Baja interrupción para usuarios.
- Protección del SLA.
- Menor riesgo en despliegues críticos.

Esta estrategia permite mantener un entorno estable en producción mientras se despliega y valida una nueva versión en un entorno paralelo.

---

# Arquitectura Utilizada

- GitHub Actions
- Docker
- Kubernetes (EKS)
- AWS
- YAML Deployments
- CI/CD Pipeline

---

# Pipeline CI/CD

El pipeline automatizado incluye las siguientes etapas:

## Build
Compilación y preparación del microservicio Orders.

## Test
Validación y pruebas del servicio antes del despliegue.

## Deploy
Despliegue automatizado mediante estrategia Blue-Green.

## Post-Deploy Validation
Verificación de disponibilidad y estabilidad del servicio.

## Rollback
Capacidad de volver inmediatamente a la versión anterior ante incidentes.

---

# Estructura del Proyecto

```txt
.github/workflows/
├── pipeline.yml
├── template_build.yml
├── template_test.yml
└── template_deploy.yml

k8s/
├── blue-green.yaml
├── canary.yaml
├── recreate.yaml
└── rolling-update.yaml
```

# Continuidad Operativa

La estrategia Blue-Green contribuye a la continuidad operativa al mantener dos entornos disponibles simultáneamente. Esto permite realizar despliegues sin interrumpir el servicio y ejecutar rollback inmediato en caso de falla.

---

# Agilidad del Negocio

La automatización CI/CD permite:

- Entregas más rápidas.
- Menor intervención manual.
- Reducción de errores humanos.
- Integración continua.
- Mayor velocidad de respuesta ante cambios.

---

# Evidencias

## Pipeline GitHub Actions
Capturas del pipeline ejecutándose correctamente.

## Deploy Blue-Green
Capturas de despliegue y cambio de tráfico.

## Logs
Validación de build, test y deploy.

---

# Autor

Antonia Pérez  
AUY1104 - Ciclo de Vida del Software II

---

# Declaración Uso IA

Se utilizó inteligencia artificial como apoyo para explicación conceptual.