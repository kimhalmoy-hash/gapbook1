/** robots.txt: lengste treff vinner, Allow vinner ved lik lengde. */

export function parseRobots(text) {
  const groups = [];
  let agents = [];
  let rules = [];
  const flush = () => {
    if (!agents.length) return;
    groups.push({ agents, rules });
    agents = [];
    rules = [];
  };
  for (const raw of String(text || "").split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    if (!line) continue;
    const m = line.match(/^([^:]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1].trim().toLowerCase();
    const val = m[2].trim();
    if (key === "user-agent") {
      if (rules.length) flush();
      agents.push(val.toLowerCase());
    } else if (key === "allow" || key === "disallow") {
      if (!agents.length) continue;
      rules.push({ allow: key === "allow", path: val });
    }
  }
  flush();
  return groups;
}

export function regelTreffer(pattern, path) {
  if (!pattern) return false;
  const end = pattern.endsWith("$");
  const body = end ? pattern.slice(0, -1) : pattern;
  const re = body
    .split("*")
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp("^" + re + (end ? "$" : "")).test(path);
}

export function stiTillatt(robotsText, path, userAgent) {
  const groups = parseRobots(robotsText);
  const ua = String(userAgent || "*").toLowerCase();
  let valgt = groups.filter((g) => g.agents.some((a) => a !== "*" && ua.includes(a)));
  if (!valgt.length) valgt = groups.filter((g) => g.agents.includes("*"));
  const rules = valgt.flatMap((g) => g.rules);
  let vinner = null;
  for (const rule of rules) {
    if (!regelTreffer(rule.path, path)) continue;
    if (
      !vinner ||
      rule.path.length > vinner.path.length ||
      (rule.path.length === vinner.path.length && rule.allow && !vinner.allow)
    ) {
      vinner = rule;
    }
  }
  if (!vinner) return true;
  return vinner.allow;
}
