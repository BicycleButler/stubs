import { SkeletonGenerator } from '../src/graph/skeleton';

describe('SkeletonGenerator Interface Stubs & Body Stripping', () => {
  const generator = new SkeletonGenerator();

  it('strips TypeScript class and function bodies while preserving signatures', () => {
    const tsCode = `
import { Config } from './config';

export interface UserSession {
  id: string;
  token: string;
}

export class AuthService {
  private secret: string;

  constructor(secret: string) {
    this.secret = secret;
    console.log('heavy setup code line 1');
    console.log('heavy setup code line 2');
  }

  public async verifyToken(token: string): Promise<UserSession | null> {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return { id: 'user_1', token };
  }
}

export function generateId(prefix: string): string {
  const rand = Math.random().toString(36).substring(2);
  return prefix + '_' + rand;
}
`;

    const result = generator.generateSkeleton('src/auth/service.ts', tsCode);
    expect(result.symbolCount).toBe(3); // UserSession, AuthService, generateId
    expect(result.skeletonText).toContain('export interface UserSession');
    expect(result.skeletonText).toContain('class AuthService');
    expect(result.skeletonText).toContain('constructor(secret: string) { /* ... */ }');
    expect(result.skeletonText).toContain(
      'public async verifyToken(token: string): Promise<UserSession | null> { /* ... */ }',
    );
    expect(result.skeletonText).toContain(
      'export function generateId(prefix: string): string { /* ... */ }',
    );
    expect(result.skeletonText).not.toContain('heavy setup code line 1');
    expect(result.tokenSavingsPercent).toBeGreaterThan(30);
    expect(result.skeletonText).toContain('// [L');
  });

  it('strips Python function and method bodies', () => {
    const pyCode = `
import os
import json

class DatabasePool:
    def __init__(self, host: str, port: int):
        self.host = host
        self.port = port
        self.connect_expensive_socket()

    def query(self, sql: str) -> list[dict]:
        cursor = self.conn.cursor()
        cursor.execute(sql)
        return cursor.fetchall()

def create_app(debug: bool = False):
    app = Flask(__name__)
    return app
`;

    const result = generator.generateSkeleton('app/db.py', pyCode);
    expect(result.symbolCount).toBe(4);
    expect(result.skeletonText).toContain('class DatabasePool: ...');
    expect(result.skeletonText).toContain('def __init__(self, host: str, port: int): ...');
    expect(result.skeletonText).toContain('def query(self, sql: str) -> list[dict]: ...');
    expect(result.skeletonText).not.toContain('cursor.execute(sql)');
    expect(result.skeletonText).toContain('# [L');
  });

  it('strips Rust function bodies while preserving pub struct and traits', () => {
    const rsCode = `
use std::sync::Arc;

pub struct ServerConfig {
    pub port: u16,
}

pub trait Handler {
    fn handle(&self, req: Request) -> Response;
}

pub async fn start_server(config: ServerConfig) -> Result<(), String> {
    println!("Starting server on port {}", config.port);
    let listener = TcpListener::bind(config.port).await?;
    Ok(())
}
`;

    const result = generator.generateSkeleton('src/server.rs', rsCode);
    expect(result.symbolCount).toBe(4);
    expect(result.skeletonText).toContain('pub struct ServerConfig');
    expect(result.skeletonText).toContain('pub trait Handler');
    expect(result.skeletonText).toContain(
      'pub async fn start_server(config: ServerConfig) -> Result<(), String> { /* ... */ }',
    );
    expect(result.skeletonText).not.toContain('TcpListener::bind');
  });

  it('strips Go function bodies while preserving structs and interfaces', () => {
    const goCode = `
package main

import "net/http"

type Router struct {
    routes map[string]http.Handler
}

func NewRouter() *Router {
    r := &Router{routes: make(map[string]http.Handler)}
    return r
}
`;

    const result = generator.generateSkeleton('router.go', goCode);
    expect(result.symbolCount).toBe(2);
    expect(result.skeletonText).toContain('type Router struct');
    expect(result.skeletonText).toContain('func NewRouter() *Router { /* ... */ }');
    expect(result.skeletonText).not.toContain('make(map[string]http.Handler)');
  });
});
