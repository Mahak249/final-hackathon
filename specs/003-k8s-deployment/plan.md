# Implementation Plan: Phase IV Local Kubernetes Deployment

**Branch**: `003-k8s-deployment` | **Date**: 2026-01-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-k8s-deployment/spec.md`

## Summary

Deploy the Phase III Todo Chatbot application (FastAPI backend + Next.js frontend) to a local Kubernetes cluster using Minikube. The implementation uses standard Docker for containerization, Helm charts for deployment management, and integrates kubectl-ai and Kagent for AI-assisted cluster operations. All deployment steps are automated via shell scripts—no manual coding required.

## Technical Context

**Language/Version**: Python 3.11 (backend), Node.js 20 (frontend), Bash (scripts)
**Primary Dependencies**: Docker, Minikube, Helm 3, kubectl, kubectl-ai, Kagent
**Storage**: External Neon PostgreSQL (unchanged from Phase III)
**Testing**: Script-based verification, kubectl health checks
**Target Platform**: Local Kubernetes (Minikube with Docker driver)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Full deployment < 15 minutes, pods Ready < 2 minutes
**Constraints**: 4GB RAM, 2 CPUs for Minikube; no cloud K8s
**Scale/Scope**: 3 pods (2 frontend + 1 backend), single namespace

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | ✅ PASS | Following spec → plan → tasks → implement sequence |
| II. Agent Behavior Rules | ✅ PASS | No feature invention; implementing approved spec |
| III. Phase Governance | ✅ PASS | Phase IV scope only; no Phase V leakage |
| IV. Technology Constraints | ✅ PASS | Using Phase IV approved: Docker, Minikube, Helm, kubectl-ai, Kagent |
| V. Quality Principles | ✅ PASS | Stateless services, separation of concerns |
| VI. Documentation Requirements | ✅ PASS | quickstart.md, scripts documented |
| VII. AI Agent Architecture | ✅ PASS | MCP/agents unchanged from Phase III |
| VIII. Local Kubernetes Infrastructure | ✅ PASS | Minikube-only, Helm-first, correct replicas |

**Constitution Compliance Summary**:
- ✅ Standard Docker (no Gordon)
- ✅ Minikube local cluster (no cloud K8s)
- ✅ Helm Charts for all resources
- ✅ Frontend: 2 replicas, Backend: 1 replica
- ✅ kubectl-ai and Kagent integration
- ✅ Health probes defined
- ✅ Secrets via Kubernetes (not committed)

## Project Structure

### Documentation (this feature)

```text
specs/003-k8s-deployment/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Technology decisions and rationale
├── data-model.md        # Kubernetes resource entities
├── quickstart.md        # Deployment guide
├── contracts/
│   ├── helm-values-schema.yaml  # Helm values contract
│   └── scripts-interface.md     # Script API contract
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Implementation tasks (from /sp.tasks)
```

### Source Code (repository root)

```text
# Existing application (from Phase III)
backend/
├── src/
│   ├── api/
│   ├── services/
│   ├── schemas/
│   └── main.py
├── requirements.txt
└── Dockerfile              # NEW: Multi-stage build

frontend/
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
├── package.json
└── Dockerfile              # NEW: Multi-stage build

# NEW: Kubernetes infrastructure
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

# NEW: Deployment scripts
scripts/
├── setup-prerequisites.sh
├── start-minikube.sh
├── build-images.sh
├── load-images.sh
├── deploy-backend.sh
├── deploy-frontend.sh
├── deploy-all.sh
├── verify-deployment.sh
└── setup-ai-tools.sh
```

**Structure Decision**: Web application structure maintained from Phase III. Adding `helm/` for Kubernetes charts, `scripts/` for automation, and Dockerfiles in each application directory.

## Complexity Tracking

No constitution violations requiring justification. All implementation choices align with Phase IV constraints.

## Implementation Phases

### Phase 1: Containerization (US1)

**Goal**: Create production-ready Docker images for both applications.

**Artifacts**:
- `backend/Dockerfile` - Multi-stage build with python:3.11-slim
- `frontend/Dockerfile` - Multi-stage build with node:20-alpine
- `scripts/build-images.sh` - Automated build script

**Key Decisions** (from research.md):
- Multi-stage builds to minimize image size
- python:3.11-slim for backend runtime (smaller than full python)
- node:20-alpine for frontend (lightweight)
- Semantic versioning with commit hash for tags

### Phase 2: Helm Charts (US2)

**Goal**: Create Helm charts for reproducible Kubernetes deployments.

**Artifacts**:
- `helm/todo-backend/` - Complete Helm chart
- `helm/todo-frontend/` - Complete Helm chart
- Values files for local environment

**Key Decisions** (from research.md):
- Separate charts for independent scaling
- NodePort for frontend access (simplest for local)
- ClusterIP for backend (internal only)
- ConfigMaps for non-sensitive config
- Secrets referenced by name (created separately)

### Phase 3: Minikube Deployment (US2)

**Goal**: Deploy and verify full stack on Minikube.

**Artifacts**:
- `scripts/start-minikube.sh` - Cluster setup
- `scripts/load-images.sh` - Image loading
- `scripts/deploy-backend.sh` - Backend deployment
- `scripts/deploy-frontend.sh` - Frontend deployment
- `scripts/deploy-all.sh` - Full orchestration
- `scripts/verify-deployment.sh` - Health verification

**Key Decisions** (from research.md):
- Docker driver for cross-platform compatibility
- 4GB memory / 2 CPU allocation
- `minikube service` for access (no ingress needed)
- Kubernetes DNS for inter-service communication

### Phase 4: AI Tools Integration (US3)

**Goal**: Enable AI-assisted cluster operations.

**Artifacts**:
- `scripts/setup-ai-tools.sh` - Tool installation
- Documentation for kubectl-ai usage
- Kagent configuration

**Key Decisions** (from research.md):
- kubectl-ai via krew plugin or direct binary
- Kagent via Kubernetes manifests
- Natural language examples in quickstart.md

### Phase 5: Automation & Polish (US4)

**Goal**: Ensure all steps are script-driven and documented.

**Artifacts**:
- All scripts follow interface contract
- `quickstart.md` - Complete deployment guide
- Error handling and logging in all scripts

## Dependencies Graph

```
┌──────────────────┐
│  Prerequisites   │
│  (Docker, etc.)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Dockerfiles    │──────────────────────────────┐
│  (backend, fe)   │                              │
└────────┬─────────┘                              │
         │                                        │
         ▼                                        │
┌──────────────────┐    ┌──────────────────┐      │
│   Build Images   │    │   Helm Charts    │      │
│   (script)       │    │   (templates)    │      │
└────────┬─────────┘    └────────┬─────────┘      │
         │                       │                │
         ▼                       │                │
┌──────────────────┐             │                │
│ Start Minikube   │             │                │
│   (script)       │             │                │
└────────┬─────────┘             │                │
         │                       │                │
         ▼                       ▼                │
┌──────────────────┐    ┌──────────────────┐      │
│  Load Images     │───►│ Deploy Backend   │◄─────┘
│   (script)       │    │   (Helm)         │
└──────────────────┘    └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │ Deploy Frontend  │
                        │   (Helm)         │
                        └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │    Verify        │
                        │   (script)       │
                        └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │   AI Tools       │
                        │   (optional)     │
                        └──────────────────┘
```

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Minikube resource constraints | Medium | High | Document minimum requirements; provide error messages |
| Database connectivity from cluster | Low | High | Verify Neon allows connections from Minikube IP range |
| Image build failures | Low | Medium | Multi-stage builds tested; clear error messages |
| Helm chart misconfiguration | Medium | Medium | Values schema validation; verify script |

## Success Metrics

| Metric | Target | Verification |
|--------|--------|--------------|
| Deployment time | < 15 minutes | Time `deploy-all.sh` |
| Pod ready time | < 2 minutes | Watch `kubectl get pods` |
| Frontend response | < 60 seconds after deploy | Access via `minikube service` |
| Backend health | < 30 seconds after pod start | Curl /health endpoint |
| Rolling update | Zero downtime | Access app during `helm upgrade` |
| kubectl-ai success | 80% common queries | Test documented examples |

## Next Steps

1. Run `/sp.tasks` to generate implementation tasks
2. Tasks will be organized by user story (US1-US4)
3. Implementation follows dependency order above
4. Each script is tested independently before integration
