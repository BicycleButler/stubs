import { GraphNode, GraphEdge } from './extractor';
import { normalizePosixPath } from './engine';

export type FrameworkKind = 'express' | 'fastapi' | 'django' | 'flask' | 'gin';

export interface ExtractedRoute {
  framework: FrameworkKind;
  method: string;
  path: string;
  handlerSymbol: string;
}

export interface ExtractedRouteGraph {
  routes: ExtractedRoute[];
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Extracts HTTP routes and controller handlers from source code.
 * Supports Express (TS/JS), FastAPI (Python), Django (Python), Flask (Python), and Gin (Go).
 */
export function extractFrameworkRoutes(
  filePath: string,
  content: string,
  options: { domain?: string | null; phase?: string | null } = {},
): ExtractedRouteGraph {
  const normPath = normalizePosixPath(filePath);
  const domain = options.domain || 'routes';
  const phase = options.phase || null;

  const routes: ExtractedRoute[] = [];
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const addRoute = (
    framework: FrameworkKind,
    method: string,
    routePath: string,
    handlerSymbol: string,
  ) => {
    const cleanMethod = method.toUpperCase().trim();
    const cleanPath = routePath.startsWith('/') ? routePath : `/${routePath}`;
    const routeNodeId = `route:${cleanMethod}:${cleanPath}`;

    routes.push({
      framework,
      method: cleanMethod,
      path: cleanPath,
      handlerSymbol,
    });

    nodes.push({
      id: routeNodeId,
      file_path: normPath,
      symbol_name: `${cleanMethod} ${cleanPath}`,
      kind: 'symbol',
      domain,
      lifecycle_phase: phase,
    });

    const targetHandlerId = handlerSymbol.includes('#')
      ? handlerSymbol
      : `${normPath}#${handlerSymbol}`;

    edges.push({
      source_id: routeNodeId,
      target_id: targetHandlerId,
      relation: 'handles' as any,
      confidence: 'EXTRACTED',
      weight: 1.0,
    });
  };

  const isTsJs = /\.(ts|tsx|js|jsx|mjs|cjs)$/i.test(normPath);
  const isPy = /\.py$/i.test(normPath);
  const isGo = /\.go$/i.test(normPath);

  // 1. Express (TS/JS)
  if (isTsJs) {
    const expressRegex =
      /(?:app|router|server)\.(get|post|put|delete|patch|options|head|all)\s*\(\s*(['"`])([^'"`]+)\2\s*,\s*(?:[a-zA-Z0-9_$.]+\s*,\s*)*([a-zA-Z0-9_$]+)/g;
    let match: RegExpExecArray | null;
    while ((match = expressRegex.exec(content)) !== null) {
      const method = match[1];
      const routePath = match[3];
      const handler = match[4];
      addRoute('express', method, routePath, handler);
    }
  }

  // 2. FastAPI, Flask, Django (Python)
  if (isPy) {
    // 2a. FastAPI: @app.get('/path') \n async def handler(...)
    const fastApiRegex =
      /@(?:app|router|api_router)\.(get|post|put|delete|patch|options|head)\s*\(\s*(['"`])([^'"`]+)\2[^)]*\)\s*\n\s*(?:async\s+)?def\s+([a-zA-Z0-9_]+)/g;
    let match: RegExpExecArray | null;
    while ((match = fastApiRegex.exec(content)) !== null) {
      addRoute('fastapi', match[1], match[3], match[4]);
    }

    // 2b. Flask: @app.route('/path', methods=['GET', 'POST']) \n def handler(...)
    const flaskRegex =
      /@(?:app|bp|[a-zA-Z0-9_]+_bp)\.route\s*\(\s*(['"`])([^'"`]+)\1(?:\s*,\s*methods\s*=\s*\[([^\]]+)\])?\s*\)\s*\n\s*def\s+([a-zA-Z0-9_]+)/g;
    while ((match = flaskRegex.exec(content)) !== null) {
      const routePath = match[2];
      const methodsRaw = match[3];
      const handler = match[4];

      if (methodsRaw) {
        const methods = methodsRaw
          .split(',')
          .map((m) => m.replace(/['"\s]/g, ''))
          .filter(Boolean);
        for (const m of methods) {
          addRoute('flask', m, routePath, handler);
        }
      } else {
        addRoute('flask', 'GET', routePath, handler);
      }
    }

    // 2c. Django: path('pattern', view_func) or re_path('pattern', view_func)
    const djangoRegex =
      /(?:path|re_path)\s*\(\s*(['"`])([^'"`]*)\1\s*,\s*([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)?)/g;
    while ((match = djangoRegex.exec(content)) !== null) {
      const routePattern = match[2];
      const handler = match[3];
      addRoute('django', 'ALL', routePattern, handler);
    }
  }

  // 3. Gin (Go)
  if (isGo) {
    const ginRegex =
      /(?:r|router|api|v1|[a-zA-Z0-9_]+)\.(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\s*\(\s*(['"`])([^'"`]+)\2\s*,\s*(?:[a-zA-Z0-9_$.]+\s*,\s*)*([a-zA-Z0-9_]+)/g;
    let match: RegExpExecArray | null;
    while ((match = ginRegex.exec(content)) !== null) {
      addRoute('gin', match[1], match[3], match[4]);
    }
  }

  return { routes, nodes, edges };
}
