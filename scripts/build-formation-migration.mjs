// Génère supabase/migrations/006_formation_adapt.sql à partir des contenus versionnés
// dans content/formation/ (leçons Markdown + quizzes.json).
// Usage : node scripts/build-formation-migration.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const CONTENT = path.join(ROOT, "content", "formation");
const OUT = path.join(ROOT, "supabase", "migrations", "006_formation_adapt.sql");

const LESSON_TYPES = ["séance", "outil", "code", "test", "défi", "recherche"];

const MODULES = {
  bienvenue: {
    id: "c0000000-0000-4000-8000-000000000000",
    sortOrder: 0,
    monthLabel: "Avant de commencer",
    title: "Bienvenue, boîte à outils IA et méthodes pro",
  },
  "mois-1": {
    id: "c0000000-0000-4000-8000-000000000001",
    sortOrder: 1,
    monthLabel: "Mois 1 · Novembre",
    title: "La méthode ADAPT sur de vrais sites",
  },
  "mois-2": {
    id: "c0000000-0000-4000-8000-000000000002",
    sortOrder: 2,
    monthLabel: "Mois 2 · Décembre",
    title: "Ton SaaS et ton offre",
  },
};

// S1 → S8 : [samedi (classe 1), dimanche (classe 2)]
const SESSION_DATES = {
  1: ["2026-10-31", "2026-11-01"],
  2: ["2026-11-07", "2026-11-08"],
  3: ["2026-11-14", "2026-11-15"],
  4: ["2026-11-21", "2026-11-22"],
  5: ["2026-11-28", "2026-11-29"],
  6: ["2026-12-05", "2026-12-06"],
  7: ["2026-12-12", "2026-12-13"],
  8: ["2026-12-19", "2026-12-20"],
};
const SESSION_HOURS = "9h – 13h30";
const SESSION_LOCATION = "Présentiel — lieu à confirmer";

const TODOS = [
  { id: "a1000000-0000-4000-8000-000000000001", title: "Lire la leçon « Bienvenue » et les 4 guides de la boîte à outils IA" },
  { id: "a1000000-0000-4000-8000-000000000002", title: "Installer VS Code, Git et Node.js (version LTS)" },
  { id: "a1000000-0000-4000-8000-000000000003", title: "Créer ton compte GitHub" },
  { id: "a1000000-0000-4000-8000-000000000004", title: "Installer FORGEIA CODE et le brancher sur la passerelle (Ressources → Environnement développeur IA)" },
  { id: "a1000000-0000-4000-8000-000000000005", title: "Venir à chaque séance avec ton ordinateur portable chargé" },
];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/;

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith(".md") ? [full] : [];
  });
}

/** En-tête YAML minimal : `cle: valeur` (valeur éventuellement entre guillemets). */
function parseLesson(file) {
  const raw = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) fail(`${file} : en-tête --- manquant`);
  const meta = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if (/^".*"$/.test(value)) value = value.slice(1, -1).replace(/\\"/g, '"');
    meta[m[1]] = value;
  }
  for (const key of ["id", "module", "order", "title", "type", "duration"]) {
    if (!meta[key]) fail(`${file} : champ « ${key} » manquant`);
  }
  if (!UUID.test(meta.id)) fail(`${file} : id invalide ${meta.id}`);
  if (!MODULES[meta.module]) fail(`${file} : module inconnu ${meta.module}`);
  if (!LESSON_TYPES.includes(meta.type)) fail(`${file} : type inconnu ${meta.type}`);
  return {
    file: path.relative(ROOT, file),
    id: meta.id,
    module: meta.module,
    order: Number(meta.order),
    title: meta.title,
    type: meta.type,
    duration: meta.duration,
    session: meta.session ? Number(meta.session) : null,
    body: match[2].trim() + "\n",
  };
}

// Mélange déterministe des options (la bonne réponse ne doit pas être devinable par sa position).
function seededShuffle(items, seed) {
  let s = 0;
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
  const out = items.map((item, index) => ({ item, index }));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const DOLLAR = "$forge$";
function lit(text) {
  if (text.includes(DOLLAR)) fail(`le texte contient ${DOLLAR}`);
  return `${DOLLAR}${text}${DOLLAR}`;
}

const lessons = walk(CONTENT).map(parseLesson);
const quizzes = JSON.parse(fs.readFileSync(path.join(CONTENT, "quizzes.json"), "utf8"));

// Leçons « test » générées pour chaque quiz
for (const quiz of quizzes) {
  if (!UUID.test(quiz.id) || !UUID.test(quiz.lessonId)) fail(`quiz ${quiz.title} : id invalide`);
  if (!MODULES[quiz.module]) fail(`quiz ${quiz.title} : module inconnu`);
  quiz.questions.forEach((q, i) => {
    if (!Array.isArray(q.options) || q.options.length !== 4) fail(`quiz ${quiz.title} q${i + 1} : 4 options attendues`);
    if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct > 3) fail(`quiz ${quiz.title} q${i + 1} : correct invalide`);
  });
  lessons.push({
    file: "quizzes.json",
    id: quiz.lessonId,
    module: quiz.module,
    order: quiz.order,
    title: quiz.title,
    type: "test",
    duration: `${quiz.durationMinutes} min`,
    session: null,
    body: `${quiz.description}\n\n- ${quiz.questions.length} questions, ${quiz.durationMinutes} minutes\n- Note minimale : 70 %\n- Chaque réponse est expliquée à la fin\n\nClique sur « Passer le quiz » : il se valide dans l'onglet **Tests**.\n`,
  });
}

const ids = new Set();
for (const l of lessons) {
  if (ids.has(l.id)) fail(`id de leçon en double : ${l.id} (${l.file})`);
  ids.add(l.id);
}
for (const session of Object.keys(SESSION_DATES).map(Number)) {
  if (!lessons.some((l) => l.session === session && l.type === "séance")) fail(`aucune leçon séance pour S${session}`);
}

const sql = [];
sql.push("-- 006_formation_adapt.sql — GÉNÉRÉ par scripts/build-formation-migration.mjs, ne pas éditer à la main.");
sql.push("-- Remplace le programme 3 mois par la formation ADAPT (2 mois) : modules, leçons, quiz, séances, préparation.");
sql.push("begin;");
sql.push("");
sql.push("alter table public.formation_lessons drop constraint if exists formation_lessons_type_check;");
sql.push(
  `alter table public.formation_lessons add constraint formation_lessons_type_check check (type in (${LESSON_TYPES.map((t) => `'${t}'`).join(", ")}));`,
);
sql.push("");
sql.push("-- Ancien programme : suppression en cascade (leçons, quiz, progression).");
const moduleIds = Object.values(MODULES).map((m) => `'${m.id}'`).join(", ");
sql.push(`delete from public.formation_modules where id not in (${moduleIds});`);
sql.push("");
sql.push("-- Modules");
for (const m of Object.values(MODULES)) {
  sql.push(
    `insert into public.formation_modules (id, sort_order, month_label, title) values ('${m.id}', ${m.sortOrder}, ${lit(m.monthLabel)}, ${lit(m.title)})` +
      ` on conflict (id) do update set sort_order = excluded.sort_order, month_label = excluded.month_label, title = excluded.title;`,
  );
}
sql.push("");
sql.push("-- Leçons");
const lessonIds = lessons.map((l) => `'${l.id}'`).join(", ");
sql.push(`delete from public.formation_lessons where id not in (${lessonIds});`);
for (const l of [...lessons].sort((a, b) => MODULES[a.module].sortOrder - MODULES[b.module].sortOrder || a.order - b.order)) {
  sql.push(
    `insert into public.formation_lessons (id, module_id, sort_order, title, type, duration, body) values ('${l.id}', '${MODULES[l.module].id}', ${l.order}, ${lit(l.title)}, '${l.type}', ${lit(l.duration)}, ${lit(l.body)})` +
      ` on conflict (id) do update set module_id = excluded.module_id, sort_order = excluded.sort_order, title = excluded.title, type = excluded.type, duration = excluded.duration, body = excluded.body;`,
  );
}
sql.push("");
sql.push("-- Quiz");
const quizIds = quizzes.map((q) => `'${q.id}'`).join(", ");
sql.push(`delete from public.formation_quizzes where id not in (${quizIds});`);
quizzes.forEach((quiz, qi) => {
  sql.push(
    `insert into public.formation_quizzes (id, lesson_id, title, description, duration_minutes, passing_score, active) values ('${quiz.id}', '${quiz.lessonId}', ${lit(quiz.title)}, ${lit(quiz.description)}, ${quiz.durationMinutes}, 70, true)` +
      ` on conflict (id) do update set lesson_id = excluded.lesson_id, title = excluded.title, description = excluded.description, duration_minutes = excluded.duration_minutes, passing_score = excluded.passing_score, active = excluded.active;`,
  );
  const questionIds = [];
  quiz.questions.forEach((q, i) => {
    const qid = `f1000000-0000-4000-8000-${String((qi + 1) * 1000 + i + 1).padStart(12, "0")}`;
    questionIds.push(`'${qid}'`);
    const shuffled = seededShuffle(q.options, `${quiz.id}:${i}`);
    const options = shuffled.map((o) => o.item);
    const correct = shuffled.findIndex((o) => o.index === q.correct);
    sql.push(
      `insert into public.formation_quiz_questions (id, quiz_id, sort_order, question, options, correct_option_index, explanation) values ('${qid}', '${quiz.id}', ${i + 1}, ${lit(q.question)}, ${lit(JSON.stringify(options))}::jsonb, ${correct}, ${lit(q.explanation)})` +
        ` on conflict (id) do update set sort_order = excluded.sort_order, question = excluded.question, options = excluded.options, correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;`,
    );
  });
  sql.push(`delete from public.formation_quiz_questions where quiz_id = '${quiz.id}' and id not in (${questionIds.join(", ")});`);
});
sql.push("");
sql.push("-- Calendrier : 8 séances × 2 classes (samedi = classe 1, dimanche = classe 2)");
sql.push("delete from public.formation_sessions;");
for (const [session, [sat, sun]] of Object.entries(SESSION_DATES)) {
  const lesson = lessons.find((l) => l.session === Number(session) && l.type === "séance");
  for (const [date, schedule] of [[sat, "saturday"], [sun, "sunday"]]) {
    sql.push(
      `insert into public.formation_sessions (title, session_date, hours, location, schedule, lesson_id) values (${lit(lesson.title)}, '${date}', ${lit(SESSION_HOURS)}, ${lit(SESSION_LOCATION)}, '${schedule}', '${lesson.id}');`,
    );
  }
}
sql.push("");
sql.push("-- Liste de préparation");
sql.push(`update public.formation_todos set active = false where id not in (${TODOS.map((t) => `'${t.id}'`).join(", ")});`);
TODOS.forEach((t, i) => {
  sql.push(
    `insert into public.formation_todos (id, title, sort_order, active) values ('${t.id}', ${lit(t.title)}, ${i + 1}, true)` +
      ` on conflict (id) do update set title = excluded.title, sort_order = excluded.sort_order, active = true;`,
  );
});
sql.push("");
sql.push("commit;");
sql.push("");

fs.writeFileSync(OUT, sql.join("\n"), "utf8");
const counts = lessons.reduce((acc, l) => ({ ...acc, [l.type]: (acc[l.type] ?? 0) + 1 }), {});
console.log(`✔ ${path.relative(ROOT, OUT)}`);
console.log(`  leçons : ${lessons.length} ${JSON.stringify(counts)}`);
console.log(`  quiz : ${quizzes.length}, questions : ${quizzes.reduce((n, q) => n + q.questions.length, 0)}`);
console.log(`  séances : ${Object.keys(SESSION_DATES).length * 2}, todos : ${TODOS.length}`);
