"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const Concat = require("concat-with-sourcemaps");

const ROOT = path.resolve(__dirname, "..");
const RROLLUP_PATH = path.join(ROOT, "rrollup");
const BUILD_DIR = path.join(ROOT, "build");
const OUTPUT_JS = path.join(BUILD_DIR, "plywood.debug.js");
const OUTPUT_MAP = path.join(BUILD_DIR, "plywood.debug.js.map");

function extractConcatenationFiles() {
    const rrollup = fs.readFileSync(RROLLUP_PATH, "utf8");
    const lines = rrollup.split(/\r?\n/);
    const files = [];

    let inCatBlock = false;
    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!inCatBlock) {
            if (line === "cat \\") {
                inCatBlock = true;
            }
            continue;
        }

        if (line.startsWith("|")) {
            break;
        }

        if (!line) {
            continue;
        }

        const cleaned = line.endsWith("\\") ? line.slice(0, -1).trim() : line;
        if (cleaned) {
            files.push(cleaned);
        }
    }

    if (!files.length) {
        throw new Error("Could not extract file list from rrollup");
    }

    return files;
}

function transformChunk(content) {
    // Preserve line positions as much as possible for map quality.
    const withoutSourceMapLine = content.replace(/\/\/# sourceMappingURL=.*$/gm, "");

    return withoutSourceMapLine
        .split(/\r?\n/)
        .map((line) => {
            if (/^\s*import\s/.test(line)) return "";

            let out = line;
            out = out.replace(/^export function ([\w$]+)\(/, "var $1 = exports.$1 = function(");
            out = out.replace(/^export var ([\w$]+) =/, "var $1 = exports.$1 =");
            out = out.replace(/^export \{ ([\w$]+) \};$/, "exports.$1 = $1;");
            return out;
        })
        .join("\n");
}

function toPosix(p) {
    return p.split(path.sep).join("/");
}

function rebaseMapSources(relFile, mapText) {
    const map = JSON.parse(mapText);
    const sourceRoot = map.sourceRoot || "";
    const mapDir = path.dirname(path.join(ROOT, relFile));

    if (Array.isArray(map.sources)) {
        map.sources = map.sources.map((sourcePath) => {
            const withRoot = sourceRoot ? path.join(sourceRoot, sourcePath) : sourcePath;
            const absSource = path.resolve(mapDir, withRoot);
            return toPosix(path.relative(BUILD_DIR, absSource));
        });
        map.sourceRoot = "";
    }

    return JSON.stringify(map);
}

function main() {
    const version = execSync("node ./extra/get-version.js", {
        cwd: ROOT,
        encoding: "utf8",
    }).trim();

    fs.writeFileSync(path.join(BUILD_DIR, "version.js"), `export var version = '${version}';\n`);

    const files = extractConcatenationFiles();
    const concat = new Concat(true, "plywood.debug.js", "\n");

    for (const relFile of files) {
        const absFile = path.join(ROOT, relFile);
        const raw = fs.readFileSync(absFile, "utf8");
        const transformed = transformChunk(raw);

        const mapPath = `${absFile}.map`;
        let map = null;
        if (fs.existsSync(mapPath)) {
            map = rebaseMapSources(relFile, fs.readFileSync(mapPath, "utf8"));
        }

        concat.add(relFile, transformed, map);
    }

    const output = `${concat.content.toString()}\n//# sourceMappingURL=plywood.debug.js.map\n`;
    fs.writeFileSync(OUTPUT_JS, output);
    fs.writeFileSync(OUTPUT_MAP, concat.sourceMap);

    console.log("Wrote build/plywood.debug.js with flat source map");
}

main();
