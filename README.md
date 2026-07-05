# TechMarket Orders - CI/CD Blue-Green con ECR, EKS y Rollback Automático

## Datos de la evaluación

**Asignatura:** AUY1104 - Ciclo de vida del Software II  
**Evaluación:** Evaluación Final Transversal  
**Caso:** Operación Resiliencia en TechMarket  
**Microservicio:** TechMarket Orders  
**Estudiante:** Antonia Pérez  
**Profesor:** Ricardo Aravena  
**Repositorio:** https://github.com/AntoPerez123/techmarket-orders  

---

## 1. Resumen del proyecto

Este repositorio implementa una solución DevOps para el microservicio crítico **TechMarket Orders**, considerando un flujo CI/CD con GitHub Actions, construcción de imagen Docker, publicación en Amazon ECR, manifiestos Kubernetes y una estrategia de despliegue **Blue-Green** con mecanismo de rollback automático.

El objetivo es transformar un despliegue riesgoso basado en RollingUpdate sin validaciones en una solución más robusta, controlada y preparada para escenarios de error. La propuesta incorpora validación de salud mediante endpoint `/health`, separación entre versión estable (**blue**) y versión nueva (**green**), cambio controlado de tráfico mediante Kubernetes Service y lógica de reversión automática ante fallas.

---

## 2. Objetivos técnicos

Los objetivos implementados son:

- Estandarizar el flujo CI/CD usando GitHub Actions.
- Crear plantillas reutilizables para pruebas, build Docker y publicación de imagen.
- Construir una imagen Docker real del microservicio TechMarket Orders.
- Publicar la imagen en Amazon ECR.
- Definir manifiestos Kubernetes para despliegue Blue-Green.
- Configurar health checks mediante readinessProbe, livenessProbe y endpoint `/health`.
- Diseñar un workflow de despliegue Blue-Green con rollback automático.
- Documentar la limitación encontrada en AWS Academy para la creación del clúster EKS.

---

## 3. Arquitectura propuesta

La arquitectura considera los siguientes componentes:

```text
GitHub Repository
│
├── app/
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── src/server.js
│
├── .github/workflows/
│   ├── pipeline.yml
│   ├── template_test.yml
│   ├── template_build.yml
│   └── deploy-bluegreen.yml
│
└── k8s/
    ├── namespace.yaml
    ├── blue-green.yaml
    └── service.yaml
```

Flujo general:

```text
Desarrollador
   │
   ▼
GitHub Push / Pull Request
   │
   ▼
GitHub Actions
   │
   ├── Test Node.js
   ├── Build Docker
   ├── Login Amazon ECR
   └── Push imagen a ECR
          │
          ▼
Amazon ECR
          │
          ▼
Amazon EKS / Kubernetes
          │
          ├── Deployment Blue
          ├── Deployment Green
          ├── Service orders-active
          └── Rollback automático ante falla
```

---

## 4. Microservicio TechMarket Orders

El microservicio fue desarrollado en Node.js con Express. Expone tres endpoints principales:

| Endpoint | Descripción |
|---|---|
| `/` | Retorna información general del servicio |
| `/orders` | Retorna una lista simulada de pedidos |
| `/health` | Retorna estado de salud del servicio |

El endpoint `/health` es clave para la estrategia de despliegue, porque permite validar si la versión nueva está funcionando correctamente antes de cambiar el tráfico productivo.

Ejemplo de respuesta exitosa:

```json
{
  "status": "ok",
  "version": "blue"
}
```

Ejemplo de falla simulada:

```json
{
  "status": "error",
  "message": "Falla simulada para activar rollback automatico",
  "version": "green"
}
```

La variable `FORCE_ERROR` permite simular un error 500 para probar el rollback automático.

---

## 5. Pipeline CI con GitHub Actions

El pipeline principal se encuentra en:

```text
.github/workflows/pipeline.yml
```

Este pipeline utiliza plantillas reutilizables:

```text
.github/workflows/template_test.yml
.github/workflows/template_build.yml
```

### 5.1 Etapa de pruebas

La etapa de pruebas ejecuta:

```text
npm install
npm test
```

Esto permite validar que el microservicio pueda instalar dependencias y ejecutar pruebas antes de construir la imagen Docker.

### 5.2 Etapa de build y push a ECR

La plantilla `template_build.yml` realiza:

```text
Checkout del repositorio
Validación de archivos de aplicación
Configuración de credenciales AWS
Login a Amazon ECR
Construcción de imagen Docker
Push de imagen a Amazon ECR
Confirmación de imagen publicada
```

El pipeline usa acciones oficiales:

```text
actions/checkout@v4
actions/setup-node@v4
aws-actions/configure-aws-credentials@v4
aws-actions/amazon-ecr-login@v2
```

Estas acciones permiten reducir scripts manuales, mejorar mantenibilidad y estandarizar la integración con AWS.

---

## 6. Amazon ECR

Se creó el repositorio privado:

```text
techmarket-orders
```

URI del repositorio:

```text
685011109847.dkr.ecr.us-east-1.amazonaws.com/techmarket-orders
```

El pipeline publica imágenes usando como tag el SHA del commit de GitHub:

```text
${{ github.sha }}
```

Esto permite trazabilidad entre:

```text
Commit GitHub -> Imagen Docker -> Despliegue Kubernetes
```

---

## 7. Estrategia de despliegue seleccionada: Blue-Green

Se seleccionó **Blue-Green Deployment** porque el microservicio `Orders` es crítico para TechMarket y requiere reducir el riesgo de caída durante cambios de versión.

### 7.1 Funcionamiento

La estrategia mantiene dos versiones del servicio:

| Versión | Rol |
|---|---|
| Blue | Versión estable actual |
| Green | Nueva versión candidata |

Ambas versiones existen como deployments separados:

```text
orders-blue
orders-green
```

El tráfico de usuarios entra por el servicio:

```text
orders-active
```

Inicialmente, `orders-active` apunta a la versión estable:

```yaml
selector:
  app: techmarket-orders
  version: blue
```

Cuando la versión green pasa la validación de salud, el pipeline cambia el selector del servicio:

```bash
kubectl patch service orders-active -n techmarket -p '{"spec":{"selector":{"app":"techmarket-orders","version":"green"}}}'
```

Con esto el tráfico cambia desde Blue hacia Green sin modificar directamente a los usuarios ni eliminar la versión estable.

---

## 8. Manifiestos Kubernetes

Los manifiestos se encuentran en:

```text
k8s/
```

Archivos principales:

| Archivo | Función |
|---|---|
| `namespace.yaml` | Crea namespace `techmarket` |
| `blue-green.yaml` | Define deployments `orders-blue` y `orders-green` |
| `service.yaml` | Define services `orders-blue`, `orders-green` y `orders-active` |

Los deployments incluyen:

```text
readinessProbe
livenessProbe
```

Ambos apuntan al endpoint:

```text
/health
```

Esto permite que Kubernetes detecte si un pod está listo para recibir tráfico o si debe reiniciarse.

---

## 9. Workflow de Deploy Blue-Green

El workflow de despliegue se encuentra en:

```text
.github/workflows/deploy-bluegreen.yml
```

Este workflow está diseñado para ejecutarse manualmente mediante `workflow_dispatch`.

Entradas:

| Input | Descripción |
|---|---|
| `image_tag` | Tag de la imagen a desplegar desde ECR |
| `force_error` | Permite simular error en la versión green |

Flujo del deploy:

```text
1. Checkout del repositorio
2. Configuración de credenciales AWS
3. Login a Amazon ECR
4. Definición de IMAGE_URI
5. Configuración de kubeconfig hacia EKS
6. Aplicación de namespace
7. Inyección dinámica de imagen en manifiestos
8. Despliegue de Blue y Green
9. Validación de rollout Green
10. Validación de salud Green
11. Cambio de tráfico a Green
12. Rollback automático a Blue si ocurre una falla
```

---

## 10. Validación de salud

Antes de mover el tráfico hacia Green, el pipeline ejecuta una validación de salud:

```bash
kubectl run healthcheck-green \
  --rm -i \
  --restart=Never \
  --namespace=$NAMESPACE \
  --image=curlimages/curl \
  -- curl -f http://orders-green:3000/health
```

Si el endpoint responde HTTP 200, el pipeline continúa y cambia el tráfico hacia Green.

Si el endpoint responde error 500 o falla la validación, el job se marca como fallido y se activa el rollback automático.

---

## 11. Rollback automático

El rollback se activa mediante la condición:

```yaml
if: failure()
```

Esto significa que si falla cualquier etapa anterior, el pipeline ejecuta una reversión automática.

Acciones del rollback:

```bash
kubectl patch service orders-active -n $NAMESPACE -p '{"spec":{"selector":{"app":"techmarket-orders","version":"blue"}}}'
kubectl rollout undo deployment/orders-green -n $NAMESPACE || true
kubectl describe service orders-active -n $NAMESPACE
```

El objetivo es que el servicio estable Blue siga recibiendo tráfico, reduciendo el impacto para los usuarios.

Flujo de remediación:

```text
Detección: Health Check falla
        ↓
Acción: Rollback automático
        ↓
Resultado: orders-active vuelve a Blue
        ↓
Continuidad: usuarios siguen consumiendo versión estable
```

---

## 12. Comparación de estrategias de despliegue

| Estrategia | Uptime | Rollback | Costo | Velocidad | Riesgo |
|---|---|---|---|---|---|
| All-in-one | Bajo | Difícil | Bajo | Alta | Alto |
| Rolling Update | Medio/Alto | Medio | Bajo | Media | Medio |
| Canary | Alto | Controlado | Medio | Media | Bajo/Medio |
| Blue-Green | Muy alto | Rápido | Más alto | Alta | Bajo |

### Justificación de Blue-Green

Blue-Green fue seleccionada porque:

- Permite mantener una versión estable activa.
- Reduce el downtime durante el cambio.
- Permite validar la versión nueva antes de recibir tráfico.
- Facilita rollback rápido cambiando el selector del Service.
- Es adecuada para un microservicio crítico como `Orders`.

La principal desventaja es el costo, porque se mantienen dos versiones corriendo al mismo tiempo. Sin embargo, para un servicio crítico, el costo adicional se justifica por la continuidad operativa y la reducción de riesgo.

---

## 13. Escenarios de error considerados

| Escenario | Causa posible | Detección | Remediación |
|---|---|---|---|
| Error 500 en Green | Bug en nueva versión | Health check `/health` | Rollback a Blue |
| CrashLoopBackOff | Error de aplicación o imagen | `kubectl rollout status` | Rollback / revisión de logs |
| Imagen inexistente | Tag incorrecto en ECR | Error al crear pod | Detener despliegue |
| Pod no Ready | ReadinessProbe fallida | Kubernetes no enruta tráfico | Mantener Blue |
| Error de configuración | Variables incorrectas | Fallo en pipeline | No cambiar tráfico |
| Falla de permisos AWS | Credenciales o IAM limitado | Error GitHub Actions/AWS | Documentar y corregir permisos |

---

## 14. Impacto en negocio

La solución aporta valor a TechMarket porque:

- Reduce errores manuales mediante pipelines automatizados.
- Mejora la trazabilidad entre código, imagen y despliegue.
- Disminuye el riesgo de caída del servicio Orders.
- Permite validar versiones antes de exponerlas a usuarios.
- Reduce el MTTR mediante rollback automático.
- Favorece una cultura DevOps alineada con mejora continua.

En términos operativos, el mecanismo de rollback reduce el impacto de una falla porque no requiere intervención manual inmediata para volver a la versión estable.

---

## 15. Evidencias generadas

Durante la implementación se generaron evidencias de:

| Evidencia | Descripción |
|---|---|
| E01-E15 | Repositorio base, app real, PRs iniciales |
| E16-E25 | Manifiestos Kubernetes Blue-Green |
| E26-E42 | Pipeline CI con test y build Docker |
| E43-E55 | Amazon ECR, secrets y push real de imagen |
| E56-E61 | CloudShell, identidad AWS e intento de creación EKS |
| E62-E67 | Workflow Deploy Blue-Green con rollback automático |

Evidencias destacadas:

```text
E52_pipeline_push_ecr_verde.png
E53_imagen_publicada_ecr.png
E60_error_creacion_eks_iam_permissions.png
E61_stack_eks_fallido_eliminado.png
E63_workflow_deploy_bluegreen_rollback.png
```

---

## 16. Limitación del entorno AWS Academy

Durante la implementación se intentó crear el clúster EKS mediante `eksctl`. Sin embargo, AWS Academy Learner Lab bloqueó la creación automática de roles IAM necesarios para EKS.

Error principal:

```text
not authorized to perform: iam:CreateRole
```

Debido a esta restricción del entorno académico, no fue posible completar la creación real del clúster EKS desde `eksctl`.

La limitación fue documentada con evidencia. A pesar de ello, se implementaron correctamente:

```text
Microservicio real
Dockerfile
Pipeline CI
Build Docker
Push real a Amazon ECR
Manifiestos Kubernetes Blue-Green
Workflow de Deploy Blue-Green
Health Check
Rollback automático con if: failure()
```

En un entorno AWS con permisos completos para EKS, el workflow `deploy-bluegreen.yml` queda preparado para ejecutar el despliegue y la remediación automática.

---

## 17. Comandos principales

### Ejecutar app local

```bash
cd app
npm install
npm start
```

### Probar endpoints

```bash
curl http://localhost:3000
curl http://localhost:3000/orders
curl http://localhost:3000/health
```

### Build Docker local

```bash
docker build -t techmarket-orders:local ./app
```

### Aplicar manifiestos Kubernetes

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/blue-green.yaml
kubectl apply -f k8s/service.yaml
```

### Cambiar tráfico hacia Green

```bash
kubectl patch service orders-active -n techmarket -p '{"spec":{"selector":{"app":"techmarket-orders","version":"green"}}}'
```

### Rollback hacia Blue

```bash
kubectl patch service orders-active -n techmarket -p '{"spec":{"selector":{"app":"techmarket-orders","version":"blue"}}}'
```

---

## 18. Estructura final del repositorio

```text
techmarket-orders/
│
├── app/
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       └── server.js
│
├── k8s/
│   ├── namespace.yaml
│   ├── blue-green.yaml
│   ├── canary.yaml
│   ├── recreate.yaml
│   ├── rolling-update.yaml
│   └── service.yaml
│
├── .github/
│   └── workflows/
│       ├── pipeline.yml
│       ├── template_test.yml
│       ├── template_build.yml
│       ├── deploy-bluegreen.yml
│       ├── template_deploy.yml
│       ├── eks-rollout.yml
│       └── remediation.yml
│
├── .gitignore
└── README.md
```

---

## 19. Conclusión

La solución implementada robustece el ciclo de vida del microservicio TechMarket Orders mediante automatización CI/CD, construcción Docker, publicación en Amazon ECR y diseño de despliegue Blue-Green con rollback automático.

Aunque el laboratorio AWS Academy presentó una restricción de permisos para crear EKS, el repositorio contiene los elementos técnicos principales solicitados: código fuente, workflows, plantillas reutilizables, manifiestos Kubernetes, estrategia avanzada de despliegue, validación de salud y remediación automática.

La estrategia Blue-Green permite reducir el riesgo operativo, mantener continuidad de servicio y mejorar la capacidad de recuperación ante fallas en un entorno DevOps.

---

## 20. Referencias

Amazon Web Services. (s. f.). *Amazon Elastic Container Registry User Guide*. AWS Documentation. https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html

Amazon Web Services. (s. f.). *Amazon Elastic Kubernetes Service User Guide*. AWS Documentation. https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html

GitHub. (s. f.). *GitHub Actions documentation*. GitHub Docs. https://docs.github.com/actions

Kubernetes. (s. f.). *Deployments*. Kubernetes Documentation. https://kubernetes.io/docs/concepts/workloads/controllers/deployment/

Kubernetes. (s. f.). *Services*. Kubernetes Documentation. https://kubernetes.io/docs/concepts/services-networking/service/

Kubernetes. (s. f.). *Configure Liveness, Readiness and Startup Probes*. Kubernetes Documentation. https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/

---

## 21. Declaración de uso de IA

Para el desarrollo de esta evaluación se utilizó apoyo de inteligencia artificial como herramienta de asistencia para estructurar documentación, ordenar evidencias, revisar redacción técnica.
La implementación, validación de comandos, configuración del repositorio, ejecución de pipelines, creación de evidencias y toma de decisiones técnicas fueron realizadas y revisadas por la estudiante.