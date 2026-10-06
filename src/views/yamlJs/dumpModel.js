/**
 * 配置序列化：支持两种书写格式
 *  - Clash（默认）：标准块状缩进
 *  - FLClash：节点 / 策略组行内 flow 书写，与机场订阅风格一致
 */
import yaml from "js-yaml";

const NUM_RE = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?$/;
const BOOL_RE = /^(?:true|false|null|~|yes|no|on|off)$/i;
// 需要加引号的场景：YAML 特殊字符、全角标点、首尾空格
const SPECIAL_RE = /[:#\[\]{}&*!|>%@`,"']|[\uFF1A\uFF08\uFF09\u3010\u3011]/;

/** 标量序列化 */
const scalar = (v) => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  const s = String(v);
  if (s === "") return "''";
  if (
    BOOL_RE.test(s) ||
    NUM_RE.test(s) ||
    SPECIAL_RE.test(s) ||
    /^\s|\s$/.test(s) ||
    s.indexOf("\n") !== -1
  ) {
    return "'" + s.replace(/'/g, "''") + "'";
  }
  return s;
};

/** 行内 flow 序列化（数组 / 对象 / 标量） */
const flow = (v) => {
  if (Array.isArray(v)) return `[${v.map(flow).join(", ")}]`;
  if (v && typeof v === "object") {
    const inner = Object.entries(v)
      .map(([k, val]) => `${scalar(k)}: ${flow(val)}`)
      .join(", ");
    return inner ? `{ ${inner} }` : "{}";
  }
  return scalar(v);
};

/** 块状映射（4 空格缩进，数组走 flow） */
const blockMap = (obj, indent) => {
  const pad = " ".repeat(indent);
  const out = [];
  Object.entries(obj).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      out.push(`${pad}${scalar(k)}: ${flow(v)}`);
    } else if (v && typeof v === "object") {
      if (!Object.keys(v).length) {
        out.push(`${pad}${scalar(k)}: {}`);
      } else {
        out.push(`${pad}${scalar(k)}:`);
        out.push(...blockMap(v, indent + 4));
      }
    } else {
      out.push(`${pad}${scalar(k)}: ${scalar(v)}`);
    }
  });
  return out;
};

/** Clash 标准格式（默认） */
export const dumpClash = (cfg) =>
  yaml.dump(cfg, { lineWidth: -1, noRefs: true, quotingType: "'" });

/** FLClash 行内格式：proxies / proxy-groups 逐行 flow，rules 单引号列表 */
export const dumpFlclash = (cfg) => {
  const lines = [];
  Object.entries(cfg).forEach(([k, v]) => {
    if (k === "proxies" || k === "proxy-groups") {
      if (!v || !v.length) {
        lines.push(`${k}: []`);
        return;
      }
      lines.push(`${k}:`);
      if (k === "proxy-groups") lines.push("");
      v.forEach((item) => lines.push(`    - ${flow(item)}`));
    } else if (k === "rules") {
      if (!v || !v.length) {
        lines.push(`${k}: []`);
        return;
      }
      lines.push(`${k}:`);
      v.forEach((r) => lines.push(`    - ${scalar(r)}`));
    } else if (Array.isArray(v)) {
      lines.push(`${k}: ${flow(v)}`);
    } else if (v && typeof v === "object") {
      if (!Object.keys(v).length) {
        lines.push(`${k}: {}`);
      } else {
        lines.push(`${k}:`);
        lines.push(...blockMap(v, 4));
      }
    } else {
      lines.push(`${k}: ${scalar(v)}`);
    }
  });
  return lines.join("\n") + "\n";
};

/** 按选择输出 */
export const dumpByFormat = (cfg, format) =>
  format === "flclash" ? dumpFlclash(cfg) : dumpClash(cfg);
