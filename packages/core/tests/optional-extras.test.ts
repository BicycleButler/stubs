import { tryLoadOptionalParser, extractFileGraph } from '../src/graph/extractor';

describe('Runtime Optional Extras Detection & Graceful Fallback (Q7 / Q13)', () => {
  test('tryLoadOptionalParser should return null for missing packages without throwing', () => {
    const parser = tryLoadOptionalParser('non-existent-tree-sitter-grammar-pkg');
    expect(parser).toBeNull();
  });

  test('extractFileGraph should parse Python code cleanly when optional tree-sitter is missing', () => {
    const pyCode = `
import os
from sys import argv

class AppConfig:
    def __init__(self):
        self.debug = True

def run():
    print("running")
`;
    const graph = extractFileGraph('service.py', pyCode);
    expect(graph.nodes.length).toBeGreaterThan(0);

    const classNode = graph.nodes.find((n) => n.symbol_name === 'AppConfig');
    expect(classNode).toBeDefined();
    expect(classNode?.kind).toBe('class');

    const funcNode = graph.nodes.find((n) => n.symbol_name === 'run');
    expect(funcNode).toBeDefined();
    expect(funcNode?.kind).toBe('function');
  });

  test('extractFileGraph should parse Go code cleanly when optional tree-sitter is missing', () => {
    const goCode = `
package main

import "fmt"

type Server struct {
    Port int
}

func Start() {
    fmt.Println("started")
}
`;
    const graph = extractFileGraph('main.go', goCode);
    expect(graph.nodes.length).toBeGreaterThan(0);

    const structNode = graph.nodes.find((n) => n.symbol_name === 'Server');
    expect(structNode).toBeDefined();
    expect(structNode?.kind).toBe('class');

    const funcNode = graph.nodes.find((n) => n.symbol_name === 'Start');
    expect(funcNode).toBeDefined();
    expect(funcNode?.kind).toBe('function');
  });

  test('extractFileGraph should parse Rust code cleanly when optional tree-sitter is missing', () => {
    const rsCode = `
use std::collections::HashMap;

pub struct Config {
    pub name: String,
}

pub fn initialize() {
    println!("init");
}
`;
    const graph = extractFileGraph('lib.rs', rsCode);
    expect(graph.nodes.length).toBeGreaterThan(0);

    const structNode = graph.nodes.find((n) => n.symbol_name === 'Config');
    expect(structNode).toBeDefined();
    expect(structNode?.kind).toBe('class');

    const fnNode = graph.nodes.find((n) => n.symbol_name === 'initialize');
    expect(fnNode).toBeDefined();
    expect(fnNode?.kind).toBe('function');
  });
});
