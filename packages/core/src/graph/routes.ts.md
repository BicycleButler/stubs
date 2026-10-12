---
title: Framework Routes Extractor
type: sidecar-spec
description: >-
  Extracts HTTP routes, methods, and controller handler links from web framework
  source files across Express, FastAPI, Django, Flask, and Gin. Emits route
  nodes and 'handles' graph edges to controller implementations.
tags:
  - routes
  - frameworks
  - express
  - fastapi
  - django
  - flask
  - gin
  - ast
module_depth: deep
context_object: RouteExtractor
status: spec
version: 1
target_code_file: ./routes.ts
status_flag: clean
exports:
  - extractFrameworkRoutes
  - ExtractedRoute
  - FrameworkKind
depends_on:
  - ./extractor
  - ./engine
used_by:
  - src/graph/extractor.ts
---

# Framework Routes Extractor

Extracts HTTP endpoints and their associated handler functions from application source code. Supports 5 major frameworks natively:

1. **Express (TypeScript/JavaScript):** `app.get()`, `app.post()`, `router.use()`, `router.route()`
2. **FastAPI (Python):** `@app.get()`, `@router.post()`, etc.
3. **Django (Python):** `path('pattern', view_func)` and `re_path()` in `urls.py`
4. **Flask (Python):** `@app.route()`, `@bp.route()`
5. **Gin (Go):** `r.GET()`, `r.POST()`, `group.POST()`

## Node and Edge Contracts

- **Node ID format:** `route:<METHOD>:<path>` (e.g. `route:GET:/api/bikes`)
- **Node kind:** `'symbol'` or `'file'` with `domain: 'routes'`
- **Edge relation:** `'handles'`
- **Edge source:** Route node ID (`route:GET:/api/bikes`)
- **Edge target:** Handler function or method node ID (`src/controllers/bikes.ts#getBikes`)
- **Confidence:** `'EXTRACTED'`
