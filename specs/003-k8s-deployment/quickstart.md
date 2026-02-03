# Quickstart: Phase IV Kubernetes Deployment

**Feature**: 003-k8s-deployment
**Time to Deploy**: ~15 minutes

## Prerequisites

Before starting, ensure you have:
- Docker Desktop or Docker Engine installed
- At least 8GB RAM and 4 CPU cores available
- Internet connection for pulling base images
- Neon PostgreSQL database credentials from Phase III

## Quick Deploy (Automated)

Run the full deployment with a single command:

```bash
# From repository root
./scripts/deploy-all.sh
```

This will:
1. Check/install prerequisites
2. Start Minikube
3. Build Docker images
4. Deploy backend and frontend
5. Verify deployment

## Step-by-Step Deploy (Manual)

### Step 1: Verify Prerequisites

```bash
./scripts/setup-prerequisites.sh
```

Expected output:
```
[OK] Docker v24.x
[OK] Minikube v1.32.x
[OK] Helm v3.14.x
[OK] kubectl v1.29.x
```

### Step 2: Start Minikube

```bash
./scripts/start-minikube.sh
```

Or manually:
```bash
minikube start --driver=docker --memory=4096 --cpus=2
```

### Step 3: Build Docker Images

```bash
./scripts/build-images.sh
```

Or manually:
```bash
# Backend
docker build -t todo-backend:latest ./backend

# Frontend
docker build -t todo-frontend:latest ./frontend
```

### Step 4: Load Images into Minikube

```bash
./scripts/load-images.sh
```

Or manually:
```bash
minikube image load todo-backend:latest
minikube image load todo-frontend:latest
```

### Step 5: Create Namespace and Secrets

```bash
# Create namespace
kubectl create namespace todo

# Create secrets (replace with your values)
kubectl create secret generic todo-secrets \
  --from-literal=DATABASE_URL="postgresql://user:pass@host/db" \
  --from-literal=JWT_SECRET="your-jwt-secret" \
  -n todo
```

### Step 6: Deploy Backend

```bash
./scripts/deploy-backend.sh
```

Or manually:
```bash
helm install todo-backend ./helm/todo-backend \
  -f ./helm/todo-backend/values-local.yaml \
  -n todo
```

### Step 7: Deploy Frontend

```bash
./scripts/deploy-frontend.sh
```

Or manually:
```bash
helm install todo-frontend ./helm/todo-frontend \
  -f ./helm/todo-frontend/values-local.yaml \
  -n todo
```

### Step 8: Verify Deployment

```bash
./scripts/verify-deployment.sh
```

Or manually:
```bash
# Check pods
kubectl get pods -n todo

# Expected output:
# NAME                            READY   STATUS    RESTARTS   AGE
# todo-backend-xxx-yyy            1/1     Running   0          2m
# todo-frontend-xxx-yyy           1/1     Running   0          1m
# todo-frontend-xxx-zzz           1/1     Running   0          1m
```

### Step 9: Access Application

```bash
minikube service todo-frontend -n todo --url
```

Open the returned URL in your browser.

---

## AI Tools Setup (Optional)

### Install kubectl-ai

```bash
./scripts/setup-ai-tools.sh --kubectl-ai-only
```

Usage examples:
```bash
kubectl ai "show all pods in todo namespace"
kubectl ai "describe the backend deployment"
kubectl ai "scale frontend to 3 replicas"
```

### Install Kagent

```bash
./scripts/setup-ai-tools.sh --kagent-only
```

---

## Common Operations

### View Logs

```bash
# Backend logs
kubectl logs -f deployment/todo-backend -n todo

# Frontend logs
kubectl logs -f deployment/todo-frontend -n todo
```

### Scale Deployments

```bash
# Scale frontend (using kubectl-ai)
kubectl ai "scale frontend to 3 replicas"

# Or manually
kubectl scale deployment todo-frontend --replicas=3 -n todo
```

### Upgrade Deployment

```bash
# Rebuild with new tag
./scripts/build-images.sh -t 1.1.0

# Upgrade via Helm
helm upgrade todo-backend ./helm/todo-backend \
  --set image.tag=1.1.0 -n todo

helm upgrade todo-frontend ./helm/todo-frontend \
  --set image.tag=1.1.0 -n todo
```

### Rollback

```bash
# Rollback to previous version
helm rollback todo-backend -n todo
helm rollback todo-frontend -n todo
```

### Cleanup

```bash
# Remove deployments
helm uninstall todo-backend -n todo
helm uninstall todo-frontend -n todo

# Delete namespace
kubectl delete namespace todo

# Stop Minikube
minikube stop

# Delete Minikube cluster (optional)
minikube delete
```

---

## Troubleshooting

### Pod Not Starting

```bash
# Check pod events
kubectl describe pod <pod-name> -n todo

# Or use kubectl-ai
kubectl ai "why is todo-backend pod not starting"
```

### Image Pull Errors

```bash
# Verify image is loaded in Minikube
minikube image ls | grep todo

# Reload if missing
minikube image load todo-backend:latest
```

### Database Connection Issues

```bash
# Check secret exists
kubectl get secret todo-secrets -n todo

# Verify DATABASE_URL (base64 decoded)
kubectl get secret todo-secrets -n todo -o jsonpath='{.data.DATABASE_URL}' | base64 -d
```

### Service Not Accessible

```bash
# Check service status
kubectl get svc -n todo

# Use minikube tunnel if NodePort not working
minikube tunnel
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Minikube Cluster                        │
│                                                              │
│  ┌─────────────────┐      ┌─────────────────────────────┐   │
│  │   todo-frontend │      │        todo-backend         │   │
│  │   (2 replicas)  │─────►│        (1 replica)          │   │
│  │   NodePort:3000 │      │       ClusterIP:8000        │   │
│  └─────────────────┘      └──────────────┬──────────────┘   │
│                                          │                   │
└──────────────────────────────────────────┼───────────────────┘
                                           │
                                           ▼
                               ┌───────────────────────┐
                               │   Neon PostgreSQL     │
                               │   (External Cloud)    │
                               └───────────────────────┘
```

---

## Success Criteria Validation

| Criteria | How to Verify |
|----------|---------------|
| Deployment < 15 min | Time from start to verify completion |
| Frontend interactive < 60s | Open URL after `minikube service` |
| Backend health < 30s | `curl http://<backend-url>/health` |
| 3 pods Ready < 2 min | `kubectl get pods -n todo` |
| Zero downtime upgrade | Run `helm upgrade` while accessing app |
