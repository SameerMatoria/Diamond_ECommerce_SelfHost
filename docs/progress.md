# Project Progress

This document tracks completed work and remaining tasks across modules.

## Status

### Module A: Local Dev + AWS-first foundations

- [x] Repo scaffold: `server`, `web`, `infra`, `docs`
- [x] Docker Compose for Postgres + Minio
- [x] Express base (health, logging, error handler, CORS, Helmet, rate limit)
- [x] Prisma init, migration, seed
- [x] Minimal web app hitting `/api/health`
- [x] `.env.example` for local dev

### Module B: Google Auth + JWT + RBAC

- [x] Google ID token verification
- [x] JWT access + refresh with rotation
- [x] Refresh token storage in DB
- [x] RBAC middleware
- [x] Admin allowlist via `ADMIN_EMAIL_ALLOWLIST`
- [x] Auth tests (Jest + Supertest)

### Module C: Product Catalog (public + admin)

- [x] Public catalog endpoints (products, categories)
- [x] Admin CRUD for categories + products
- [x] Presigned upload endpoint + product image metadata
- [x] Storefront pages (home, listing, product detail)
- [x] Admin pages (products + categories)
- [x] Product endpoint tests

### Module D: Cart + Checkout

- [x] Cart endpoints (add/update/remove/get)
- [x] Checkout endpoint (COD) with stock validation + order creation
- [x] Cart + checkout UI
- [x] Cart/checkout tests

### Module E: Orders

- [x] User order list + detail endpoints
- [x] Admin order list + status updates
- [x] Admin audit logs for status updates
- [x] Web UI for user + admin orders
- [x] Tests for orders

### Module F: Admin Users + Roles

- [x] Admin user list + role update endpoints
- [x] Super-admin protection (optional allowlist)
- [x] Web UI for admin user management
- [x] Tests for role updates

### Module G: AWS Infrastructure + Deployment

- [ ] IaC setup (Terraform preferred) for VPC, ECS, ALB, RDS, S3, ECR, Secrets Manager, IAM, CloudWatch
- [ ] CI/CD workflows (lint/test, build/push, deploy)
- [ ] Dev + prod environments
- [ ] Deployment docs

## Cross-cutting tasks

- [ ] OpenAPI/collection updates for new endpoints
- [ ] Additional backend tests coverage
- [ ] Frontend tests (minimal)
- [ ] AWS infra docs + diagrams
