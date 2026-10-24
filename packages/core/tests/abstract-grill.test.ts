import * as fs from 'fs';
import * as path from 'path';
import { AbstractGrillEngine, AbstractGrillState } from '../src/grill/abstract-engine';
import { CliRouter } from '../src/cli/router';
import { parseOkfSpec } from '../src/parser/okf';

describe('Abstract Grill Engine & /abstract-grill', () => {
  const tempFile = path.resolve(__dirname, 'test_abstract_concept.md');
  const validConcept = `---
title: "Distributed Job Scheduler"
type: "concept-doc"
description: "Abstract architecture for distributing resilient background tasks"
status: "concept"
---
# Distributed Job Scheduler

This concept covers scheduling background tasks across worker nodes.
`;

  beforeEach(() => {
    fs.writeFileSync(tempFile, validConcept, 'utf8');
  });

  afterEach(() => {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  });

  it('should transition through state machine and record abstract deliberation', async () => {
    const engine = new AbstractGrillEngine();
    const states: AbstractGrillState[] = [];

    await engine.grill(tempFile, {
      depth: 'standard_drill',
      nonInteractive: true,
      onStateChange: (state) => {
        states.push(state);
      },
    });

    expect(states).toEqual([
      'INIT',
      'PARSING',
      'GENERATING_PARADIGMS',
      'GRILLING',
      'SAVING',
      'DONE',
    ]);

    const updatedContent = fs.readFileSync(tempFile, 'utf8');
    expect(updatedContent).toContain('## Abstract Grilling Deliberation (Standard Drill)');
    expect(updatedContent).toContain('Core Architectural Paradigm & Interface Boundary');
    expect(updatedContent).toContain('Declarative Engine');
    expect(updatedContent).toContain('Reactive Dataflow Pipeline');
    expect(updatedContent).toContain('Autonomous State Machine Runtime');
    expect(updatedContent).toContain('Depth & Reusability Audit:');
    expect(updatedContent).toContain('Three-Scenario Generalization Test');
  });

  it('should support light_probe and deep_interrogation depth matrices', async () => {
    const engine = new AbstractGrillEngine();

    // 1. light_probe (2 questions: Paradigm + Information Hiding)
    await engine.grill(tempFile, {
      depth: 'light_probe',
      nonInteractive: true,
    });

    let content = fs.readFileSync(tempFile, 'utf8');
    expect(content).toContain('PARADIGM-01');
    expect(content).not.toContain('Concurrency Model & Invariant Protection');

    // Reset file
    fs.writeFileSync(tempFile, validConcept, 'utf8');

    // 2. deep_interrogation (4 questions: includes Concurrency & Invariants)
    await engine.grill(tempFile, {
      depth: 'deep_interrogation',
      nonInteractive: true,
    });

    content = fs.readFileSync(tempFile, 'utf8');
    expect(content).toContain('Concurrency Model & Invariant Protection');
    expect(content).toContain('Immutable Data Flow & Copy-On-Write');
    expect(content).toContain('Actor Model / Single-Threaded Fiber Queue');
  });

  it('should generate an ADR artifact when outputTarget includes adr', async () => {
    const engine = new AbstractGrillEngine();
    const adrDir = path.resolve('knowledge/architecture/ADR');

    await engine.grill(tempFile, {
      depth: 'standard_drill',
      nonInteractive: true,
      outputTarget: 'adr',
    });

    expect(fs.existsSync(adrDir)).toBe(true);
    const adrFiles = fs
      .readdirSync(adrDir)
      .filter((f) => f.includes('test_abstract_concept-abstract-design.md'));
    expect(adrFiles.length).toBeGreaterThan(0);

    // Clean up created test ADR
    adrFiles.forEach((file) => {
      fs.unlinkSync(path.join(adrDir, file));
    });
  });

  it('should execute successfully via CliRouter abstract-grill command', async () => {
    const router = new CliRouter();
    const exitCode = await router.route([
      'abstract-grill',
      tempFile,
      '--non-interactive',
      '--depth',
      'standard_drill',
    ]);

    expect(exitCode).toBe(0);
    const content = fs.readFileSync(tempFile, 'utf8');
    expect(content).toContain('## Abstract Grilling Deliberation (Standard Drill)');
  });
});
