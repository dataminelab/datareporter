import fs from "fs";
import path from "path";
import { SourceMapConsumer } from "source-map";

type BundleLineMapping = {
  buildFile: string;
  buildLine: number;
};

type ParsedFrame = {
  full: string;
  prefix: string;
  filePath: string;
  line: number;
  col?: number;
  suffix: string;
};

const EXPORT_FUNCTION_RE = /^export function ([\w$]+)\(/;
const EXPORT_VAR_RE = /^export var ([\w$]+) =/;
const EXPORT_NAMED_RE = /^export \{ ([\w$]+) \};$/;
const SOURCE_MAP_TOKEN_RE = /\/\/# sourceMappingURL=[^\s]*\.map/g;
const PLYWOOD_FRAME_RE =
  /^(.*?)(\/client\/build\/plywood\.js):(\d+)(?::(\d+))?(.*)$/;

let bundleLineMapCache: BundleLineMapping[] | null = null;
const sourceMapCache = new Map<string, SourceMapConsumer>();

function getClientDir(): string {
  return path.resolve(__dirname, "../../client");
}

function getRrollupPath(): string {
  return path.resolve(getClientDir(), "rrollup");
}

function extractConcatBuildFiles(rrollupContent: string): string[] {
  const lines = rrollupContent.split(/\r?\n/);
  const result: string[] = [];
  let inCatBlock = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!inCatBlock) {
      if (line === "cat \\") {
        inCatBlock = true;
      }
      continue;
    }

    if (line.startsWith("|")) break;
    if (!line.endsWith("\\")) continue;

    const candidate = line.slice(0, -1).trim();
    if (!candidate || !candidate.endsWith(".js")) continue;
    result.push(candidate);
  }

  return result;
}

function transformLine(rawLine: string): string | null {
  const withoutSourceMapToken = rawLine.replace(SOURCE_MAP_TOKEN_RE, "");
  if (withoutSourceMapToken.startsWith("import ")) return null;

  return withoutSourceMapToken
    .replace(EXPORT_FUNCTION_RE, "var $1 = exports.$1 = function(")
    .replace(EXPORT_VAR_RE, "var $1 = exports.$1 =")
    .replace(EXPORT_NAMED_RE, "exports.$1 = $1;");
}

function getBundleLineMap(): BundleLineMapping[] {
  if (bundleLineMapCache) return bundleLineMapCache;

  const rrollupPath = getRrollupPath();
  if (!fs.existsSync(rrollupPath)) {
    bundleLineMapCache = [];
    return bundleLineMapCache;
  }

  const rrollup = fs.readFileSync(rrollupPath, "utf8");
  const files = extractConcatBuildFiles(rrollup);
  const map: BundleLineMapping[] = [];
  const clientDir = getClientDir();

  for (const relPath of files) {
    const absPath = path.resolve(clientDir, relPath);
    if (!fs.existsSync(absPath)) continue;

    const content = fs.readFileSync(absPath, "utf8");
    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const transformed = transformLine(lines[i]);
      if (transformed === null) continue;

      const generatedLines = transformed.split(/\r?\n/).length;
      for (let j = 0; j < generatedLines; j++) {
        map.push({ buildFile: relPath, buildLine: i + 1 });
      }
    }
  }

  bundleLineMapCache = map;
  return map;
}

function parseFrame(line: string): ParsedFrame | null {
  const match = line.match(PLYWOOD_FRAME_RE);
  if (!match) return null;

  const frameLine = Number(match[3]);
  const frameCol = match[4] ? Number(match[4]) : undefined;
  if (!Number.isFinite(frameLine)) return null;

  return {
    full: line,
    prefix: match[1],
    filePath: match[2],
    line: frameLine,
    col: Number.isFinite(frameCol as number) ? frameCol : undefined,
    suffix: match[5] || "",
  };
}

function getOriginalPosition(
  consumer: SourceMapConsumer,
  line: number,
  column?: number,
): { source: string | null; line: number | null; column: number | null } {
  const zeroBasedColumn = Math.max((column || 1) - 1, 0);

  const attempts = [
    // Prefer the specific stack-frame column.
    { line, column: zeroBasedColumn },
    // Fall back to start-of-line lookups.
    { line, column: 0 },
  ];

  for (const attempt of attempts) {
    const pos = consumer.originalPositionFor(attempt);
    if (pos.source && pos.line) return pos;
  }

  // Last resort: ask for nearest mappings on either side.
  const lowerBound = consumer.originalPositionFor({
    line,
    column: zeroBasedColumn,
    bias: SourceMapConsumer.GREATEST_LOWER_BOUND,
  });
  if (lowerBound.source && lowerBound.line) return lowerBound;

  return consumer.originalPositionFor({
    line,
    column: zeroBasedColumn,
    bias: SourceMapConsumer.LEAST_UPPER_BOUND,
  });
}

async function getSourceMapConsumerFor(
  buildRelPath: string,
): Promise<SourceMapConsumer | null> {
  const clientDir = getClientDir();
  const mapPath = path.resolve(clientDir, `${buildRelPath}.map`);

  if (!fs.existsSync(mapPath)) return null;
  const cached = sourceMapCache.get(mapPath);
  if (cached) return cached;

  const rawMap = fs.readFileSync(mapPath, "utf8");
  const consumer = await new SourceMapConsumer(JSON.parse(rawMap));
  sourceMapCache.set(mapPath, consumer);
  return consumer;
}

async function remapPlywoodFrame(frame: ParsedFrame): Promise<string> {
  const bundleMap = getBundleLineMap();
  const bundleEntry = bundleMap[frame.line - 1];
  if (!bundleEntry) return frame.full;

  const consumer = await getSourceMapConsumerFor(bundleEntry.buildFile);
  if (!consumer) return frame.full;

  const pos = getOriginalPosition(consumer, bundleEntry.buildLine, frame.col);

  if (!pos.source || !pos.line) return frame.full;

  const sourcePath = pos.source
    .replace(/^\//, "")
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "");

  const mappedPath = path.posix.normalize(`/client/${sourcePath}`);
  const mappedCol = typeof pos.column === "number" ? `:${pos.column + 1}` : "";

  return `${frame.prefix}${mappedPath}:${pos.line}${mappedCol}${frame.suffix}`;
}

export async function remapPlywoodBundleStack(
  stack?: string,
): Promise<string | undefined> {
  if (!stack) return stack;

  const lines = stack.split("\n");
  const remapped = await Promise.all(
    lines.map(async line => {
      const frame = parseFrame(line);
      if (!frame) return line;
      return remapPlywoodFrame(frame);
    }),
  );

  return remapped.join("\n");
}
