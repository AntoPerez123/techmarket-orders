# TechMarket Orders - CI/CD Blue-Green Deployment

## Descripción del proyecto

Este proyecto implementa una estrategia de despliegue continuo para el microservicio **TechMarket Orders**, encargado del procesamiento de pedidos en línea.

La solución fue diseñada utilizando **GitHub Actions**, **Kubernetes** y **AWS EKS** para demostrar un flujo CI/CD orientado a reducir downtime, facilitar rollback y mejorar la continuidad operativa del negocio.

## Objetivo

Implementar y demostrar una estrategia de despliegue **Blue-Green Deployment** para el microservicio TechMarket Orders, asegurando alta disponibilidad, bajo riesgo en producción y capacidad de rollback rápido.

## Estrategias analizadas

Durante el análisis se compararon cuatro estrategias de despliegue:

- **All-in-one:** despliega toda la nueva versión de una sola vez. Es rápida, pero tiene alto riesgo de downtime.
- **Rolling Update:** actualiza los pods gradualmente. Reduce interrupciones, pero pueden convivir versiones distintas durante el despliegue.
- **Canary:** libera la nueva versión a una parte reducida de usuarios. Reduce riesgo, pero requiere mayor monitoreo.
- **Blue-Green:** mantiene dos versiones paralelas, una estable y una nueva. Permite validar antes de redirigir tráfico y facilita rollback rápido.

## Estrategia seleccionada

La estrategia seleccionada para **TechMarket Orders** fue **Blue-Green Deployment**.

Se eligió esta estrategia porque el microservicio Orders es crítico para el procesamiento de pedidos en línea. Si este servicio falla, puede afectar ventas y experiencia del cliente.

Blue-Green permite mantener una versión estable activa mientras se despliega y valida una nueva versión en paralelo. Si la nueva versión presenta problemas, el rollback puede realizarse rápidamente redirigiendo el tráfico nuevamente hacia la versión estable.

## Tecnologías utilizadas

- GitHub Actions
- AWS EKS
- Kubernetes
- AWS CloudShell
- kubectl
- YAML manifests
- GitHub Secrets

## Estructura del repositorio

```text
.github/workflows/
├── eks-rollout.yml
├── pipeline.yml
├── template_build.yml
├── template_test.yml
└── template_deploy.yml

k8s/
├── blue-green.yaml
├── canary.yaml
├── recreate.yaml
├── rolling-update.yaml
└── service.yaml


Antonia Pérez
AUY1104 - Ciclo de Vida del Software II
Evaluación Parcial N°2