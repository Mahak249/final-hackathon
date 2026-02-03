# Research: Phase IV Local Kubernetes Deployment

**Feature**: 003-k8s-deployment
**Date**: 2026-01-28

## Research Summary

This document captures research findings for deploying the Todo Chatbot application to local Kubernetes using Minikube, Helm, and AI-assisted tools.

---

## 1. Docker Multi-Stage Builds

### Decision
Use multi-stage Docker builds for both frontend (Next.js) and backend (FastAPI) applications.

### Rationale
- Reduces final image size by excluding build tools and dev dependencies
- Improves security by minimizing attack surface
- Faster deployment due to smaller images
- Industry standard for production containers

### Alternatives Considered
| Alternative | Why Rejected |
|------------|--------------|
| Single-stage builds | Larger images, includes unnecessary build tools |
| Distroless images | More complex, limited debugging capability |
| Alpine base images | Potential compatibility issues with Python packages |

### Implementation
- **Backend**: `python:3.11-slim` for runtime, `python:3.11` for build stage
- **Frontend**: `node:20-alpine` for build, `node:20-alpine` for runtime with standalone output

---

## 2. Minikube Configuration

### Decision
Use Minikube with Docker driver and 4GB memory / 2 CPU allocation.

### Rationale
- Docker driver is most portable across Windows/Mac/Linux
- 4GB sufficient for 3 pods + system components
- Enables local image loading without registry

### Alternatives Considered
| Alternative | Why Rejected |
|------------|--------------|
| Kind (Kubernetes in Docker) | Less feature-complete for local dev |
| k3d/k3s | More suited for CI/CD, less tooling support |
| Docker Desktop Kubernetes | Requires Docker Desktop license for business use |

### Configuration
```bash
minikube start --driver=docker --memory=4096 --cpus=2
minikube addons enable ingress  # Optional, can use NodePort
```

---

## 3. Helm Chart Structure

### Decision
Separate Helm charts for backend and frontend under `helm/` directory.

### Rationale
- Independent deployments allow separate versioning
- Easier to scale/update individual components
- Follows microservices best practices

### Alternatives Considered
| Alternative | Why Rejected |
|------------|--------------|
| Single umbrella chart | Less flexibility, tighter coupling |
| Kustomize | Less feature-rich for parameterization |
| Raw YAML manifests | No templating, harder to manage environments |

### Structure
```
helm/
├── todo-backend/
│   ├── Chart.yaml
│   ├── values.yaml
│   ├── values-local.yaml
│   └── templates/
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── configmap.yaml
│       └── secret.yaml
└── todo-frontend/
    ├── Chart.yaml
    ├── values.yaml
    ├── values-local.yaml
    └── templates/
        ├── deployment.yaml
        ├── service.yaml
        └── configmap.yaml
```

---

## 4. Service Exposure Strategy

### Decision
Use NodePort for frontend service access via `minikube service` command.

### Rationale
- Simplest approach for local development
- No ingress controller required
- Works reliably across all platforms

### Alternatives Considered
| Alternative | Why Rejected |
|------------|--------------|
| Minikube tunnel with LoadBalancer | Requires background process, platform-specific |
| Ingress controller | Overkill for local dev, Phase V scope |
| Port-forward only | Less convenient for multi-service access |

### Implementation
```bash
minikube service todo-frontend --url
```

---

## 5. Inter-Service Communication

### Decision
Use Kubernetes DNS for frontend-to-backend communication.

### Rationale
- Native Kubernetes service discovery
- No hardcoded IPs
- Works identically in local and cloud environments

### Configuration
- Backend service: `todo-backend.todo.svc.cluster.local:8000`
- Frontend environment variable: `NEXT_PUBLIC_API_URL=http://todo-backend:8000`

---

## 6. kubectl-ai Integration

### Decision
Install kubectl-ai as a kubectl plugin for AI-assisted operations.

### Rationale
- Natural language interface for cluster operations
- Reduces learning curve for kubectl commands
- Can generate and explain kubectl commands

### Installation
```bash
# Using krew plugin manager
kubectl krew install ai
# Or direct installation
curl -LO https://github.com/sozercan/kubectl-ai/releases/latest/download/kubectl-ai_linux_amd64
chmod +x kubectl-ai_linux_amd64
sudo mv kubectl-ai_linux_amd64 /usr/local/bin/kubectl-ai
```

### Usage Examples
```bash
kubectl ai "show all pods in todo namespace"
kubectl ai "scale frontend deployment to 3 replicas"
kubectl ai "why is backend pod crashlooping"
```

---

## 7. Kagent Integration

### Decision
Install Kagent for Kubernetes-native AI agent workflows and resource optimization.

### Rationale
- Provides AI-driven resource recommendations
- Can analyze cluster metrics and suggest optimizations
- Integrates with Kubernetes API natively

### Installation
```bash
# Install Kagent CRDs and controller
kubectl apply -f https://github.com/kagent-dev/kagent/releases/latest/download/install.yaml
```

### Usage
- Resource optimization analysis
- Intelligent scaling recommendations
- Cluster health monitoring

---

## 8. Health Probes Configuration

### Decision
Implement HTTP-based liveness and readiness probes for both services.

### Rationale
- Enables Kubernetes to detect unhealthy pods
- Supports rolling updates without downtime
- Required per constitution Principle VIII

### Backend Probes
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 30
readinessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 10
```

### Frontend Probes
```yaml
livenessProbe:
  httpGet:
    path: /
    port: 3000
  initialDelaySeconds: 15
  periodSeconds: 30
readinessProbe:
  httpGet:
    path: /
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10
```

---

## 9. Secret Management

### Decision
Use Kubernetes Secrets for database credentials and API keys, with values provided at deploy time.

### Rationale
- Secrets not committed to version control
- Native Kubernetes secret management
- Can be externalized to vault in Phase V

### Secrets Required
- `DATABASE_URL`: Neon PostgreSQL connection string
- `JWT_SECRET`: Authentication token signing key
- `OPENAI_API_KEY`: AI agent API key (if applicable)

### Implementation
```bash
kubectl create secret generic todo-secrets \
  --from-literal=DATABASE_URL="postgresql://..." \
  --from-literal=JWT_SECRET="..." \
  -n todo
```

---

## 10. Image Tagging Strategy

### Decision
Use semantic versioning with git commit hash for image tags.

### Rationale
- Traceable to source code
- Supports rollback to specific versions
- Follows industry best practices

### Format
```
todo-backend:1.0.0-abc1234
todo-frontend:1.0.0-abc1234
```

### Build Script
```bash
VERSION="1.0.0"
COMMIT=$(git rev-parse --short HEAD)
TAG="${VERSION}-${COMMIT}"
docker build -t todo-backend:${TAG} ./backend
docker build -t todo-frontend:${TAG} ./frontend
```

---

## Unknowns Resolved

All NEEDS CLARIFICATION items from Technical Context have been resolved:

| Unknown | Resolution |
|---------|------------|
| Docker base images | python:3.11-slim (backend), node:20-alpine (frontend) |
| Minikube driver | Docker driver (most portable) |
| Service exposure | NodePort via minikube service |
| Helm chart organization | Separate charts per service |
| kubectl-ai installation | kubectl plugin or direct binary |
| Kagent installation | Kubernetes manifest apply |
| Health probe endpoints | /health (backend), / (frontend) |
| Secret management | Kubernetes Secrets at deploy time |

---

## References

- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
- [Helm Best Practices](https://helm.sh/docs/chart_best_practices/)
- [kubectl-ai GitHub](https://github.com/sozercan/kubectl-ai)
- [Kagent Documentation](https://kagent.dev/docs/)
