# Scripts Interface Contract

**Feature**: 003-k8s-deployment
**Date**: 2026-01-28

## Overview

This document defines the interface contract for all deployment scripts. Each script follows a consistent pattern for inputs, outputs, and error handling.

---

## Script Catalog

| Script | Purpose | Prerequisites |
|--------|---------|---------------|
| `scripts/setup-prerequisites.sh` | Install/verify required tools | None |
| `scripts/build-images.sh` | Build Docker images | Docker installed |
| `scripts/start-minikube.sh` | Start and configure Minikube | Minikube installed |
| `scripts/load-images.sh` | Load images into Minikube | Minikube running, images built |
| `scripts/deploy-backend.sh` | Deploy backend with Helm | Images loaded, secrets created |
| `scripts/deploy-frontend.sh` | Deploy frontend with Helm | Backend deployed |
| `scripts/deploy-all.sh` | Orchestrate full deployment | None (calls others) |
| `scripts/verify-deployment.sh` | Health check all services | Stack deployed |
| `scripts/setup-ai-tools.sh` | Install kubectl-ai and Kagent | Cluster running |

---

## Common Interface

### Input Parameters

All scripts accept these common parameters:

| Parameter | Flag | Description | Default |
|-----------|------|-------------|---------|
| verbose | `-v, --verbose` | Enable verbose output | false |
| dry-run | `-n, --dry-run` | Show commands without executing | false |
| namespace | `-ns, --namespace` | Kubernetes namespace | `todo` |
| help | `-h, --help` | Show usage information | - |

### Output Format

```
[INFO] Starting <script-name>...
[INFO] <step description>
[OK] <success message>
[WARN] <warning message>
[ERROR] <error message>
[INFO] <script-name> completed successfully
```

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Prerequisite not met |
| 3 | Timeout waiting for resource |
| 4 | User cancelled operation |

---

## Script Specifications

### 1. setup-prerequisites.sh

**Purpose**: Verify and optionally install required tools.

**Checks**:
- Docker (version >= 20.0)
- Minikube (version >= 1.30)
- Helm (version >= 3.12)
- kubectl (version >= 1.27)

**Inputs**:
| Parameter | Flag | Description |
|-----------|------|-------------|
| install | `--install` | Attempt to install missing tools |

**Outputs**:
```
[INFO] Checking prerequisites...
[OK] Docker v24.0.7
[OK] Minikube v1.32.0
[OK] Helm v3.14.0
[OK] kubectl v1.29.0
[INFO] All prerequisites met
```

**Exit Conditions**:
- Exit 0: All tools present and correct version
- Exit 2: Tool missing and --install not specified

---

### 2. build-images.sh

**Purpose**: Build Docker images for backend and frontend.

**Inputs**:
| Parameter | Flag | Description |
|-----------|------|-------------|
| tag | `-t, --tag` | Image tag (default: `1.0.0-<commit>`) |
| backend-only | `--backend-only` | Build only backend image |
| frontend-only | `--frontend-only` | Build only frontend image |

**Outputs**:
```
[INFO] Building Docker images...
[INFO] Building todo-backend:1.0.0-abc1234
[OK] todo-backend:1.0.0-abc1234 built (245MB)
[INFO] Building todo-frontend:1.0.0-abc1234
[OK] todo-frontend:1.0.0-abc1234 built (180MB)
[INFO] Build complete. Images:
  - todo-backend:1.0.0-abc1234
  - todo-frontend:1.0.0-abc1234
```

---

### 3. start-minikube.sh

**Purpose**: Start Minikube cluster with required configuration.

**Inputs**:
| Parameter | Flag | Description |
|-----------|------|-------------|
| memory | `-m, --memory` | Memory allocation (default: 4096) |
| cpus | `-c, --cpus` | CPU allocation (default: 2) |
| driver | `-d, --driver` | VM driver (default: docker) |

**Outputs**:
```
[INFO] Starting Minikube...
[INFO] Configuring: memory=4096MB, cpus=2, driver=docker
[OK] Minikube started successfully
[INFO] Cluster IP: 192.168.49.2
[INFO] Enabling addons...
[OK] Addon 'default-storageclass' enabled
```

---

### 4. load-images.sh

**Purpose**: Load Docker images into Minikube's local registry.

**Inputs**:
| Parameter | Flag | Description |
|-----------|------|-------------|
| tag | `-t, --tag` | Image tag to load |

**Outputs**:
```
[INFO] Loading images into Minikube...
[INFO] Loading todo-backend:1.0.0-abc1234
[OK] todo-backend loaded
[INFO] Loading todo-frontend:1.0.0-abc1234
[OK] todo-frontend loaded
[INFO] Images available in Minikube
```

---

### 5. deploy-backend.sh

**Purpose**: Deploy backend service using Helm.

**Inputs**:
| Parameter | Flag | Description |
|-----------|------|-------------|
| tag | `-t, --tag` | Image tag to deploy |
| values | `-f, --values` | Values file (default: values-local.yaml) |
| upgrade | `--upgrade` | Upgrade existing release |

**Prerequisites**:
- Kubernetes secret `todo-secrets` must exist in namespace

**Outputs**:
```
[INFO] Deploying todo-backend...
[INFO] Using image: todo-backend:1.0.0-abc1234
[INFO] Helm install todo-backend...
[OK] Release "todo-backend" installed
[INFO] Waiting for pods to be ready...
[OK] Pod todo-backend-xxx-yyy is Ready (1/1)
[INFO] Backend deployed successfully
[INFO] Service: todo-backend.todo.svc.cluster.local:8000
```

---

### 6. deploy-frontend.sh

**Purpose**: Deploy frontend service using Helm.

**Inputs**:
| Parameter | Flag | Description |
|-----------|------|-------------|
| tag | `-t, --tag` | Image tag to deploy |
| values | `-f, --values` | Values file (default: values-local.yaml) |
| upgrade | `--upgrade` | Upgrade existing release |

**Outputs**:
```
[INFO] Deploying todo-frontend...
[INFO] Using image: todo-frontend:1.0.0-abc1234
[INFO] Helm install todo-frontend...
[OK] Release "todo-frontend" installed
[INFO] Waiting for pods to be ready...
[OK] Pod todo-frontend-xxx-yyy is Ready (1/1)
[OK] Pod todo-frontend-xxx-zzz is Ready (1/1)
[INFO] Frontend deployed successfully (2/2 replicas)
[INFO] Access URL: Run 'minikube service todo-frontend -n todo --url'
```

---

### 7. deploy-all.sh

**Purpose**: Orchestrate complete deployment from scratch.

**Inputs**:
| Parameter | Flag | Description |
|-----------|------|-------------|
| skip-prereq | `--skip-prereq` | Skip prerequisite check |
| skip-build | `--skip-build` | Skip image build (use existing) |
| tag | `-t, --tag` | Image tag for all images |

**Sequence**:
1. `setup-prerequisites.sh`
2. `start-minikube.sh`
3. `build-images.sh`
4. `load-images.sh`
5. Create namespace and secrets (prompts for values)
6. `deploy-backend.sh`
7. `deploy-frontend.sh`
8. `verify-deployment.sh`

**Outputs**:
```
[INFO] === Todo App Full Deployment ===
[INFO] Step 1/8: Checking prerequisites...
[OK] Prerequisites met
[INFO] Step 2/8: Starting Minikube...
[OK] Minikube running
...
[INFO] === Deployment Complete ===
[OK] Backend: 1/1 pods ready
[OK] Frontend: 2/2 pods ready
[INFO] Access the application:
  minikube service todo-frontend -n todo --url
```

---

### 8. verify-deployment.sh

**Purpose**: Verify all services are healthy and accessible.

**Checks**:
1. All pods in Running state
2. All pods pass readiness probe
3. Backend /health endpoint responds
4. Frontend / endpoint responds
5. Frontend can reach backend

**Outputs**:
```
[INFO] Verifying deployment...
[INFO] Checking pod status...
[OK] todo-backend-xxx: Running, Ready
[OK] todo-frontend-xxx: Running, Ready
[OK] todo-frontend-yyy: Running, Ready
[INFO] Checking health endpoints...
[OK] Backend health: {"status": "healthy"}
[OK] Frontend health: HTTP 200
[INFO] Checking service connectivity...
[OK] Frontend -> Backend: Connected
[INFO] === All checks passed ===
```

---

### 9. setup-ai-tools.sh

**Purpose**: Install kubectl-ai and Kagent.

**Inputs**:
| Parameter | Flag | Description |
|-----------|------|-------------|
| kubectl-ai-only | `--kubectl-ai-only` | Install only kubectl-ai |
| kagent-only | `--kagent-only` | Install only Kagent |

**Outputs**:
```
[INFO] Installing AI tools...
[INFO] Installing kubectl-ai...
[OK] kubectl-ai installed: /usr/local/bin/kubectl-ai
[INFO] Installing Kagent...
[OK] Kagent CRDs applied
[OK] Kagent controller running
[INFO] AI tools ready. Examples:
  kubectl ai "show all pods in todo namespace"
  kubectl ai "why is this pod failing"
```

---

## Error Handling

All scripts follow this error handling pattern:

```bash
set -euo pipefail

error_handler() {
    local exit_code=$?
    local line_number=$1
    echo "[ERROR] Script failed at line $line_number with exit code $exit_code"
    exit $exit_code
}

trap 'error_handler $LINENO' ERR
```

## Idempotency

All scripts are designed to be idempotent:
- `start-minikube.sh`: Checks if already running before starting
- `deploy-*.sh`: Uses `helm upgrade --install` pattern
- `load-images.sh`: Safe to run multiple times
- `setup-prerequisites.sh`: Only installs if missing
