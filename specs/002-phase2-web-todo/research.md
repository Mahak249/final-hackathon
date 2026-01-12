# Research: Phase II Full-Stack Todo Web Application

**Feature**: Phase II Full-Stack Todo Web Application
**Date**: 2025-12-31

## Technology Decisions

### Backend Framework: FastAPI

**Decision**: Use FastAPI for the Python REST API backend.

**Rationale**:
- Native async support for handling concurrent requests efficiently
- Automatic OpenAPI/Swagger documentation generation
- Pydantic integration for request/response validation
- Type hints provide IDE autocomplete and error detection
- Lightweight and performant compared to alternatives like Django

**Alternatives Considered**:
- **Flask**: Simpler but requires more boilerplate for validation and docs
- **Django**: Full-featured but overkill for this scope; higher learning curve
- **aiohttp**: Lower-level async; lacks FastAPI's convenience features

---

### ORM: SQLModel

**Decision**: Use SQLModel for database operations.

**Rationale**:
- Combines Pydantic and SQLAlchemy for type-safe database access
- Unified syntax for both data models and Pydantic schemas
- Works with PostgreSQL (Neon) natively
- Simplifies the model-to-schema conversion

**Alternatives Considered**:
- **SQLAlchemy Core**: More mature but verbose; requires managing two type systems
- **Django ORM**: Tightly coupled to Django framework
- **Raw SQL**: Error-prone and not maintainable at scale

---

### Authentication: Better Auth

**Decision**: Use Better Auth for email/password authentication.

**Rationale**:
- Provides complete auth flow (signup, signin, signout, session management)
- Works well with React/Next.js frontend
- Secure password hashing built-in
- Extensible for future auth methods

**Alternatives Considered**:
- **NextAuth.js**: Good but focused on Next.js API routes; we're using separate backend
- **Auth.js**: Similar to NextAuth; better for server-side rendering patterns
- **Custom implementation**: Would require implementing secure password hashing, session management, and security best practices; too error-prone

---

### Frontend Framework: Next.js

**Decision**: Use Next.js 14+ with React and TypeScript.

**Rationale**:
- App Router provides modern routing and server components
- Built-in optimization and performance features
- Large ecosystem and community support
- TypeScript support out of the box
- Responsive design capabilities

**Alternatives Considered**:
- **Create React App**: Deprecated; less optimized for production
- **Vite + React**: Good developer experience but requires more setup for routing and SSR
- **Remix**: Excellent web standards focus but smaller ecosystem

---

### Database: Neon Serverless PostgreSQL

**Decision**: Use Neon as the PostgreSQL hosting provider.

**Rationale**:
- Serverless PostgreSQL with auto-scaling
- Excellent TypeScript/JavaScript driver support
- Connection pooling built-in
- Easy to set up and manage
- Generous free tier for development

**Alternatives Considered**:
- **Supabase**: Also serverless PostgreSQL but includes more features we don't need
- **Local PostgreSQL**: Good for dev but not deployable to production easily
- **Other cloud providers**: More complex setup; Neon is optimized for serverless

---

### Session Management: HTTP-Only Cookies

**Decision**: Store authentication session in HTTP-only cookies.

**Rationale**:
- Prevents JavaScript access (XSS protection)
- Automatically sent with requests
- Secure flag for HTTPS-only transmission
- Same-site protection options

**Implementation**:
- Backend sets cookie on successful signin
- Backend validates cookie on protected endpoints
- Frontend doesn't need to manually handle tokens

---

## Best Practices Applied

### Security

- Passwords hashed with bcrypt (or equivalent)
- SQL injection prevented via SQLModel parameterization
- CORS configured to allow only frontend origin
- Input validation on all endpoints
- Generic error messages (no details in 404 responses)

### Performance

- Database indexes on frequently queried columns
- Connection pooling via SQLModel/SQLAlchemy
- Minimal data transfer (only required fields in responses)
- Async endpoints for non-blocking operations

### Code Organization

- Separation of concerns: routes, models, schemas, services
- Dependency injection for database sessions and auth
- Type definitions shared between frontend and backend (via API contracts)
- Environment-based configuration

---

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Better Auth Documentation](https://www.better-auth.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Neon Documentation](https://neon.tech/docs)
