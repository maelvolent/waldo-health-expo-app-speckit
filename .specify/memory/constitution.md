<!--
SYNC IMPACT REPORT
===================
Version Change: [INITIAL] → 1.0.0
Rationale: Initial constitution creation with comprehensive principles for code quality, testing, UX, and performance

Modified Principles: N/A (Initial creation)
Added Sections:
  - Core Principles (5 principles: Code Quality First, Test-Driven Development, User Experience Consistency, Performance Standards, Observability & Monitoring)
  - Quality Gates
  - Development Workflow
  - Governance

Removed Sections: N/A (Initial creation)

Templates Status:
  ✅ .specify/templates/plan-template.md - Reviewed, aligns with Constitution Check section
  ✅ .specify/templates/spec-template.md - Reviewed, aligns with user scenarios and requirements
  ✅ .specify/templates/tasks-template.md - Reviewed, aligns with test-first approach and task organization

Follow-up TODOs: None
-->

# Waldo Health Constitution

## Core Principles

### I. Code Quality First

Every code contribution MUST meet the following non-negotiable standards:

- **Type Safety**: All code MUST be strongly typed with explicit type annotations. No `any` types except in rare, documented edge cases.
- **Code Review**: All changes MUST pass peer review before merging. Reviewers MUST verify adherence to this constitution.
- **Linting & Formatting**: All code MUST pass linting (ESLint/Prettier or equivalent) with zero warnings. Automated checks MUST block merging on violations.
- **Documentation**: Public APIs, complex logic, and non-obvious implementations MUST include clear inline documentation and JSDoc/TSDoc comments.
- **Single Responsibility**: Functions and modules MUST have a single, well-defined purpose. Complex functions (>50 lines) require justification.
- **DRY Principle**: Code duplication MUST be avoided. Shared logic MUST be extracted into reusable utilities or libraries.

**Rationale**: High code quality reduces technical debt, improves maintainability, and minimizes bugs in production. Type safety catches errors at compile-time rather than runtime.

### II. Test-Driven Development (NON-NEGOTIABLE)

All features MUST follow the Test-Driven Development (TDD) workflow:

- **Red-Green-Refactor Cycle**: Write failing tests → Implement minimal code to pass → Refactor for quality.
- **Test Coverage**: All new code MUST achieve minimum 80% code coverage. Critical paths (authentication, payments, data mutations) require 95%+ coverage.
- **Test Types Required**:
  - **Unit Tests**: Test individual functions and components in isolation. MUST cover all edge cases and error conditions.
  - **Integration Tests**: Test interactions between modules, services, and external dependencies.
  - **Contract Tests**: Verify API contracts between frontend/backend or between services.
  - **E2E Tests**: Test critical user journeys end-to-end for P1 features.
- **Tests Run Before Merge**: All test suites MUST pass before code can be merged. CI/CD pipeline MUST enforce this.
- **Test Naming**: Tests MUST follow the pattern `should [expected behavior] when [condition]` for clarity.

**Rationale**: TDD ensures testability, prevents regressions, documents expected behavior, and gives confidence in refactoring. Writing tests first forces better design.

### III. User Experience Consistency

User-facing features MUST deliver consistent, accessible, and delightful experiences:

- **Design System Compliance**: All UI components MUST use the approved design system (shadcn/ui or equivalent). Custom components require design review.
- **Accessibility Standards**: All user interfaces MUST meet WCAG 2.1 AA standards minimum. This includes:
  - Keyboard navigation support
  - Screen reader compatibility
  - Sufficient color contrast (4.5:1 for normal text, 3:1 for large text)
  - Focus indicators on interactive elements
  - Semantic HTML with proper ARIA labels
- **Responsive Design**: All interfaces MUST work seamlessly across mobile (375px), tablet (768px), and desktop (1920px+) viewports.
- **Loading States**: All asynchronous operations MUST show loading indicators. No blank screens or unresponsive UI.
- **Error Handling**: User-facing errors MUST be actionable and non-technical. Include recovery steps when possible.
- **Consistency**: Similar actions MUST behave similarly across the application (e.g., all forms validate on submit, all modals have consistent close behavior).

**Rationale**: Consistent UX reduces cognitive load, improves user satisfaction, ensures legal compliance (accessibility), and minimizes support burden.

### IV. Performance Standards

All features MUST meet the following performance requirements:

- **Page Load Time**: Initial page loads MUST complete within 2 seconds on 3G networks (LCP < 2.5s).
- **Time to Interactive**: Pages MUST become interactive within 3 seconds (TTI < 3s).
- **API Response Times**:
  - P95 latency MUST be < 200ms for read operations
  - P95 latency MUST be < 500ms for write operations
  - P99 latency MUST be < 1000ms for all operations
- **Bundle Size**: Frontend JavaScript bundles MUST be < 200KB (gzipped) for initial load. Code splitting MUST be used for routes and heavy features.
- **Database Queries**: All queries MUST use indexes. No N+1 query patterns. Queries taking > 100ms require optimization or explanation.
- **Memory Usage**: Backend services MUST operate within 512MB memory limit. Memory leaks are blocking issues.
- **Performance Monitoring**: All production features MUST be monitored with real user metrics (RUM). Performance regressions trigger alerts.

**Rationale**: Performance directly impacts user experience, SEO rankings, conversion rates, and infrastructure costs. Poor performance drives users away.

### V. Observability & Monitoring

All production code MUST be observable and debuggable:

- **Structured Logging**: All services MUST use structured JSON logging with consistent fields:
  - `timestamp`, `level`, `service`, `userId`, `requestId`, `message`, `context`, `error`
- **Error Tracking**: All exceptions MUST be captured with full context (stack trace, user ID, request details) and sent to error tracking service (Sentry or equivalent).
- **Metrics & Alerting**: Critical operations MUST emit metrics and have associated alerts:
  - Error rates (alert if > 1% in 5-minute window)
  - Response time degradation (alert if P95 > 500ms)
  - Resource exhaustion (CPU > 80%, Memory > 90%)
- **Request Tracing**: All API requests MUST include correlation IDs for distributed tracing.
- **Audit Logging**: All security-relevant operations (auth, data mutations, permission changes) MUST be logged immutably.
- **Health Checks**: All services MUST expose `/health` and `/ready` endpoints for orchestration.

**Rationale**: Without observability, debugging production issues is impossible. Proactive monitoring catches problems before users report them.

## Quality Gates

All features MUST pass these gates before deployment:

1. **Gate 1 - Design Review**: Feature spec and design artifacts approved by product/design team
2. **Gate 2 - Code Review**: Peer review completed with all feedback addressed
3. **Gate 3 - Automated Tests**: 100% of test suites passing in CI/CD
4. **Gate 4 - Performance Audit**: Lighthouse score > 90 for all metrics, no regressions in API latency
5. **Gate 5 - Security Scan**: No critical or high-severity vulnerabilities detected
6. **Gate 6 - Accessibility Audit**: WCAG 2.1 AA compliance verified via automated tools and manual testing
7. **Gate 7 - Staging Validation**: Feature deployed to staging and validated by QA/product team

**Enforcement**: PR merging is blocked until all gates pass. Production deploys require approval from tech lead.

## Development Workflow

### Branch Strategy
- **Main Branch**: Always production-ready. Protected with required status checks.
- **Feature Branches**: Pattern `###-feature-name` (e.g., `123-user-authentication`). Branch from main, merge via PR.
- **No Direct Commits**: Main branch only receives commits via reviewed, approved PRs.

### Code Review Requirements
- **Minimum 1 Approval**: At least one peer review approval required
- **Constitution Checklist**: Reviewers MUST verify compliance with all applicable principles
- **Security Review**: Authentication, authorization, data handling changes require security-focused review
- **Performance Review**: Database changes, API endpoints, frontend bundles require performance review

### Testing Workflow
1. Write failing tests (unit + integration)
2. Get user/product approval on test scenarios
3. Verify tests fail (Red)
4. Implement minimal code to pass tests (Green)
5. Refactor for quality while keeping tests green
6. Add E2E tests for critical paths
7. Verify coverage thresholds met

### Documentation Requirements
- **README.md**: MUST contain project overview, setup instructions, architecture summary
- **API Documentation**: All endpoints documented with OpenAPI/Swagger specs
- **Architecture Decisions**: Significant technical decisions MUST be captured in ADR (Architecture Decision Records)
- **Inline Comments**: Complex algorithms, workarounds, performance optimizations MUST have explanatory comments

## Governance

This Constitution supersedes all other practices and serves as the definitive source of truth for development standards.

### Amendment Process
1. Propose amendment via PR to `.specify/memory/constitution.md`
2. Document rationale and impact analysis
3. Team discussion and consensus-building
4. Approval by tech lead and affected stakeholders
5. Update version number according to semantic versioning
6. Propagate changes to dependent templates and documentation
7. Communicate changes to entire engineering team

### Versioning Policy
- **MAJOR** (X.0.0): Breaking changes, principle removal, fundamental governance changes
- **MINOR** (1.X.0): New principles added, significant expansions to existing principles
- **PATCH** (1.0.X): Clarifications, typo fixes, non-semantic refinements

### Compliance Review
- **Pre-Merge**: All PRs MUST pass automated constitution compliance checks
- **Weekly**: Tech leads review recent PRs for adherence to principles
- **Quarterly**: Full audit of codebase against current constitution standards
- **Complexity Justification**: Any deviation from principles MUST be documented in `plan.md` Complexity Tracking section with:
  - Specific violation
  - Business justification
  - Simpler alternatives considered and rejected
  - Mitigation strategy

### Enforcement
- **Automated**: CI/CD pipeline enforces testable rules (linting, test coverage, performance budgets)
- **Manual**: Code reviewers enforce subjective standards (code quality, documentation clarity)
- **Blocking**: Constitution violations block PR approval and deployment
- **Continuous Improvement**: Retrospectives identify gaps in constitution and propose amendments

**Version**: 1.0.0 | **Ratified**: 2025-11-06 | **Last Amended**: 2025-11-06
