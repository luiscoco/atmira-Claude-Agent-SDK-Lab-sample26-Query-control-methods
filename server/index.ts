import express from "express";
import { concept01 } from "./concepts/01-query.js";
import { concept02 } from "./concepts/02-options.js";
import { concept03 } from "./concepts/03-tools.js";
import { concept04 } from "./concepts/04-permissions.js";
import { concept05 } from "./concepts/05-custom-tools.js";
import { concept06 } from "./concepts/06-sessions.js";
import { concept07 } from "./concepts/07-hooks.js";
import { concept08 } from "./concepts/08-subagents.js";
import { concept09 } from "./concepts/09-system-prompts.js";
import { concept10 } from "./concepts/10-structured-interrupt.js";
import { concept11 } from "./concepts/11-skills.js";
import { concept12 } from "./concepts/12-streaming-input.js";
import { concept13 } from "./concepts/13-mcp-servers.js";
import { concept14 } from "./concepts/14-thinking-effort-models.js";
import { concept15 } from "./concepts/15-cost-usage.js";
import { concept16 } from "./concepts/16-settings-env.js";
import { concept17 } from "./concepts/17-checkpointing.js";
import { concept18 } from "./concepts/18-sandbox.js";
import { concept19 } from "./concepts/19-session-management.js";
import { concept20 } from "./concepts/20-hooks-in-depth.js";
import { concept21 } from "./concepts/21-slash-commands.js";
import { concept22 } from "./concepts/22-claude-md-memory.js";
import { concept23 } from "./concepts/23-plugins.js";
import { concept24 } from "./concepts/24-harnesses.js";
import { concept25 } from "./concepts/25-compaction-context.js";
import { concept26 } from "./concepts/26-query-control.js";

const app = express();
// 10mb instead of the default 100kb: Concept 12 sends images as base64 inside the JSON body.
app.use(express.json({ limit: "10mb" }));

// One router per concept: /api/c1/..., /api/c2/..., etc.
app.use("/api/c1", concept01);
app.use("/api/c2", concept02);
app.use("/api/c3", concept03);
app.use("/api/c4", concept04);
app.use("/api/c5", concept05);
app.use("/api/c6", concept06);
app.use("/api/c7", concept07);
app.use("/api/c8", concept08);
app.use("/api/c9", concept09);
app.use("/api/c10", concept10);
app.use("/api/c11", concept11);
app.use("/api/c12", concept12);
app.use("/api/c13", concept13); // also serves the "inventory" MCP server on /api/c13/mcp
app.use("/api/c14", concept14);
app.use("/api/c15", concept15);
app.use("/api/c16", concept16);
app.use("/api/c17", concept17);
app.use("/api/c18", concept18);
app.use("/api/c19", concept19);
app.use("/api/c20", concept20);
app.use("/api/c21", concept21);
app.use("/api/c22", concept22);
app.use("/api/c23", concept23);
app.use("/api/c24", concept24);
app.use("/api/c25", concept25);
app.use("/api/c26", concept26);

app.listen(3001, () => {
  console.log("Agent SDK server on http://localhost:3001");
  // ANTHROPIC_API_KEY comes from .env (loaded by `--env-file-if-exists` in package.json).
  // The SDK passes process.env to the Claude Code process, so no code is needed to use it.
  const key = process.env.ANTHROPIC_API_KEY;
  console.log(key ? `Auth: ANTHROPIC_API_KEY from .env (${key.slice(0, 10)}…${key.slice(-4)})` : "Auth: no API key, using Claude Code login");
});
