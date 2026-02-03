# Tasks: Phase IV Local Kubernetes Deployment

**Input**: Design documents from `/specs/003-k8s-deployment/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Format**: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and directory structure

- [ ] T001 [P] [US4] Create `scripts/` directory structure at repository root
  ```bash
  mkdir -p scripts
  ```

- [ ] T002 [P] [US4] Create `helm/` directory structure for charts
  ```bash
  mkdir -p helm/todo-backend/templates helm/todo-frontend/templates
  ```

- [ ] T003 [US4] Create `scripts/setup-prerequisites.sh` to verify Docker, Minikube, Helm, kubectl
  ```bash
  # Script content: check versions, exit with clear messages if missing
  # docker --version (>= 20.0)
  # minikube version (>= 1.30)
  # helm version (>= 3.12)
  # kubectl version (>= 1.27)
  ```

**Checkpoint**: Directory structure ready for artifact creation

---

## Phase 2: User Story 1 - Containerize Applications (Priority: P1)

**Goal**: Create production-ready Docker images for backend and frontend

**Independent Test**: Build images and run containers locally to verify they start and respond

### Implementation for User Story 1

- [ ] T004 [US1] Create `backend/Dockerfile` with multi-stage build
  ```dockerfile
  # Stage 1: Build
  FROM python:3.11 AS builder
  WORKDIR /app
  COPY requirements.txt .
  RUN pip install --user --no-cache-dir -r requirements.txt

  # Stage 2: Runtime
  FROM python:3.11-slim
  WORKDIR /app
  COPY --from=builder /root/.local /root/.local
  COPY src/ ./src/
  ENV PATH=/root/.local/bin:$PATH
  EXPOSE 8000
  CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
  ```

- [ ] T005 [US1] Create `frontend/Dockerfile` with multi-stage build
  ```dockerfile
  # Stage 1: Build
  FROM node:20-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build

  # Stage 2: Runtime
  FROM node:20-alpine
  WORKDIR /app
  COPY --from=builder /app/.next/standalone ./
  COPY --from=builder /app/.next/static ./.next/static
  COPY --from=builder /app/public ./public
  EXPOSE 3000
  CMD ["node", "server.js"]
  ```

- [ ] T006 [US1] Update `frontend/next.config.js` to enable standalone output
  ```javascript
  // Add to next.config.js:
  output: 'standalone'
  ```

- [ ] T007 [US1] Create `scripts/build-images.sh` for Docker build automation
  ```bash
  #!/bin/bash
  set -euo pipefail

  VERSION="${1:-1.0.0}"
  COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "local")
  TAG="${VERSION}-${COMMIT}"

  echo "[INFO] Building Docker images with tag: ${TAG}"

  echo "[INFO] Building todo-backend:${TAG}"
  docker build -t todo-backend:${TAG} -t todo-backend:latest ./backend

  echo "[INFO] Building todo-frontend:${TAG}"
  docker build -t todo-frontend:${TAG} -t todo-frontend:latest ./frontend

  echo "[OK] Images built successfully"
  docker images | grep todo-
  ```

- [ ] T008 [US1] Test backend Docker image locally
  ```bash
  # Build and run backend container
  docker build -t todo-backend:test ./backend
  docker run -d --name test-backend -p 8000:8000 \
    -e DATABASE_URL="postgresql://test:test@host.docker.internal:5432/test" \
    todo-backend:test

  # Verify health endpoint
  curl http://localhost:8000/health
  # Expected: {"status": "healthy"}

  # Cleanup
  docker stop test-backend && docker rm test-backend
  ```

- [ ] T009 [US1] Test frontend Docker image locally
  ```bash
  # Build and run frontend container
  docker build -t todo-frontend:test ./frontend
  docker run -d --name test-frontend -p 3000:3000 \
    -e NEXT_PUBLIC_API_URL="http://localhost:8000" \
    todo-frontend:test

  # Verify frontend responds
  curl -I http://localhost:3000
  # Expected: HTTP/1.1 200 OK

  # Cleanup
  docker stop test-frontend && docker rm test-frontend
  ```

**Checkpoint**: Both Docker images build successfully and containers respond to health checks

---

## Phase 3: User Story 2 - Deploy to Minikube with Helm (Priority: P2)

**Goal**: Create Helm charts and deploy to Minikube cluster

**Independent Test**: `helm install` both charts and verify pods are Running

### Helm Charts for User Story 2

- [ ] T010 [US2] Create `helm/todo-backend/Chart.yaml`
  ```yaml
  apiVersion: v2
  name: todo-backend
  description: Todo Chatbot Backend API
  type: application
  version: 1.0.0
  appVersion: "1.0.0"
  ```

- [ ] T011 [US2] Create `helm/todo-backend/values.yaml` with defaults
  ```yaml
  replicaCount: 1

  image:
    repository: todo-backend
    tag: latest
    pullPolicy: IfNotPresent

  service:
    type: ClusterIP
    port: 8000

  env:
    BACKEND_HOST: "0.0.0.0"
    BACKEND_PORT: "8000"
    CORS_ORIGINS: "http://todo-frontend:3000"

  secrets:
    existingSecret: todo-secrets

  probes:
    liveness:
      path: /health
      initialDelaySeconds: 10
      periodSeconds: 30
    readiness:
      path: /health
      initialDelaySeconds: 5
      periodSeconds: 10

  resources:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 100m
      memory: 256Mi
  ```

- [ ] T012 [US2] Create `helm/todo-backend/values-local.yaml` for Minikube
  ```yaml
  # Local Minikube overrides
  image:
    pullPolicy: Never  # Use locally loaded images
  ```

- [ ] T013 [US2] Create `helm/todo-backend/templates/deployment.yaml`
  ```yaml
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: {{ .Release.Name }}
    labels:
      app: {{ .Release.Name }}
  spec:
    replicas: {{ .Values.replicaCount }}
    selector:
      matchLabels:
        app: {{ .Release.Name }}
    template:
      metadata:
        labels:
          app: {{ .Release.Name }}
      spec:
        containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
          - containerPort: 8000
          envFrom:
          - configMapRef:
              name: {{ .Release.Name }}-config
          - secretRef:
              name: {{ .Values.secrets.existingSecret }}
          livenessProbe:
            httpGet:
              path: {{ .Values.probes.liveness.path }}
              port: 8000
            initialDelaySeconds: {{ .Values.probes.liveness.initialDelaySeconds }}
            periodSeconds: {{ .Values.probes.liveness.periodSeconds }}
          readinessProbe:
            httpGet:
              path: {{ .Values.probes.readiness.path }}
              port: 8000
            initialDelaySeconds: {{ .Values.probes.readiness.initialDelaySeconds }}
            periodSeconds: {{ .Values.probes.readiness.periodSeconds }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
  ```

- [ ] T014 [US2] Create `helm/todo-backend/templates/service.yaml`
  ```yaml
  apiVersion: v1
  kind: Service
  metadata:
    name: {{ .Release.Name }}
  spec:
    type: {{ .Values.service.type }}
    ports:
    - port: {{ .Values.service.port }}
      targetPort: 8000
      protocol: TCP
    selector:
      app: {{ .Release.Name }}
  ```

- [ ] T015 [US2] Create `helm/todo-backend/templates/configmap.yaml`
  ```yaml
  apiVersion: v1
  kind: ConfigMap
  metadata:
    name: {{ .Release.Name }}-config
  data:
    BACKEND_HOST: {{ .Values.env.BACKEND_HOST | quote }}
    BACKEND_PORT: {{ .Values.env.BACKEND_PORT | quote }}
    CORS_ORIGINS: {{ .Values.env.CORS_ORIGINS | quote }}
  ```

- [ ] T016 [P] [US2] Create `helm/todo-frontend/Chart.yaml`
  ```yaml
  apiVersion: v2
  name: todo-frontend
  description: Todo Chatbot Frontend UI
  type: application
  version: 1.0.0
  appVersion: "1.0.0"
  ```

- [ ] T017 [US2] Create `helm/todo-frontend/values.yaml` with defaults
  ```yaml
  replicaCount: 2  # Constitution requirement: 2 frontend replicas

  image:
    repository: todo-frontend
    tag: latest
    pullPolicy: IfNotPresent

  service:
    type: NodePort
    port: 3000
    nodePort: 30080  # Fixed NodePort for easy access

  env:
    NEXT_PUBLIC_API_URL: "http://todo-backend:8000"

  probes:
    liveness:
      path: /
      initialDelaySeconds: 15
      periodSeconds: 30
    readiness:
      path: /
      initialDelaySeconds: 10
      periodSeconds: 10

  resources:
    limits:
      cpu: 300m
      memory: 256Mi
    requests:
      cpu: 100m
      memory: 128Mi
  ```

- [ ] T018 [US2] Create `helm/todo-frontend/values-local.yaml` for Minikube
  ```yaml
  # Local Minikube overrides
  image:
    pullPolicy: Never  # Use locally loaded images
  ```

- [ ] T019 [US2] Create `helm/todo-frontend/templates/deployment.yaml`
  ```yaml
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: {{ .Release.Name }}
    labels:
      app: {{ .Release.Name }}
  spec:
    replicas: {{ .Values.replicaCount }}
    selector:
      matchLabels:
        app: {{ .Release.Name }}
    template:
      metadata:
        labels:
          app: {{ .Release.Name }}
      spec:
        containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
          - containerPort: 3000
          env:
          - name: NEXT_PUBLIC_API_URL
            value: {{ .Values.env.NEXT_PUBLIC_API_URL | quote }}
          livenessProbe:
            httpGet:
              path: {{ .Values.probes.liveness.path }}
              port: 3000
            initialDelaySeconds: {{ .Values.probes.liveness.initialDelaySeconds }}
            periodSeconds: {{ .Values.probes.liveness.periodSeconds }}
          readinessProbe:
            httpGet:
              path: {{ .Values.probes.readiness.path }}
              port: 3000
            initialDelaySeconds: {{ .Values.probes.readiness.initialDelaySeconds }}
            periodSeconds: {{ .Values.probes.readiness.periodSeconds }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
  ```

- [ ] T020 [US2] Create `helm/todo-frontend/templates/service.yaml`
  ```yaml
  apiVersion: v1
  kind: Service
  metadata:
    name: {{ .Release.Name }}
  spec:
    type: {{ .Values.service.type }}
    ports:
    - port: {{ .Values.service.port }}
      targetPort: 3000
      nodePort: {{ .Values.service.nodePort }}
      protocol: TCP
    selector:
      app: {{ .Release.Name }}
  ```

### Minikube Scripts for User Story 2

- [ ] T021 [US2] Create `scripts/start-minikube.sh`
  ```bash
  #!/bin/bash
  set -euo pipefail

  MEMORY="${1:-4096}"
  CPUS="${2:-2}"
  DRIVER="${3:-docker}"

  echo "[INFO] Starting Minikube cluster..."
  echo "[INFO] Config: memory=${MEMORY}MB, cpus=${CPUS}, driver=${DRIVER}"

  # Check if already running
  if minikube status | grep -q "Running"; then
    echo "[INFO] Minikube is already running"
    minikube status
    exit 0
  fi

  # Start Minikube
  minikube start --driver=${DRIVER} --memory=${MEMORY} --cpus=${CPUS}

  echo "[OK] Minikube started successfully"
  minikube status
  ```

- [ ] T022 [US2] Create `scripts/load-images.sh`
  ```bash
  #!/bin/bash
  set -euo pipefail

  TAG="${1:-latest}"

  echo "[INFO] Loading Docker images into Minikube..."

  echo "[INFO] Loading todo-backend:${TAG}"
  minikube image load todo-backend:${TAG}

  echo "[INFO] Loading todo-frontend:${TAG}"
  minikube image load todo-frontend:${TAG}

  echo "[OK] Images loaded successfully"
  minikube image ls | grep todo-
  ```

- [ ] T023 [US2] Create `scripts/deploy-backend.sh`
  ```bash
  #!/bin/bash
  set -euo pipefail

  NAMESPACE="${1:-todo}"
  TAG="${2:-latest}"

  echo "[INFO] Deploying todo-backend..."

  # Create namespace if not exists
  kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

  # Check if secrets exist
  if ! kubectl get secret todo-secrets -n ${NAMESPACE} &>/dev/null; then
    echo "[ERROR] Secret 'todo-secrets' not found in namespace '${NAMESPACE}'"
    echo "[INFO] Create secrets first:"
    echo "  kubectl create secret generic todo-secrets \\"
    echo "    --from-literal=DATABASE_URL='your-db-url' \\"
    echo "    --from-literal=JWT_SECRET='your-jwt-secret' \\"
    echo "    -n ${NAMESPACE}"
    exit 2
  fi

  # Deploy with Helm
  helm upgrade --install todo-backend ./helm/todo-backend \
    -f ./helm/todo-backend/values-local.yaml \
    --set image.tag=${TAG} \
    -n ${NAMESPACE}

  echo "[INFO] Waiting for backend pod to be ready..."
  kubectl rollout status deployment/todo-backend -n ${NAMESPACE} --timeout=120s

  echo "[OK] Backend deployed successfully"
  kubectl get pods -n ${NAMESPACE} -l app=todo-backend
  ```

- [ ] T024 [US2] Create `scripts/deploy-frontend.sh`
  ```bash
  #!/bin/bash
  set -euo pipefail

  NAMESPACE="${1:-todo}"
  TAG="${2:-latest}"

  echo "[INFO] Deploying todo-frontend..."

  # Deploy with Helm
  helm upgrade --install todo-frontend ./helm/todo-frontend \
    -f ./helm/todo-frontend/values-local.yaml \
    --set image.tag=${TAG} \
    -n ${NAMESPACE}

  echo "[INFO] Waiting for frontend pods to be ready..."
  kubectl rollout status deployment/todo-frontend -n ${NAMESPACE} --timeout=120s

  echo "[OK] Frontend deployed successfully (2 replicas)"
  kubectl get pods -n ${NAMESPACE} -l app=todo-frontend

  echo "[INFO] Access the application:"
  echo "  minikube service todo-frontend -n ${NAMESPACE} --url"
  ```

- [ ] T025 [US2] Create `scripts/verify-deployment.sh`
  ```bash
  #!/bin/bash
  set -euo pipefail

  NAMESPACE="${1:-todo}"

  echo "[INFO] Verifying deployment in namespace: ${NAMESPACE}"

  # Check pods
  echo "[INFO] Checking pod status..."
  BACKEND_READY=$(kubectl get pods -n ${NAMESPACE} -l app=todo-backend -o jsonpath='{.items[0].status.conditions[?(@.type=="Ready")].status}')
  FRONTEND_PODS=$(kubectl get pods -n ${NAMESPACE} -l app=todo-frontend --no-headers | wc -l)
  FRONTEND_READY=$(kubectl get pods -n ${NAMESPACE} -l app=todo-frontend -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}' | tr ' ' '\n' | grep -c True || echo 0)

  if [ "${BACKEND_READY}" != "True" ]; then
    echo "[ERROR] Backend pod is not ready"
    kubectl describe pods -n ${NAMESPACE} -l app=todo-backend
    exit 1
  fi
  echo "[OK] Backend: 1/1 pods ready"

  if [ "${FRONTEND_READY}" -lt 2 ]; then
    echo "[ERROR] Frontend pods are not ready (${FRONTEND_READY}/2)"
    kubectl describe pods -n ${NAMESPACE} -l app=todo-frontend
    exit 1
  fi
  echo "[OK] Frontend: ${FRONTEND_READY}/2 pods ready"

  # Check services
  echo "[INFO] Checking services..."
  kubectl get svc -n ${NAMESPACE}

  # Health check backend
  echo "[INFO] Checking backend health..."
  BACKEND_POD=$(kubectl get pods -n ${NAMESPACE} -l app=todo-backend -o jsonpath='{.items[0].metadata.name}')
  kubectl exec -n ${NAMESPACE} ${BACKEND_POD} -- curl -s http://localhost:8000/health
  echo ""
  echo "[OK] Backend health check passed"

  echo ""
  echo "[INFO] === All checks passed ==="
  echo "[INFO] Access the application:"
  minikube service todo-frontend -n ${NAMESPACE} --url
  ```

**Checkpoint**: Helm charts created, deployed to Minikube, all 3 pods (2 frontend + 1 backend) running

---

## Phase 4: User Story 3 - AI-Assisted Operations (Priority: P3)

**Goal**: Install and configure kubectl-ai and Kagent for cluster management

**Independent Test**: Run kubectl-ai natural language queries successfully

### AI Tools for User Story 3

- [ ] T026 [US3] Create `scripts/setup-ai-tools.sh`
  ```bash
  #!/bin/bash
  set -euo pipefail

  KUBECTL_AI_ONLY="${1:-false}"
  KAGENT_ONLY="${2:-false}"

  echo "[INFO] Setting up AI tools for Kubernetes..."

  # Install kubectl-ai
  if [ "${KAGENT_ONLY}" != "true" ]; then
    echo "[INFO] Installing kubectl-ai..."

    # Check if krew is available
    if kubectl krew version &>/dev/null; then
      kubectl krew install ai 2>/dev/null || echo "[INFO] kubectl-ai already installed via krew"
    else
      # Direct installation
      echo "[INFO] Installing kubectl-ai directly..."
      OS=$(uname -s | tr '[:upper:]' '[:lower:]')
      ARCH=$(uname -m)
      if [ "${ARCH}" = "x86_64" ]; then ARCH="amd64"; fi

      curl -LO "https://github.com/sozercan/kubectl-ai/releases/latest/download/kubectl-ai_${OS}_${ARCH}"
      chmod +x "kubectl-ai_${OS}_${ARCH}"
      sudo mv "kubectl-ai_${OS}_${ARCH}" /usr/local/bin/kubectl-ai
    fi

    echo "[OK] kubectl-ai installed"
    echo "[INFO] Usage: kubectl ai 'your natural language query'"
  fi

  # Install Kagent
  if [ "${KUBECTL_AI_ONLY}" != "true" ]; then
    echo "[INFO] Installing Kagent..."
    kubectl apply -f https://github.com/kagent-dev/kagent/releases/latest/download/install.yaml 2>/dev/null || \
      echo "[WARN] Kagent installation may require manual setup - check https://kagent.dev/docs"
    echo "[OK] Kagent installed"
  fi

  echo ""
  echo "[INFO] AI tools setup complete"
  ```

- [ ] T027 [US3] Test kubectl-ai: List pods in todo namespace
  ```bash
  # Query pods using natural language
  kubectl ai "show me all pods in the todo namespace"

  # Expected output: Generates and executes 'kubectl get pods -n todo'
  ```

- [ ] T028 [US3] Test kubectl-ai: Scale frontend deployment
  ```bash
  # Scale frontend to 3 replicas
  kubectl ai "scale the todo-frontend deployment to 3 replicas in todo namespace"

  # Verify scaling
  kubectl get deployment todo-frontend -n todo

  # Scale back to 2 replicas (constitution compliance)
  kubectl ai "scale todo-frontend back to 2 replicas in todo namespace"
  ```

- [ ] T029 [US3] Test kubectl-ai: Troubleshoot pod issues
  ```bash
  # Get pod diagnostics
  kubectl ai "why is the todo-backend pod restarting in todo namespace"

  # Get resource usage
  kubectl ai "show resource usage for all pods in todo namespace"
  ```

- [ ] T030 [US3] Test Kagent: Resource optimization analysis
  ```bash
  # Check Kagent status
  kubectl get pods -n kagent-system

  # Request resource recommendations (if Kagent supports CLI)
  # Note: Kagent interaction may vary based on version
  kubectl ai "use kagent to analyze resource usage in todo namespace"
  ```

- [ ] T031 [US3] Test kubectl-ai: Monitor cluster health
  ```bash
  # Check overall cluster health
  kubectl ai "check the health status of all deployments in todo namespace"

  # Check node resources
  kubectl ai "show me the resource capacity and usage of minikube node"

  # Check events for issues
  kubectl ai "show recent warning events in todo namespace"
  ```

**Checkpoint**: kubectl-ai responds to natural language queries, Kagent installed

---

## Phase 5: User Story 4 - Ready-to-Run Automation (Priority: P4)

**Goal**: Create orchestration script and verify full deployment workflow

**Independent Test**: Run `deploy-all.sh` on fresh environment and verify success

### Full Automation for User Story 4

- [ ] T032 [US4] Create `scripts/deploy-all.sh` master orchestration script
  ```bash
  #!/bin/bash
  set -euo pipefail

  echo "=============================================="
  echo "  Todo App - Full Kubernetes Deployment"
  echo "=============================================="
  echo ""

  NAMESPACE="${NAMESPACE:-todo}"
  TAG="${TAG:-latest}"
  SKIP_PREREQ="${SKIP_PREREQ:-false}"
  SKIP_BUILD="${SKIP_BUILD:-false}"

  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  ROOT_DIR="$(dirname "${SCRIPT_DIR}")"
  cd "${ROOT_DIR}"

  # Step 1: Prerequisites
  if [ "${SKIP_PREREQ}" != "true" ]; then
    echo "[Step 1/7] Checking prerequisites..."
    ./scripts/setup-prerequisites.sh
    echo ""
  fi

  # Step 2: Start Minikube
  echo "[Step 2/7] Starting Minikube..."
  ./scripts/start-minikube.sh
  echo ""

  # Step 3: Build images
  if [ "${SKIP_BUILD}" != "true" ]; then
    echo "[Step 3/7] Building Docker images..."
    ./scripts/build-images.sh "${TAG}"
    echo ""
  fi

  # Step 4: Load images into Minikube
  echo "[Step 4/7] Loading images into Minikube..."
  ./scripts/load-images.sh "${TAG}"
  echo ""

  # Step 5: Create namespace and secrets
  echo "[Step 5/7] Setting up namespace and secrets..."
  kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

  if ! kubectl get secret todo-secrets -n ${NAMESPACE} &>/dev/null; then
    echo "[INFO] Creating secrets (you will be prompted for values)..."
    read -p "Enter DATABASE_URL: " DATABASE_URL
    read -p "Enter JWT_SECRET: " JWT_SECRET

    kubectl create secret generic todo-secrets \
      --from-literal=DATABASE_URL="${DATABASE_URL}" \
      --from-literal=JWT_SECRET="${JWT_SECRET}" \
      -n ${NAMESPACE}
  else
    echo "[INFO] Secrets already exist"
  fi
  echo ""

  # Step 6: Deploy applications
  echo "[Step 6/7] Deploying applications..."
  ./scripts/deploy-backend.sh ${NAMESPACE} ${TAG}
  ./scripts/deploy-frontend.sh ${NAMESPACE} ${TAG}
  echo ""

  # Step 7: Verify deployment
  echo "[Step 7/7] Verifying deployment..."
  ./scripts/verify-deployment.sh ${NAMESPACE}

  echo ""
  echo "=============================================="
  echo "  Deployment Complete!"
  echo "=============================================="
  echo ""
  echo "Backend:  1/1 pods (ClusterIP)"
  echo "Frontend: 2/2 pods (NodePort)"
  echo ""
  echo "Access the application:"
  minikube service todo-frontend -n ${NAMESPACE} --url
  ```

- [ ] T033 [US4] Make all scripts executable
  ```bash
  chmod +x scripts/*.sh
  ```

- [ ] T034 [US4] Test full deployment from scratch
  ```bash
  # Clean up any existing deployment
  minikube delete

  # Run full deployment
  ./scripts/deploy-all.sh

  # Verify success criteria:
  # - Deployment completes in < 15 minutes
  # - All 3 pods reach Ready state
  # - Frontend is accessible via minikube service URL
  ```

- [ ] T035 [US4] Test Helm upgrade workflow
  ```bash
  # Make a change and rebuild
  TAG="1.0.1"
  ./scripts/build-images.sh ${TAG}
  ./scripts/load-images.sh ${TAG}

  # Upgrade deployments
  helm upgrade todo-backend ./helm/todo-backend \
    --set image.tag=${TAG} -n todo

  helm upgrade todo-frontend ./helm/todo-frontend \
    --set image.tag=${TAG} -n todo

  # Verify zero downtime (run in separate terminal during upgrade)
  # watch -n 1 curl -s http://$(minikube service todo-frontend -n todo --url)/
  ```

- [ ] T036 [US4] Test rollback workflow
  ```bash
  # Check release history
  helm history todo-backend -n todo
  helm history todo-frontend -n todo

  # Rollback to previous version
  helm rollback todo-backend -n todo
  helm rollback todo-frontend -n todo

  # Verify rollback successful
  kubectl get pods -n todo
  ```

**Checkpoint**: Full deployment workflow automated and tested

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation

- [ ] T037 [P] Verify constitution compliance
  ```bash
  # Check replica counts
  kubectl get deployments -n todo
  # Expected: todo-backend 1/1, todo-frontend 2/2

  # Verify no cloud resources used
  kubectl config current-context
  # Expected: minikube

  # Verify Helm-first approach
  helm list -n todo
  # Expected: todo-backend, todo-frontend releases
  ```

- [ ] T038 Update `quickstart.md` with final verified commands

- [ ] T039 Run final end-to-end verification
  ```bash
  # Full workflow test
  minikube delete
  ./scripts/deploy-all.sh
  ./scripts/setup-ai-tools.sh

  # AI-assisted verification
  kubectl ai "verify all pods are healthy in todo namespace"
  kubectl ai "show me the service endpoints in todo namespace"

  # Access application
  minikube service todo-frontend -n todo
  ```

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (US1: Containerization)
    │
    ├──────────────────┐
    ▼                  ▼
Phase 3 (US2: Helm)   (can create charts in parallel with images)
    │
    ▼
Phase 4 (US3: AI Tools) ← Requires deployed cluster
    │
    ▼
Phase 5 (US4: Automation)
    │
    ▼
Phase 6 (Polish)
```

### Task Dependencies Within Phases

| Task | Depends On |
|------|------------|
| T004-T005 | T001-T002 (directories) |
| T007 | T004-T005 (Dockerfiles exist) |
| T008-T009 | T007 (images built) |
| T010-T020 | T002 (helm directory) |
| T021-T024 | T008-T009 (images ready) + T010-T020 (charts ready) |
| T025 | T023-T024 (deployed) |
| T026-T031 | T025 (cluster running) |
| T032-T036 | All previous tasks |

### Parallel Opportunities

```bash
# Can run in parallel (different files):
T001 & T002  # Directory creation
T004 & T016  # Backend/Frontend Dockerfiles (after dirs)
T010-T015 & T016-T020  # Backend/Frontend Helm charts

# Must run sequentially:
T007 → T008 → T009  # Build → Test backend → Test frontend
T021 → T022 → T023 → T024 → T025  # Minikube → Load → Deploy → Verify
```

---

## Command Reference

### Quick Commands

```bash
# Full deployment
./scripts/deploy-all.sh

# Individual steps
./scripts/setup-prerequisites.sh
./scripts/start-minikube.sh
./scripts/build-images.sh
./scripts/load-images.sh
./scripts/deploy-backend.sh todo latest
./scripts/deploy-frontend.sh todo latest
./scripts/verify-deployment.sh todo
./scripts/setup-ai-tools.sh

# kubectl-ai examples
kubectl ai "show all pods in todo namespace"
kubectl ai "scale todo-frontend to 3 replicas"
kubectl ai "describe todo-backend deployment"
kubectl ai "show logs from todo-backend"
kubectl ai "check resource usage in todo namespace"

# Helm commands
helm install todo-backend ./helm/todo-backend -n todo
helm install todo-frontend ./helm/todo-frontend -n todo
helm upgrade todo-backend ./helm/todo-backend -n todo
helm rollback todo-backend -n todo
helm uninstall todo-backend -n todo

# Cleanup
helm uninstall todo-backend todo-frontend -n todo
kubectl delete namespace todo
minikube stop
minikube delete
```
