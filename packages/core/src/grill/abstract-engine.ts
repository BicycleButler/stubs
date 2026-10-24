import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as yaml from 'js-yaml';
import { loadConfig } from '../config/schema';
import { parseOkfSpec, OkfFrontmatter } from '../parser/okf';
import { GraphEngine } from '../graph/engine';

export type AbstractGrillState =
  'INIT' | 'PARSING' | 'GENERATING_PARADIGMS' | 'GRILLING' | 'SAVING' | 'DONE' | 'ERROR';

export interface AbstractGrillArchetype {
  name: string;
  description: string;
  signature: string;
  tradeoffs: string;
}

export interface AbstractGrillQuestion {
  id: string;
  topic: string;
  question: string;
  archetypes: AbstractGrillArchetype[];
  recommendation: {
    type: 'single' | 'hybrid';
    choice: string;
    rationale: string;
    hybridDetails?: string;
  };
  audit: {
    interfaceSurface: string;
    encapsulatedCapability: string;
    threeScenarioFit: string;
  };
  falsifier: string;
}

export interface AbstractGrillOptions {
  depth?: 'light_probe' | 'standard_drill' | 'deep_interrogation';
  configPath?: string;
  nonInteractive?: boolean;
  answers?: string[];
  outputTarget?: 'plan' | 'adr' | 'sidecar' | 'all';
  onStateChange?: (state: AbstractGrillState) => void;
}

export class AbstractGrillEngine {
  private state: AbstractGrillState = 'INIT';
  private onStateChange?: (state: AbstractGrillState) => void;

  constructor() {}

  /**
   * Retrieves the current state of the abstract grill state machine.
   */
  public getState(): AbstractGrillState {
    return this.state;
  }

  private transition(newState: AbstractGrillState): void {
    this.state = newState;
    if (this.onStateChange) {
      this.onStateChange(newState);
    }
  }

  /**
   * Executes the Abstract Grill state machine.
   * Evaluates deep modules, orthogonal paradigms, and hybrid synthesis.
   */
  public async grill(filePath: string, options: AbstractGrillOptions = {}): Promise<void> {
    this.onStateChange = options.onStateChange;
    this.transition('INIT');

    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      this.transition('ERROR');
      throw new Error(`File not found: ${filePath}`);
    }

    const config = loadConfig(options.configPath);
    const depth = options.depth || config.grill.default_depth || 'standard_drill';

    // 1. Parsing state
    this.transition('PARSING');
    const content = fs.readFileSync(resolvedPath, 'utf8');
    const parseResult = parseOkfSpec(content);

    let frontmatter: OkfFrontmatter | undefined;
    let body = content;
    let isSidecar = false;

    if (parseResult.isValid && parseResult.frontmatter) {
      frontmatter = parseResult.frontmatter;
      body = parseResult.body;
      isSidecar = Boolean(frontmatter.target_code_file);
    } else {
      // Fallback: simple frontmatter extraction or plain markdown
      const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      if (match) {
        try {
          frontmatter = (yaml.load(match[1]) as OkfFrontmatter) || undefined;
          body = match[2];
        } catch {
          body = content;
        }
      }
    }

    // 2. Generating Paradigms state
    this.transition('GENERATING_PARADIGMS');
    const questions = this.generateAbstractQuestions(filePath, frontmatter, body, depth);

    // 3. Grilling state
    this.transition('GRILLING');
    const answers: string[] = [];

    if (options.nonInteractive) {
      // Non-interactive automated mode
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const providedAnswer = options.answers && options.answers[i];
        if (providedAnswer) {
          answers.push(providedAnswer);
        } else {
          const defaultAns =
            q.recommendation.type === 'hybrid'
              ? `Adopt Hybrid: ${q.recommendation.choice}. ${q.recommendation.rationale} Details: ${q.recommendation.hybridDetails}`
              : `Adopt ${q.recommendation.choice}. ${q.recommendation.rationale}`;
          answers.push(defaultAns);
        }
      }

      console.log(`\n=== STUBS ABSTRACT GRILL ENGINE [Depth: ${depth}] ===\n`);
      console.log(`Target: ${path.basename(filePath)}\n`);
      questions.forEach((q, idx) => {
        console.log(`--- Decision Q${idx + 1}: ${q.topic} ---`);
        console.log(`Question: ${q.question}\n`);
        q.archetypes.forEach((arch) => {
          console.log(`  - ${arch.name}: ${arch.description}`);
          console.log(`    Contract: ${arch.signature}`);
          console.log(`    Trade-offs: ${arch.tradeoffs}\n`);
        });
        console.log(`Recommendation: ${q.recommendation.choice} (${q.recommendation.type})`);
        console.log(`Rationale: ${q.recommendation.rationale}`);
        if (q.recommendation.hybridDetails) {
          console.log(`Hybrid Details: ${q.recommendation.hybridDetails}`);
        }
        console.log(`Falsifier: ${q.falsifier}`);
        console.log(`Resolution: ${answers[idx]}\n`);
      });
      console.log(`=== ABSTRACT GRILLING COMPLETED ===\n`);
    } else {
      // Interactive mode using readline
      const rl = readline.createInterface({
        input: process.stdin as any,
        output: process.stdout as any,
      });

      const askPrompt = (query: string): Promise<string> => {
        return new Promise((resolve) => {
          rl.question(`\n${query}\n> `, (ans) => {
            resolve(ans.trim());
          });
        });
      };

      console.log(`\n======================================================`);
      console.log(`   STUBS ABSTRACT GRILL ENGINE [Depth: ${depth}]`);
      console.log(`   Evaluating Abstraction Depth & Paradigms for: ${path.basename(filePath)}`);
      console.log(`======================================================\n`);

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        console.log(`\n------------------------------------------------------`);
        console.log(`Q${i + 1} — [${q.topic}]: ${q.question}`);
        console.log(`------------------------------------------------------`);
        console.log(`Orthogonal Paradigms:\n`);
        q.archetypes.forEach((arch, archIdx) => {
          const letter = String.fromCharCode(65 + archIdx);
          console.log(`${letter}. ${arch.name}`);
          console.log(`   Description: ${arch.description}`);
          console.log(`   Interface:   ${arch.signature}`);
          console.log(`   Trade-offs:  ${arch.tradeoffs}\n`);
        });
        console.log(`Recommendation: ${q.recommendation.choice}`);
        console.log(`Rationale: ${q.recommendation.rationale}`);
        if (q.recommendation.hybridDetails) {
          console.log(`Hybrid Details: ${q.recommendation.hybridDetails}`);
        }
        console.log(`Falsifier: ${q.falsifier}\n`);

        const promptText = `Select an option (A, B, C, Hybrid, or custom directive) [Default: Recommendation]`;
        const userChoice = await askPrompt(promptText);
        const resolvedAnswer = userChoice || `Adopt Recommendation: ${q.recommendation.choice}`;
        answers.push(resolvedAnswer);
      }

      rl.close();
    }

    // 4. Saving state
    this.transition('SAVING');

    // Build structured Abstract Grilling Deliberation markdown block
    let deliberationLog = `\n\n## Abstract Grilling Deliberation (${this.formatDepthName(depth)})\n\n`;
    deliberationLog += `**Date:** ${new Date().toLocaleDateString()}  \n`;
    deliberationLog += `**Depth:** ${depth}  \n\n`;

    questions.forEach((q, idx) => {
      deliberationLog += `### Q${idx + 1} [${q.id}] — ${q.topic}\n\n`;
      deliberationLog += `**Core Question:** ${q.question}\n\n`;
      deliberationLog += `**Orthogonal Options:**\n\n`;
      q.archetypes.forEach((arch, archIdx) => {
        const letter = String.fromCharCode(65 + archIdx);
        deliberationLog += `- **Option ${letter} (${arch.name})**:\n`;
        deliberationLog += `  - *Concept:* ${arch.description}\n`;
        deliberationLog += `  - *Interface:* \`${arch.signature}\`\n`;
        deliberationLog += `  - *Trade-offs:* ${arch.tradeoffs}\n\n`;
      });
      deliberationLog += `**Recommendation:** ${q.recommendation.choice} (${q.recommendation.type})\n`;
      deliberationLog += `- **Rationale:** ${q.recommendation.rationale}\n`;
      if (q.recommendation.hybridDetails) {
        deliberationLog += `- **Hybrid Synthesis:** ${q.recommendation.hybridDetails}\n`;
      }
      deliberationLog += `- **Falsifier:** ${q.falsifier}\n\n`;
      deliberationLog += `**Depth & Reusability Audit:**\n`;
      deliberationLog += `- *Interface Surface:* ${q.audit.interfaceSurface}\n`;
      deliberationLog += `- *Encapsulated Capability:* ${q.audit.encapsulatedCapability}\n`;
      deliberationLog += `- *Three-Scenario Fit:* ${q.audit.threeScenarioFit}\n\n`;
      deliberationLog += `**Settled Resolution:** ${answers[idx]}\n\n`;
    });

    // Update target file
    let updatedContent: string;
    if (frontmatter) {
      if (isSidecar) {
        const notes = frontmatter.user_notes || [];
        const timestamp = new Date().toISOString();
        questions.forEach((q, idx) => {
          notes.push({
            id: `NOTE-ABSTRACT-GRILL-${Date.now()}-${idx}`,
            timestamp,
            text: `Abstract Q: ${q.topic} | Decision: ${answers[idx]}`,
            status: 'resolved',
          });
        });
        frontmatter.user_notes = notes;
        frontmatter.status = 'spec';
      }

      const updatedBody = body + deliberationLog;
      updatedContent = `---\n${yaml.dump(frontmatter).trim()}\n---\n${updatedBody}`;
    } else {
      updatedContent = body + deliberationLog;
    }

    fs.writeFileSync(resolvedPath, updatedContent, 'utf8');

    // Handle optional ADR output generation if requested
    if (options.outputTarget === 'adr' || options.outputTarget === 'all') {
      this.generateAdrArtifact(resolvedPath, questions, answers);
    }

    // Re-index sidecar or doc through GraphEngine if graph database exists
    try {
      const graphEngine = new GraphEngine(config.paths.db_path);
      await graphEngine.initialize();
      if (frontmatter && isSidecar) {
        await graphEngine.upsertSidecar({
          filePath: path.relative(process.cwd(), resolvedPath).replace(/\\/g, '/'),
          frontmatter,
          body: body + deliberationLog,
        });
      }
      await graphEngine.close();
    } catch {
      // Ignore database indexing failure
    }

    // 5. Done state
    this.transition('DONE');
    if (!options.nonInteractive) {
      console.log(`\n✔ Abstract grilling completed successfully! Deliberation recorded.`);
      console.log(`======================================================\n`);
    }
  }

  private generateAbstractQuestions(
    filePath: string,
    frontmatter: OkfFrontmatter | undefined,
    body: string,
    depth: 'light_probe' | 'standard_drill' | 'deep_interrogation',
  ): AbstractGrillQuestion[] {
    const fileName = path.basename(filePath, path.extname(filePath));
    const entityName = frontmatter?.title || fileName;
    const questions: AbstractGrillQuestion[] = [];

    // Question 1: Core Paradigm Archetype & Abstraction Boundary
    questions.push({
      id: 'PARADIGM-01',
      topic: 'Core Architectural Paradigm & Interface Boundary',
      question: `What fundamental conceptual paradigm should govern "${entityName}" to provide wide capabilities through a narrow interface?`,
      archetypes: [
        {
          name: 'Declarative Engine',
          description:
            'Callers submit pure intent or configuration schemas. The engine compiles and executes plans internally.',
          signature: 'execute(intent: IntentSchema): Promise<Result>',
          tradeoffs:
            'Maximum caller simplicity and high optimization freedom; internal planner has higher complexity.',
        },
        {
          name: 'Reactive Dataflow Pipeline',
          description:
            'Data flows through composable unidirectional transform stages with clear boundary invariants.',
          signature: 'pipe(source: Stream<In>): Stream<Out>',
          tradeoffs:
            'Excellent stream throughput and auditability; harder to implement bidirectional error recovery.',
        },
        {
          name: 'Autonomous State Machine Runtime',
          description:
            'State transitions are explicitly encapsulated in a finite state machine that guards invariants.',
          signature: 'dispatch(transition: Event): State',
          tradeoffs:
            'Rigid determinism and zero illegal states; requires explicit modeling for each transition.',
        },
      ],
      recommendation: {
        type: 'hybrid',
        choice: 'Hybrid Synthesis: Declarative Schema Interface + Autonomous State Machine Core',
        rationale:
          'A declarative public contract gives the caller a narrow interface, while the internal state machine provides wide capability and strict invariant safety.',
        hybridDetails:
          'Expose a single declarative `execute(intent)` entry point. Internally compile intent into explicit state machine transitions.',
      },
      audit: {
        interfaceSurface: 'Single declarative entry point with zero leaky internal methods.',
        encapsulatedCapability:
          'Handles validation, lifecycle state transitions, error isolation, and persistence internally.',
        threeScenarioFit:
          '1. Direct programmatic invocation 2. Batch workflow orchestration 3. Headless CI runner.',
      },
      falsifier:
        'If the caller must control the exact sequencing of internal steps in real time, a pipeline or builder is necessary.',
    });

    // Question 2: Information Hiding & Leaky Abstraction Elimination
    questions.push({
      id: 'DEPTH-02',
      topic: 'Information Hiding & Storage Decoupling',
      question: `How does "${entityName}" hide internal data storage, transport protocols, and sequencing from consumers?`,
      archetypes: [
        {
          name: 'Opaque Handle / Capability Broker',
          description:
            'Callers receive opaque session or resource handles without access to underlying storage or buffers.',
          signature: 'acquireSession(config): SessionHandle',
          tradeoffs:
            'Completely hides storage and network substrates; requires handle lifecycle cleanup.',
        },
        {
          name: 'Repository / Data Gateway Protocol',
          description:
            'Decouples caller contracts from storage through a strict abstract repository protocol.',
          signature: 'find(filter: QueryFilter): Promise<DomainEntity>',
          tradeoffs:
            'Easy to mock and swap substrates; can produce shallow abstraction wrappers if queries leak.',
        },
        {
          name: 'Event-Sourced Projection Engine',
          description:
            'State changes are written as immutable append-only events, and queries read read-optimized projections.',
          signature: 'record(event: DomainEvent): void',
          tradeoffs:
            'Total historical auditability and zero write contention; eventual consistency overhead.',
        },
      ],
      recommendation: {
        type: 'single',
        choice: 'Option A: Opaque Handle / Capability Broker',
        rationale:
          'Hides all internal state and engine dependencies behind a narrow capability token, guaranteeing storage decoupling.',
      },
      audit: {
        interfaceSurface: 'Opaque handle with minimal verb methods.',
        encapsulatedCapability: 'Hides whether data lives in memory, SQLite, or network sockets.',
        threeScenarioFit:
          '1. Local in-memory testing 2. Single-node SQLite operation 3. Remote client session.',
      },
      falsifier:
        'If callers require direct low-level raw SQL query access, an opaque handle is overly restrictive.',
    });

    if (depth === 'standard_drill' || depth === 'deep_interrogation') {
      // Question 3: The Three-Scenario Generalization Test
      questions.push({
        id: 'GENERALIZATION-03',
        topic: 'Three-Scenario Generalization Test',
        question: `How does "${entityName}" resolve classes of problems across multiple distinct domains without modifying its public contract?`,
        archetypes: [
          {
            name: 'Algebraic Core Primitives',
            description:
              'Reduces system operations to 2-3 irreducible mathematical primitives (e.g. read, write, transform).',
            signature: 'apply(op: PrimitiveOperation): OperationResult',
            tradeoffs:
              'Infinitely reusable and mathematically sound; steep learning curve for callers.',
          },
          {
            name: 'Pluggable Middleware Extension Bus',
            description:
              'Keeps the core kernel minimal while delegating scenario-specific logic to pipeline interceptors.',
            signature: 'use(plugin: Middleware): void',
            tradeoffs:
              'Highly extensible across scenarios; order-dependent middleware chains can introduce subtle bugs.',
          },
          {
            name: 'Context-Specialized Strategy Dispatcher',
            description:
              'Exposes a unified contract that selects internal strategy implementations via ambient context.',
            signature: 'resolveStrategy(ctx: Context): StrategyExecution',
            tradeoffs:
              'Clean separation of operational modes; strategy combinatorial explosion if uncontrolled.',
          },
        ],
        recommendation: {
          type: 'hybrid',
          choice: 'Hybrid Synthesis: Algebraic Core with Context-Aware Middleware Hooks',
          rationale:
            'A small algebraic core provides mathematical reusability, while middleware hooks allow custom domain integrations.',
          hybridDetails:
            'Core operations stay invariant. Scenario variations attach as pre/post middleware hooks without modifying the core.',
        },
        audit: {
          interfaceSurface:
            'Core interface exposes only primitive dispatch and plugin registration.',
          encapsulatedCapability:
            'Orchestrates plugin execution order, context propagation, and error containment.',
          threeScenarioFit:
            '1. Command-line single executions 2. Interactive user sessions 3. Server daemon background tasks.',
        },
        falsifier:
          'If plugin order creates non-deterministic side effects, a monolithic declarative engine is required.',
      });
    }

    if (depth === 'deep_interrogation') {
      // Question 4: Concurrency, Invariants & Blast Radius
      questions.push({
        id: 'INVARIANTS-04',
        topic: 'Concurrency Model & Invariant Protection',
        question: `How does "${entityName}" enforce invariant guarantees under concurrent execution and structural refactoring?`,
        archetypes: [
          {
            name: 'Immutable Data Flow & Copy-On-Write',
            description:
              'All domain entities are immutable. Modifications produce new snapshots via copy-on-write.',
            signature: 'update(state: ImmutableState, action): ImmutableState',
            tradeoffs:
              'Completely eliminates race conditions and locking; higher memory garbage collection pressure.',
          },
          {
            name: 'Actor Model / Single-Threaded Fiber Queue',
            description:
              'Serializes all state mutations through an internal actor mailbox or task queue.',
            signature: 'send(msg: MailboxMessage): Promise<Response>',
            tradeoffs:
              'Eliminates lock contention while allowing high concurrency; asynchronous messaging adds latency.',
          },
          {
            name: 'Optimistic Concurrency with MVCC Revision Tokens',
            description:
              'Mutations attach revision structural hashes. Conflicts reject with retryable errors.',
            signature: 'commit(mutation: Mutation, revision: string): CommitResult',
            tradeoffs:
              'Optimal for low-conflict workloads; requires caller retry policies on high contention.',
          },
        ],
        recommendation: {
          type: 'single',
          choice: 'Option A: Immutable Data Flow & Copy-On-Write',
          rationale:
            'Eliminates all race conditions at the architectural root while ensuring snapshot reproducibility.',
        },
        audit: {
          interfaceSurface: 'Zero public locking or synchronization APIs.',
          encapsulatedCapability:
            'Preserves historical state snapshots for instantaneous rollback or undo.',
          threeScenarioFit:
            '1. Multi-threaded background tasks 2. Fast speculative dry-runs 3. State rehydration.',
        },
        falsifier:
          'If memory throughput constraints prohibit snapshot allocations, an actor mailbox queue is superior.',
      });
    }

    return questions;
  }

  private generateAdrArtifact(
    sourceFile: string,
    questions: AbstractGrillQuestion[],
    answers: string[],
  ): string {
    const adrDir = path.resolve('knowledge/architecture/ADR');
    fs.mkdirSync(adrDir, { recursive: true });

    const baseName = path.basename(sourceFile, path.extname(sourceFile));
    const timestamp = new Date().toISOString().slice(0, 10);
    const adrId = `ADR-${Date.now().toString().slice(-4)}`;
    const adrFileName = `${adrId}-${baseName}-abstract-design.md`;
    const adrPath = path.join(adrDir, adrFileName);

    let adrContent = `# ${adrId}: Abstract Architecture Decisions for ${baseName}\n\n`;
    adrContent += `**Date:** ${timestamp}  \n`;
    adrContent += `**Status:** Accepted  \n`;
    adrContent += `**Source Document:** [${path.basename(sourceFile)}](${path.relative(adrDir, sourceFile)})\n\n`;

    adrContent += `## Context & Problem Statement\n\n`;
    adrContent += `During the abstract grilling session for \`${baseName}\`, we stress-tested high-level conceptual paradigms, interface widths, and deep module capabilities to ensure general reusability.\n\n`;

    adrContent += `## Decision Matrix\n\n`;
    questions.forEach((q, idx) => {
      adrContent += `### ${q.topic}\n\n`;
      adrContent += `**Core Question:** ${q.question}\n\n`;
      adrContent += `**Evaluated Paradigms:**\n`;
      q.archetypes.forEach((arch, archIdx) => {
        const letter = String.fromCharCode(65 + archIdx);
        adrContent += `- **${letter}. ${arch.name}:** ${arch.description} (\`${arch.signature}\`)\n`;
      });
      adrContent += `\n**Settled Decision:** ${answers[idx]}\n`;
      adrContent += `**Falsifier:** ${q.falsifier}\n\n`;
    });

    adrContent += `## Consequences & Invariants\n\n`;
    adrContent += `- The public contract remains narrow, while the internal capability is deep.\n`;
    adrContent += `- Implementation details (storage substrate, concurrency mechanism) remain encapsulated.\n`;
    adrContent += `- Abstract designs survive refactoring and satisfy the Three-Scenario Generalization Test.\n`;

    fs.writeFileSync(adrPath, adrContent, 'utf8');
    console.log(`\n📄 Generated Architecture Decision Record: ${adrPath}`);
    return adrPath;
  }

  private formatDepthName(depth: string): string {
    return depth
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
}
