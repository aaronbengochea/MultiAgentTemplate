# Coding Agent MVP Phased Implementation Plan

## Purpose

Build a CLI-first coding-agent MVP in **Python** using:

- **LangChain** for model/tool abstractions
- **LangGraph** for stateful orchestration
- **DynamoDB Local** via **Docker Compose**
- **Git worktrees** for per-run repo isolation
- deterministic validation gates:
  - type checking
  - unit tests

The plan is structured so that:

- each **subphase is small enough to be its own commit/push**
- lint, type checks, and tests are introduced early
- the resulting system is easy to review and extend
- the architecture stays aligned with future AWS deployment

---

# Locked architectural decisions

## Interface
- CLI-first
- one command submits one job
- one job maps to one LangGraph execution
- one execution maps to one worktree

## Persistence
- DynamoDB Local for MVP
- Docker Compose-managed local infra
- design tables with future AWS DynamoDB in mind

## Orchestration
- LangGraph for workflow runtime
- LangChain for model/tool abstraction
- deterministic steps wrap bounded LLM usage

## Retrieval
- no Pinecone / vector DB / hybrid RAG in MVP
- use deterministic repo context:
  - file tree inspection
  - lexical search
  - local rules
  - requested path scoping
  - validation error feedback

## Execution model
- one run = one worktree
- isolated runtime seam preserved from the start
- deterministic checks are mandatory

---

# Proposed MVP graph

## Nodes
1. `submit_job`
2. `prepare_workspace`
3. `collect_context`
4. `plan_change`
5. `apply_patch`
6. `run_typecheck`
7. `run_unit_tests`
8. `summarize_outcome`

## Routing
- `submit_job -> prepare_workspace`
- `prepare_workspace -> collect_context`
- `collect_context -> plan_change`
- `plan_change -> apply_patch`
- `apply_patch -> run_typecheck`
- if typecheck passes -> `run_unit_tests`
- if typecheck fails and retry remains -> back to `apply_patch`
- if typecheck fails and retry exhausted -> `summarize_outcome`
- if unit tests pass -> `summarize_outcome`
- if unit tests fail and retry remains -> back to `apply_patch`
- if unit tests fail and retry exhausted -> `summarize_outcome`

## Retry policy
- maximum one repair loop for the initial MVP

---

# DynamoDB MVP table strategy

## `agent_jobs`
Stores top-level job metadata.

Suggested fields:
- `job_id`
- `repo_name`
- `base_branch`
- `title`
- `task`
- `status`
- `created_at`
- `updated_at`
- `latest_run_id`
- `requested_paths`
- `issue_ref`
- `terminal_summary`

## `agent_runs`
Stores execution/run state.

Suggested fields:
- `run_id`
- `job_id`
- `status`
- `current_node`
- `retry_count`
- `worktree_path`
- `branch_name`
- `started_at`
- `updated_at`
- `ended_at`
- `typecheck_status`
- `unit_test_status`
- `patch_summary`
- `failure_summary`

## `agent_artifacts`
Stores pointers and metadata for logs, patch outputs, validation summaries.

Suggested fields:
- `artifact_id`
- `run_id`
- `job_id`
- `artifact_type`
- `path`
- `content_type`
- `created_at`
- `metadata`

---

# Global standards

## Python
- Python 3.12
- full type hints
- explicit service boundaries
- avoid clever abstractions

## Tooling
- `ruff`
- `mypy` or `pyright`
- `pytest`

## Commit discipline
Each subphase should:
- be one bounded concern
- pass lint
- pass type checks
- pass tests relevant to that change

---

# Phase 1 — Repository foundation and local environment

## Phase 1.1 — Initialize repo and Python skeleton
Create:
- `pyproject.toml`
- `app/` package layout
- `tests/`
- `.gitignore`
- `README.md`
- `Makefile`

Deliverable:
- project structure compiles/imports cleanly

Tests:
- placeholder pytest run works
- lint/typecheck commands run

Suggested commit:
- `chore: initialize python project structure and tooling scaffold`

## Phase 1.2 — Add linting, typing, testing config
Add:
- `ruff` config
- `mypy` or `pyright` config
- `pytest` config
- make targets:
  - `make lint`
  - `make typecheck`
  - `make test`
  - `make check`

Tests:
- one trivial test
- `make check` passes

Suggested commit:
- `chore: configure linting type checking and test commands`

## Phase 1.3 — Add Docker Compose with DynamoDB Local
Add:
- `docker-compose.yml`
- `.env.example`
- make targets:
  - `make infra-up`
  - `make infra-down`
  - `make infra-logs`

Tests:
- smoke check that local DynamoDB is reachable

Suggested commit:
- `chore: add docker compose for dynamodb local`

## Phase 1.4 — Add typed config loading
Create:
- `app/config/settings.py`

Config should include:
- environment
- DynamoDB endpoint
- AWS region
- table names
- workspace root
- model config placeholders

Tests:
- settings parsing tests
- defaults tests

Suggested commit:
- `feat: add typed application settings and local env loading`

---

# Phase 2 — Domain models and persistence layer

## Phase 2.1 — Define domain models and enums
Create:
- `app/domain/enums.py`
- `app/domain/models.py`
- `app/domain/errors.py`

Models:
- Job
- Run
- Artifact
- status enums
- validation enums
- terminal outcome enums

Tests:
- model validation tests
- enum tests

Suggested commit:
- `feat: add core domain models and status enums`

## Phase 2.2 — Add DynamoDB client and table constants
Create:
- `client.py`
- `tables.py`

Requirements:
- local endpoint support
- region support
- no hidden singletons

Tests:
- mocked client construction tests

Suggested commit:
- `feat: add dynamodb client factory and table definitions`

## Phase 2.3 — Add local table management scripts
Create:
- `scripts/create_local_tables.py`
- `scripts/delete_local_tables.py`

Make targets:
- `make db-create`
- `make db-delete`
- `make db-reset`

Tests:
- smoke test that tables are created

Suggested commit:
- `feat: add local dynamodb table management scripts`

## Phase 2.4 — Implement job repository
Methods:
- create job
- get job
- update status
- update latest run id
- write terminal summary

Tests:
- mocked unit tests
- local DynamoDB integration tests

Suggested commit:
- `feat: add agent job repository with local integration tests`

## Phase 2.5 — Implement run repository
Methods:
- create run
- get run
- update current node
- update status
- increment retry count
- write validation summaries
- finalize run

Tests:
- unit + integration

Suggested commit:
- `feat: add agent run repository with local integration tests`

## Phase 2.6 — Implement artifact repository
Methods:
- create artifact
- get artifact
- list artifacts by run

Tests:
- unit + integration

Suggested commit:
- `feat: add artifact repository with local integration tests`

---

# Phase 3 — CLI foundation

## Phase 3.1 — Add CLI entrypoint
Create:
- `app/cli/main.py`

Commands scaffold:
- `health`
- `jobs create`
- `jobs get`
- later `jobs run`

Tests:
- CLI registration and exit code tests

Suggested commit:
- `feat: add base cli entrypoint and command routing`

## Phase 3.2 — Add health command
`health` should check:
- config load
- DynamoDB reachability
- table presence

Tests:
- unit tests
- integration test for local infra

Suggested commit:
- `feat: add cli health command for local environment checks`

## Phase 3.3 — Add job create/get commands
`jobs create` inputs:
- repo name
- base branch
- title
- task
- optional paths
- optional issue ref

Tests:
- CLI parsing tests
- integration persistence tests

Suggested commit:
- `feat: add cli job create and get commands`

---

# Phase 4 — Workspace management with Git worktrees

## Phase 4.1 — Add shell execution abstraction
Create:
- `runtime/shell.py`

Should return:
- stdout
- stderr
- exit code

Tests:
- success and failure execution tests

Suggested commit:
- `feat: add typed shell execution abstraction`

## Phase 4.2 — Add workspace filesystem helpers
Create:
- `runtime/filesystem.py`

Responsibilities:
- workspace root resolution
- worktree path generation
- artifact path generation

Tests:
- deterministic path tests

Suggested commit:
- `feat: add workspace filesystem path helpers`

## Phase 4.3 — Add Git worktree service
Create:
- `runtime/worktrees.py`

Methods:
- validate repo path
- create branch name
- create worktree
- inspect worktree
- remove worktree

Tests:
- fixture repo integration tests

Suggested commit:
- `feat: add git worktree runtime service with fixture repo tests`

## Phase 4.4 — Add run preparation service
Behavior:
- create Run record
- create worktree
- persist worktree path and branch name

Tests:
- integration test from Job -> Run -> worktree

Suggested commit:
- `feat: add run preparation service linking jobs to worktrees`

---

# Phase 5 — Retrieval-light context assembly

## Phase 5.1 — Add file tree inspection
Create:
- `retrieval/file_tree.py`

Capabilities:
- walk repo
- ignore filtered paths
- summarize top-level structure
- return candidate files

Tests:
- fixture repo unit tests

Suggested commit:
- `feat: add repository file tree inspection utilities`

## Phase 5.2 — Add lexical search
Create:
- `retrieval/lexical_search.py`

Capabilities:
- exact string search
- multi-query terms
- path filtering
- line-numbered results

Tests:
- fixture repo tests

Suggested commit:
- `feat: add lexical repository search utility`

## Phase 5.3 — Add local rules loader
Create:
- `retrieval/rules.py`

Capabilities:
- root rules
- optional path-specific rules
- deterministic merge precedence

Tests:
- rule discovery and precedence tests

Suggested commit:
- `feat: add repository rules loader for agent instructions`

## Phase 5.4 — Add context builder
Create:
- `retrieval/context_builder.py`

Inputs:
- job task
- requested paths
- repo summary
- relevant files
- lexical hits
- rules

Tests:
- unit tests
- integration context assembly test

Suggested commit:
- `feat: add deterministic context builder for coding jobs`

---

# Phase 6 — LLM integration and prompt layer

## Phase 6.1 — Add LLM factory
Create:
- `llm/factory.py`

Requirements:
- one provider only to start
- easy to mock

Tests:
- mocked provider construction tests

Suggested commit:
- `feat: add llm provider factory and typed configuration`

## Phase 6.2 — Add planning and patch prompts
Create:
- `llm/prompts/planning.md`
- `llm/prompts/patching.md`
- optional `repair.md`

Requirements:
- structured outputs
- path constraints respected
- validation feedback supported

Tests:
- prompt rendering tests
- snapshot tests acceptable

Suggested commit:
- `feat: add structured planning and patching prompts`

## Phase 6.3 — Implement planning service
Behavior:
- context in
- typed plan out

Tests:
- mocked LLM tests
- malformed output rejection tests

Suggested commit:
- `feat: add llm-backed planning service with typed outputs`

## Phase 6.4 — Implement patch generation service
Behavior:
- context + plan + optional validation feedback in
- typed patch proposal out

Tests:
- mocked LLM tests
- output schema validation tests

Suggested commit:
- `feat: add llm-backed patch generation service`

---

# Phase 7 — Patch application and validation

## Phase 7.1 — Add structured patch application
Behavior:
- modify existing files
- create new files
- enforce worktree-only writes

Tests:
- unit tests
- fixture repo integration tests

Suggested commit:
- `feat: add structured patch application service`

## Phase 7.2 — Add typecheck runner
Create:
- `validation/typecheck.py`

Requirements:
- execute in worktree
- capture stdout/stderr/exit code
- normalize results

Tests:
- parsing tests
- fixture repo integration test

Suggested commit:
- `feat: add deterministic typecheck validation runner`

## Phase 7.3 — Add unit test runner
Create:
- `validation/unit_tests.py`

Requirements:
- execute in worktree
- normalize results
- one configured command initially

Tests:
- parsing + integration tests

Suggested commit:
- `feat: add deterministic unit test validation runner`

## Phase 7.4 — Persist validation artifacts
Persist:
- typecheck summary artifacts
- unit test summary artifacts
- run-level validation summaries

Tests:
- integration tests for artifact records

Suggested commit:
- `feat: persist validation summaries as run artifacts`

---

# Phase 8 — LangGraph state and nodes

## Phase 8.1 — Define graph state
Create:
- `orchestration/state.py`

State should include:
- `job_id`
- `run_id`
- `repo_name`
- `repo_path`
- `base_branch`
- `worktree_path`
- `branch_name`
- `task`
- `requested_paths`
- `context_summary`
- `plan`
- `patch_proposal`
- `typecheck_result`
- `unit_test_result`
- `retry_count`
- `max_retries`
- `status`
- `failure_summary`
- `artifacts`

Tests:
- state validation tests

Suggested commit:
- `feat: define langgraph state model for coding job runs`

## Phase 8.2 — Add `submit_job` and `prepare_workspace`
Requirements:
- load job metadata
- create/hydrate run
- create worktree
- update run metadata

Tests:
- mocked node tests
- integration for submit + prepare

Suggested commit:
- `feat: add submit and prepare workspace graph nodes`

## Phase 8.3 — Add `collect_context` and `plan_change`
Requirements:
- build deterministic context
- call planning service
- store typed plan

Tests:
- mocked planning tests
- real context build integration

Suggested commit:
- `feat: add context collection and planning graph nodes`

## Phase 8.4 — Add `apply_patch`
Requirements:
- call patch generator
- apply patch
- persist patch artifacts
- update run state

Tests:
- mocked LLM + patch application tests
- fixture repo integration

Suggested commit:
- `feat: add patch generation and application graph node`

## Phase 8.5 — Add validation nodes
Create:
- `run_typecheck.py`
- `run_unit_tests.py`

Tests:
- mocked validator tests
- fixture integration tests

Suggested commit:
- `feat: add typecheck and unit test graph nodes`

## Phase 8.6 — Add terminal summary node
Create:
- `summarize_outcome.py`

Requirements:
- finalize job/run status
- store terminal summary

Tests:
- success and failure tests

Suggested commit:
- `feat: add terminal summary graph node`

---

# Phase 9 — Assemble graph and expose it via CLI

## Phase 9.1 — Build graph wiring
Create:
- `orchestration/graph.py`

Requirements:
- conditional routing
- retry budget enforcement
- clear transition logging

Tests:
- routing tests
- graph compile test

Suggested commit:
- `feat: assemble mvp langgraph workflow with retry routing`

## Phase 9.2 — Add `jobs run`
Command:
- `jobs run --job-id <id>`

Behavior:
- load job
- invoke graph
- print progress
- print final status
- nonzero exit on failure

Tests:
- CLI tests with mocked orchestration
- integration smoke test with mocked LLM

Suggested commit:
- `feat: add cli command to execute coding job workflow`

## Phase 9.3 — Add first end-to-end happy-path test
Flow:
- create job
- run graph
- modify fixture repo
- pass typecheck and unit tests
- persist final status in DynamoDB

Tests:
- deterministic mocked LLM
- stable fixture repo

Suggested commit:
- `test: add end to end happy path workflow integration test`

---

# Phase 10 — Failure handling and observability

## Phase 10.1 — Add bounded repair loop
Requirements:
- one retry max
- validation feedback fed into patch regeneration
- retry artifacts persisted

Tests:
- integration test where first patch fails and second succeeds

Suggested commit:
- `feat: add bounded repair loop using validation feedback`

## Phase 10.2 — Add structured logging
Create:
- `utils/logging.py`

Include fields:
- `job_id`
- `run_id`
- `node`
- `status`

Tests:
- logger config tests
- smoke logging in end-to-end run

Suggested commit:
- `feat: add structured logging for job and run execution`

## Phase 10.3 — Persist prompt/patch/log artifacts
Persist:
- prompt summaries
- patch summaries
- log artifacts or log references

Tests:
- artifacts present after run

Suggested commit:
- `feat: persist execution artifacts for prompts patches and logs`

---

# Phase 11 — PR-preparation seam and AWS-aligned hardening

## Phase 11.1 — Add diff summary service
Behavior:
- changed files summary
- diff summary
- optional commit message suggestion

Tests:
- fixture diff tests

Suggested commit:
- `feat: add diff summary service for completed coding runs`

## Phase 11.2 — Add PR payload model
Prepare:
- title
- body
- changed files summary
- validation summary
- risk notes

Tests:
- payload rendering tests

Suggested commit:
- `feat: add pull request payload preparation models`

## Phase 11.3 — Add cleanup command
Behavior:
- clean stale worktrees
- clean stale local artifacts

Tests:
- integration cleanup tests

Suggested commit:
- `feat: add local cleanup command for stale worktrees and artifacts`

## Phase 11.4 — Document AWS migration seam
Document:
- DynamoDB Local -> managed DynamoDB
- local artifact storage -> S3
- local worker -> ECS/Fargate or EC2 worker
- CLI trigger -> Slack/API/queue trigger

Suggested commit:
- `docs: add aws migration guidance for local mvp architecture`

---

# Deferred follow-on phases

These are explicitly out of scope for MVP but should remain future-friendly:

- Slack trigger adapter
- human approval checkpoints
- per-run containerized execution
- multi-agent specialization / subgraphs
- hybrid retrieval
- GitHub/GitLab PR creation
- cloud-native queue-backed execution

---

# Definition of done for MVP

The MVP is complete when:

1. local infra starts with Docker Compose
2. DynamoDB Local tables are created with one command
3. a job can be created from CLI
4. a job can be run from CLI
5. a worktree is created for the run
6. deterministic repo context is assembled
7. the model produces a plan and patch proposal
8. the patch is applied only inside the worktree
9. typecheck and unit tests run deterministically
10. at most one repair attempt occurs
11. final state and artifacts are persisted
12. there is at least one happy-path integration test
13. there is at least one repair/failure-path integration test
14. `make check` passes locally

---

# Guidance for Claude Code

Claude Code should follow these implementation rules:

- do not skip ahead unless a dependency is trivial and required
- keep each subphase small and reviewable
- run lint, type checks, and tests after every subphase
- keep LangGraph nodes thin and service-oriented
- keep boto/DynamoDB logic inside repositories
- keep fixture repos tiny and deterministic
- mock LLMs in tests unless explicitly running a manual experiment
- do not add Slack, Pinecone, vector DBs, or multi-agent swarming during MVP unless the plan is amended
