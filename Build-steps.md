# Query control methods

This file describes the **steps followed** to add Concept 26 (**Query control methods**) to the Claude Agent SDK Lab:
what was read, what was decided, how it was tested, and what the tests changed. To learn the concept itself, read
[Tab26-Query-control-methods.md](Tab26-Query-control-methods.md).

| Concept | Topic | Routes | Explanation |
|---|---|---|---|
| 26 | The `Query` object as a remote control: ask (`initializationResult`, `supported*`, `accountInfo`, `readFile`…), steer (`setModel`, `setPermissionMode`), stop (`interrupt`, `backgroundTasks`, `stopTask`, `close`), and the `task_*` messages | `/api/c26/catalog`, `/open`, `/call`, `/code` | [Tab26-Query-control-methods.md](Tab26-Query-control-methods.md) |

## How to run it

```powershell
npm run dev        # server on http://localhost:3001, web on the Vite port
```

`node_modules` was copied from sample25, so `npm install` is not needed. Open the **26. Query control methods** tab.
`ANTHROPIC_API_KEY` must be in `.env`. Start it from a normal terminal, not from inside Claude Code (see Tab16).
Part A is free. Each Part B scenario costs under $0.03 (see Step 10 of the explanation).

> **Only one sample can run at a time.** Every sample's server uses port **3001**. Stop the other samples'
> `npm run dev` first.

## Step 1: Choose the feature

The request again said "implement the following feature sample" with no feature text. The topics left from last time
were offered (Query control methods, Background tasks), and the answer was **"Query control methods"**.

## Step 2: Copy the base and read what the course already said

`sample26` already held a copy of sample25 without `node_modules`, so `node_modules` was copied from sample25.

| Read | To learn |
|---|---|
| `Build-steps.md`, `Tab25-…md`, `25-compaction-context.ts`, `Concept25CompactionContext.tsx` | The latest style: `baseOptions`, `silent()`, `#region` + `/code`, scenarios, the doc format |
| `server/index.ts`, `server/sse.ts`, `src/lib/sse.ts`, `src/App.tsx`, `src/styles.css` | Mounting, SSE, tab list, CSS classes |
| grep of every `q.<method>(` in `server/concepts` | Which methods earlier tabs used: `interrupt` (10), `supportedCommands` (11), `setModel` / `setPermissionMode` (12), MCP methods (13), `applyFlagSettings` / `setMaxThinkingTokens` (14), `rewindFiles` (17), `initializationResult` / `supportedAgents` / `reloadPlugins` (23), `getContextUsage` (15, 22, 25) |

Each earlier use was a scripted side note. So the new material had to be: a **live** session driven from the
browser, the methods never used (`accountInfo`, `readFile`, `backgroundTasks`, `stopTask`, `close`), and what each
call causes in the message stream.

## Step 3: Check the types

In `sdk.d.ts` (`0.3.281`): the whole `Query` interface (about 35 methods), `SDKControlInterruptResponse`
(`still_queued`), `AccountInfo`, `SDKControlReadFileResponse`, `SDKControlInitializeResponse`, `PermissionMode`
(`default | acceptEdits | bypassPermissions | plan | dontAsk | auto`), and the `task_started` / `task_updated` /
`task_notification` / `status` system messages.

## Step 4: Probe before designing

Scratchpad scripts (`probe1` to `probe3`) ran real sessions:

| Probe | Result | Decision |
|---|---|---|
| Every read-only method on a silent session | First call 1.2 s, lists 0 ms (cached), `readFile` outside cwd → `null`, idle `interrupt()` → `{ still_queued: [] }`, `stopTask("nope")` → `undefined`, `accountInfo()` works after `close()` | Part A; Step 8 of the doc |
| `setModel()` on a string prompt | No error, but the model did not change | Documented only |
| `setModel` / `setPermissionMode` between turns | `<local-command-stdout>` user message, new `system/init`; `setModel(undefined)` = Opus (8× cost); `system/status` with `permissionMode`; `plan` writes a plan file into `CLAUDE_CONFIG_DIR/plans` | Scenarios 1 and 2; fake config dir |
| `interrupt()` during `sleep 30` | The Bash tool **refused** `sleep 30`, so the turn ended first and the probe hung | `slow.mjs`, allowed as `node slow.mjs N` |
| `interrupt` / `backgroundTasks` / `stopTask` / `close` with `slow.mjs` | Interrupt ends the turn only; a queued prompt still runs; stop → `killed` + `stopped`; `close()` ends the iterator quietly, then calls reject | Scenarios 3, 5, 6, 7 |
| `backgroundTasks()` at 1 s, 3 s, 6 s | Nothing until `task_started` (~3 s); after it, `is_backgrounded: true` and the tool returns at once | Scenario 4 waits for `task_started` |

## Step 5: Design the concept

- **Part A** (free): `/catalog` runs the "ask" methods on a silent session.
- **Part B**: a live session registry. `POST /open` (SSE) streams one session; `POST /call` runs one method from a
  zod-validated whitelist and also streams it as a `call` event, so calls appear between the messages they cause.
  Prompts go through a push queue (streaming input).
- **Scenarios** run in the browser as steps (`prompt`, `call`, `wait`), against the same console. The user can also
  click every method by hand.
- **Part C**: every method of `Query` and where the lab shows it.
- `#region` markers for `/code`: `canUseTool`, `options`, `methods`, `messages`.

## Step 6: Implement it

| File | What was done |
|---|---|
| `server/concepts/26-query-control.ts` | New: `control-lab/` (notes.txt, slow.mjs), `policy()`, `baseOptions`, `CONTROLS`, `/catalog`, `/open`, `/call`, `/code` |
| `server/index.ts` | Mounted on `/api/c26` |
| `src/concepts/Concept26QueryControl.tsx` | New: Parts A to C, the console, the scenario runner |
| `src/App.tsx`, `src/styles.css` | Tab; `.tag-call`, `.tool-call.call`, `.tool-call.task` |
| `.gitignore`, `Tab1-query().md` | `control-lab/`, table row |

`npx tsc --noEmit -p .` passed.

## Step 7: Test the routes

The server was started on port **3001** with `.env` loaded and the `CLAUDE*` variables removed (`node --import tsx`,
no watch). A scratchpad script (`drive.mjs`) read `/open` and ran the scenario steps the way the tab does.

| Test | Result |
|---|---|
| `/catalog` | 9 calls in 1.4 s, $0 |
| `/code` | regions `canUseTool`, `options`, `methods`, `messages` |
| `setModel("opus")`, extra key, `__proto__`, `toString`, `readFile(5)`, empty prompt, `stopTask({})`, unknown id, no method | refused, nothing ran |
| third session | `Already 2 live sessions` |
| scenarios 1 to 7 | as described in the explanation; $0.026 / $0.012 / $0.004 / $0.006 / $0.004 / $0.003 / <$0.002 |
| `dontAsk` (extra run) | Write and Bash denied without calling `canUseTool`; $0.008 |

## Step 8: What the tests changed

- **The end of a background task started a turn by itself.** Scenario 4 now waits for that extra `result`, and the
  explanation says so.
- **Background output in the real `%TEMP%\claude\`.** The test folder was deleted, and the lab now sets
  `CLAUDE_CODE_TMPDIR=control-lab/tmp`. A new run left nothing in the system temp folder.
- **Calls after `close()` were invisible.** The SSE response had already ended, and the server was still writing
  `call` events to it. `/call` now streams only while the session lives and returns `streamed: false` after; the
  tab adds those rows itself. Re-tested: `accountInfo()` answers, `setModel()` rejects with
  `Query closed before response received`.
- The scenario costs in the hints were corrected to the measured values.

## Step 9: Run it in the real app

Vite was started on port **5199** next to the server, and headless Edge was driven through the DevTools protocol
(`shot.mjs`): open the page, click tab 26, take a screenshot of Part A, click scenario 4, wait for it, take a second
screenshot. Part A showed the nine calls, the console showed 18 event rows (calls, task events, the automatic turn),
there was no error card and no console error.

Both processes were stopped and `control-lab/` was deleted.

Costs: about $0.45 for all the probes and test runs.

## Files added or changed

| File | Change |
|---|---|
| `server/concepts/26-query-control.ts` | New: the Concept 26 routes |
| `server/index.ts` | Mounts `/api/c26` |
| `src/concepts/Concept26QueryControl.tsx` | New: the Query control methods tab |
| `src/App.tsx` | Tab |
| `src/styles.css` | Control-call and task row styles |
| `.gitignore` | `control-lab/` |
| `Tab1-query().md` | Adds Concept 26 to the table |
| `Tab26-Query-control-methods.md` | Explanation of the concept |
| `Build-steps.md` | This file |
