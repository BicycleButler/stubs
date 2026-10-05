import { extractFrameworkRoutes } from '../src/graph/routes';
import { extractFileGraph } from '../src/graph/extractor';

describe('Framework-Aware Route Extraction (Q3)', () => {
  describe('1. Express (TS/JS)', () => {
    test('should extract routes and link to handler functions', () => {
      const code = `
import express from 'express';
const app = express();

function getBikes(req, res) {
  res.json([]);
}

const createBike = (req, res) => {
  res.json({ id: 1 });
};

app.get('/api/bikes', getBikes);
app.post('/api/bikes', createBike);
app.delete('/api/bikes/:id', deleteBikeHandler);
`;
      const result = extractFrameworkRoutes('src/routes/bikes.ts', code);
      expect(result.routes.length).toBe(3);

      expect(result.routes[0]).toEqual({
        framework: 'express',
        method: 'GET',
        path: '/api/bikes',
        handlerSymbol: 'getBikes',
      });

      expect(result.nodes.map((n) => n.id)).toContain('route:GET:/api/bikes');
      expect(result.nodes.map((n) => n.id)).toContain('route:POST:/api/bikes');
      expect(result.nodes.map((n) => n.id)).toContain('route:DELETE:/api/bikes/:id');

      const edges = result.edges;
      expect(edges).toContainEqual({
        source_id: 'route:GET:/api/bikes',
        target_id: 'src/routes/bikes.ts#getBikes',
        relation: 'handles',
        confidence: 'EXTRACTED',
        weight: 1.0,
      });
      expect(edges).toContainEqual({
        source_id: 'route:POST:/api/bikes',
        target_id: 'src/routes/bikes.ts#createBike',
        relation: 'handles',
        confidence: 'EXTRACTED',
        weight: 1.0,
      });
    });
  });

  describe('2. FastAPI (Python)', () => {
    test('should extract async and sync route decorators and map to function', () => {
      const code = `
from fastapi import FastAPI, APIRouter

app = FastAPI()
router = APIRouter()

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}

@router.post("/items")
def create_item(item: dict):
    return item
`;
      const result = extractFrameworkRoutes('api/items.py', code);
      expect(result.routes.length).toBe(2);

      expect(result.routes[0]).toEqual({
        framework: 'fastapi',
        method: 'GET',
        path: '/items/{item_id}',
        handlerSymbol: 'read_item',
      });
      expect(result.routes[1]).toEqual({
        framework: 'fastapi',
        method: 'POST',
        path: '/items',
        handlerSymbol: 'create_item',
      });

      expect(result.edges).toContainEqual({
        source_id: 'route:GET:/items/{item_id}',
        target_id: 'api/items.py#read_item',
        relation: 'handles',
        confidence: 'EXTRACTED',
        weight: 1.0,
      });
    });
  });

  describe('3. Django (Python)', () => {
    test('should extract path patterns from urls.py', () => {
      const code = `
from django.urls import path
from . import views

urlpatterns = [
    path('catalog/', views.catalog_index),
    path('catalog/<int:id>/', views.catalog_detail),
]
`;
      const result = extractFrameworkRoutes('store/urls.py', code);
      expect(result.routes.length).toBe(2);
      expect(result.routes[0]).toEqual({
        framework: 'django',
        method: 'ALL',
        path: '/catalog/',
        handlerSymbol: 'views.catalog_index',
      });
      expect(result.nodes.map((n) => n.id)).toContain('route:ALL:/catalog/');
    });
  });

  describe('4. Flask (Python)', () => {
    test('should extract route decorator with default and explicit HTTP methods', () => {
      const code = `
from flask import Flask, Blueprint

app = Flask(__name__)
bp = Blueprint('auth', __name__)

@app.route('/health')
def health_check():
    return "OK"

@bp.route('/login', methods=['GET', 'POST'])
def handle_login():
    return "Login"
`;
      const result = extractFrameworkRoutes('app.py', code);
      expect(result.routes.length).toBe(3); // 1 for health + 2 for login (GET and POST)

      expect(result.routes).toContainEqual({
        framework: 'flask',
        method: 'GET',
        path: '/health',
        handlerSymbol: 'health_check',
      });
      expect(result.routes).toContainEqual({
        framework: 'flask',
        method: 'GET',
        path: '/login',
        handlerSymbol: 'handle_login',
      });
      expect(result.routes).toContainEqual({
        framework: 'flask',
        method: 'POST',
        path: '/login',
        handlerSymbol: 'handle_login',
      });
    });
  });

  describe('5. Gin (Go)', () => {
    test('should extract HTTP methods and handlers from Gin router', () => {
      const code = `
package main

import "github.com/gin-gonic/gin"

func main() {
    r := gin.Default()
    r.GET("/ping", pingHandler)
    v1 := r.Group("/v1")
    v1.POST("/users", createUserHandler)
}
`;
      const result = extractFrameworkRoutes('main.go', code);
      expect(result.routes.length).toBe(2);
      expect(result.routes[0]).toEqual({
        framework: 'gin',
        method: 'GET',
        path: '/ping',
        handlerSymbol: 'pingHandler',
      });
      expect(result.routes[1]).toEqual({
        framework: 'gin',
        method: 'POST',
        path: '/users',
        handlerSymbol: 'createUserHandler',
      });
    });
  });

  describe('6. Integration with extractFileGraph', () => {
    test('should automatically include route nodes and handles edges in extractFileGraph', () => {
      const tsCode = `
import express from 'express';
export function getUsers() {}
const app = express();
app.get('/users', getUsers);
`;
      const graph = extractFileGraph('src/server.ts', tsCode);
      const routeNode = graph.nodes.find((n) => n.id === 'route:GET:/users');
      expect(routeNode).toBeDefined();

      const handlesEdge = graph.edges.find((e) => e.relation === 'handles');
      expect(handlesEdge).toBeDefined();
      expect(handlesEdge?.source_id).toBe('route:GET:/users');
      expect(handlesEdge?.target_id).toBe('src/server.ts#getUsers');
    });
  });
});
