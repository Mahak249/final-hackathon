# Data Model: Phase IV Kubernetes Deployment

**Feature**: 003-k8s-deployment
**Date**: 2026-01-28

## Overview

Phase IV does not introduce new application data models. Instead, it defines infrastructure entities that represent Kubernetes resources and deployment artifacts.

---

## Infrastructure Entities

### 1. Docker Image

Packaged container image containing application code and runtime dependencies.

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | Image name (e.g., `todo-backend`, `todo-frontend`) |
| tag | string | Version tag (e.g., `1.0.0-abc1234`) |
| registry | string | Registry location (default: `minikube` local) |
| size | number | Image size in MB |
| created | datetime | Build timestamp |

**Relationships**:
- One Docker Image → Many Pods (deployed instances)

---

### 2. Helm Release

Deployed instance of a Helm chart with specific values.

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | Release name (e.g., `todo-backend`, `todo-frontend`) |
| chart | string | Chart name |
| version | string | Chart version |
| namespace | string | Kubernetes namespace |
| status | enum | deployed, failed, pending-install, pending-upgrade |
| values | object | Applied configuration values |

**Relationships**:
- One Helm Release → One Deployment
- One Helm Release → One Service
- One Helm Release → Zero/One ConfigMap
- One Helm Release → Zero/One Secret

---

### 3. Deployment

Kubernetes Deployment resource managing pod replicas.

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | Deployment name |
| namespace | string | Kubernetes namespace |
| replicas | number | Desired replica count |
| availableReplicas | number | Ready replica count |
| image | string | Container image reference |
| strategy | enum | RollingUpdate, Recreate |

**Relationships**:
- One Deployment → Many Pods
- One Deployment → One Service (via selector)

---

### 4. Service

Kubernetes Service resource for network access.

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | Service name |
| namespace | string | Kubernetes namespace |
| type | enum | ClusterIP, NodePort, LoadBalancer |
| port | number | Service port |
| targetPort | number | Container port |
| nodePort | number | External port (if NodePort type) |
| selector | object | Pod selector labels |

**Relationships**:
- One Service → Many Pods (load balanced)

---

### 5. ConfigMap

Kubernetes ConfigMap for non-sensitive configuration.

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | ConfigMap name |
| namespace | string | Kubernetes namespace |
| data | object | Key-value configuration pairs |

**Relationships**:
- One ConfigMap → Many Pods (mounted as env vars or files)

---

### 6. Secret

Kubernetes Secret for sensitive configuration.

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | Secret name |
| namespace | string | Kubernetes namespace |
| type | enum | Opaque, kubernetes.io/tls, etc. |
| data | object | Base64-encoded key-value pairs |

**Relationships**:
- One Secret → Many Pods (mounted as env vars or files)

---

### 7. Pod

Running instance of containerized application.

| Attribute | Type | Description |
|-----------|------|-------------|
| name | string | Pod name (auto-generated) |
| namespace | string | Kubernetes namespace |
| status | enum | Pending, Running, Succeeded, Failed, Unknown |
| ip | string | Pod IP address |
| node | string | Node name where scheduled |
| restarts | number | Container restart count |

**Relationships**:
- One Pod → One Deployment (owner)
- One Pod → One/Many Containers

---

## Namespace Structure

```
Namespace: todo
├── Deployments
│   ├── todo-backend (replicas: 1)
│   └── todo-frontend (replicas: 2)
├── Services
│   ├── todo-backend (ClusterIP, port: 8000)
│   └── todo-frontend (NodePort, port: 3000)
├── ConfigMaps
│   ├── todo-backend-config
│   └── todo-frontend-config
└── Secrets
    └── todo-secrets
```

---

## Entity State Transitions

### Deployment Lifecycle

```
┌─────────────┐    helm install    ┌──────────────┐
│   (none)    │ ───────────────────► │   Pending    │
└─────────────┘                    └──────────────┘
                                          │
                                          │ pods scheduled
                                          ▼
                                   ┌──────────────┐
                                   │  Progressing │
                                   └──────────────┘
                                          │
                        ┌─────────────────┼─────────────────┐
                        │                 │                 │
                 pods ready        pods failing       timeout
                        │                 │                 │
                        ▼                 ▼                 ▼
                 ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
                 │   Available  │  │    Failed    │  │   Stalled    │
                 └──────────────┘  └──────────────┘  └──────────────┘
```

### Pod Lifecycle

```
┌──────────┐    scheduled    ┌──────────┐    containers    ┌──────────┐
│ Pending  │ ────────────────► │ Running  │ ───completed────► │Succeeded │
└──────────┘                 └──────────┘                  └──────────┘
      │                            │
      │ schedule failed            │ container crash
      ▼                            ▼
┌──────────┐                 ┌──────────┐
│  Failed  │                 │  Failed  │ (may restart)
└──────────┘                 └──────────┘
```

---

## Configuration Data

### Backend ConfigMap Values

| Key | Description | Example |
|-----|-------------|---------|
| CORS_ORIGINS | Allowed CORS origins | `http://todo-frontend:3000` |
| BACKEND_HOST | Bind address | `0.0.0.0` |
| BACKEND_PORT | Listen port | `8000` |

### Frontend ConfigMap Values

| Key | Description | Example |
|-----|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | `http://todo-backend:8000` |

### Secret Values (not committed)

| Key | Description |
|-----|-------------|
| DATABASE_URL | Neon PostgreSQL connection string |
| JWT_SECRET | JWT signing key |
| OPENAI_API_KEY | OpenAI API key (if used) |

---

## Validation Rules

1. **Namespace**: Must be `todo` for all resources
2. **Replica Count**: Frontend must have 2 replicas, Backend must have 1
3. **Image Tag**: Must follow semantic version format `X.Y.Z-commitHash`
4. **Service Type**: Frontend uses NodePort, Backend uses ClusterIP
5. **Probes**: All deployments must have liveness and readiness probes defined
6. **Resource Limits**: Should be defined (required before Phase V)
