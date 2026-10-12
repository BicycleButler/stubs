---
title: Server & Live Portal — Domain Context Map
type: domain-context-map
domain: server
parent_map: ../context-map.md
description: Deep-dive context map for the server domain, subsystem responsibilities, and internal modules.
tags:
  - domain-map
  - server
  - agent-optimized
---

# Server & Live Portal — Domain Context Map

Parent Context Map: knowledge/architecture/context-map.md

## Domain Purpose & Responsibilities
The **Server & Live Portal** domain provides an interactive dashboard and real-time visualization layer for the codebase. It spins up an Express server serving a single-page portal, connects to a file system watcher (`chokidar`), and streams Server-Sent Events (SSE) to connected clients when specifications or code change.

---

## Key Modules & Files
src/web/shims.ts (Hub) -> deps: none | caps: sha256, rightRotate, Hash, update, digest, createHash, randomBytes, pbkdf2Sync
src/web/index.ts -> deps: none | caps: checkLocalServer, loadLocalServerWorkspace, reloadLocalServerWorkspaceSilent, connectLocalSse, openLocalDirectoryPicker, scanDirectoryRecursive, loadCachedFilesForCurrentRepoBranch, startApp
src/server/github.ts -> deps: src/storage/credentials.ts.md | caps: getEncryptionKey, encryptToken, decryptToken, GitHubUser, RepositoryInfo, GitHubTreeEntry, resolveEnvPlaceholders, resolveToken
src/server/portal.ts -> deps: none | caps: resolveWebPath, extractExports, PortalServer, start, stop, parseJsonBody, resolveGraphEngine, ingestRemoteSpecs
src/server/github.ts.md -> deps: none | caps: encryptToken, decryptToken, GitHubUser, GitHubRepo, GitHubBranch, GitHubFile, GitHubApiClient
src/server/mcp.ts -> deps: none | caps: McpTool, McpServer, start, handleRpcRequest, handleToolCall
src/server/portal.ts.md -> deps: none | caps: PortalServer
src/web/index.ts.md -> deps: none | caps: StubsWebApp
src/web/sw.js -> deps: none | caps: internal

## Domain Invariants
- The server defaults to port 3000 but can be configured via CLI `--port` flags.
- SSE streams push graph mutations, reconciliation events, and file status changes in real time.
