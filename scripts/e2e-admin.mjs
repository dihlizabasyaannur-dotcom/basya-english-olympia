// Browser E2E for Super Admin + Teacher against the local dev server + LOCAL Supabase.
// Usage: npm run dev, then: NODE_PATH=$(npm root -g) node scripts/e2e-admin.mjs [screenshotDir]
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
const { chromium } = createRequire(import.meta.url)('playwright');

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const shots = process.argv[2];
if (shots) mkdirSync(shots, { recursive: true });
const status = JSON.parse(execSync('npx supabase status -o json', { encoding: 'utf8' }));
if (!status.API_URL.includes('127.0.0.1')) throw new Error('Local Supabase only');
const sb = createClient(status.API_URL, status.SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function user(name, role) {
  const email = `${name.toLowerCase().replace(/\W/g, '')}-${Date.now()}@example.com`;
  const { data, error } = await sb.auth.admin.createUser({ email, password: 'Rahasia-123', email_confirm: true, user_metadata: { full_name: name } });
  if (error) throw error;
  await sb.from('profiles').update({ role }).eq('id', data.user.id);
  return { email, id: data.user.id };
}
const admin = await user("Ma'am Basya", 'admin');
const teacher = await user('Pak Budi Santoso', 'teacher');

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 }, deviceScaleFactor: shots ? 2 : 1, acceptDownloads: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
const snap = (n, full = true) => shots && page.screenshot({ path: `${shots}/${n}.png`, fullPage: full, caret: "initial" });
const step = (s) => console.log('•', s);
async function login(email) {
  await page.goto(`${BASE}/login`);
  await page.locator('#email').fill(email);
  await page.locator('#password').fill('Rahasia-123');
  await page.getByRole('button', { name: 'Sign in' }).click();
}

step('Admin signs in → overview');
await login(admin.email);
await page.waitForURL('**/admin');
await page.getByText('Platform overview from live database data.').waitFor();
await page.waitForTimeout(600);
await snap('11-admin-overview');

step('Question bank filter');
await page.goto(`${BASE}/admin/questions?mode=olympiad&school=SMA`);
await page.getByText('6 question(s) match your filters.').waitFor();
await page.goto(`${BASE}/admin/questions`);
await snap('12-question-bank');

step('Create question (validation first)');
await page.goto(`${BASE}/admin/questions/new`);
await page.getByRole('button', { name: 'Create question' }).click();
await page.getByText('Question text is required').waitFor();
await page.locator('#question_text').fill('She ___ to school every day.');
await page.locator('#option_a').fill('go');
await page.locator('#option_b').fill('goes');
await page.locator('#option_c').fill('going');
await page.locator('#option_d').fill('gone');
await page.locator('#correct_answer').selectOption('B');
await page.locator('#explanation').fill('Third person singular takes -s in present simple.');
await page.locator('#code').fill('BEO-E2E01');
await page.getByRole('button', { name: 'Create question' }).click();
await page.waitForURL('**/admin/questions');
await page.getByText('Question created.').waitFor();

step('Edit, publish, delete');
await page.goto(`${BASE}/admin/questions?q=BEO-E2E01`);
await page.getByRole('link', { name: 'Edit' }).click();
await page.getByRole('heading', { name: 'Edit BEO-E2E01' }).waitFor();
await page.locator('#subcategory').fill('present simple');
await page.getByRole('button', { name: 'Save changes' }).click();
await page.getByText('Question updated.').waitFor();
await page.goto(`${BASE}/admin/questions?q=BEO-E2E01`);
await page.getByRole('button', { name: 'Publish' }).click();
await page.getByText('BEO-E2E01 published.').waitFor();
await page.getByRole('button', { name: 'Delete' }).click();
await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
await page.getByText('BEO-E2E01 deleted.').waitFor();

step('Import CSV with one invalid row');
const header = 'question_id,learning_mode,cefr_level,school_level,category,subcategory,difficulty,question_text,passage,option_a,option_b,option_c,option_d,correct_answer,explanation,distractor_analysis,learning_objective,skill_assessed,tags,status';
const csv = [header,
  'BEO-IMP01,proficiency,A2,,Grammar,,easy,"I ___ breakfast at 6 a.m. every day.",,have,has,having,had,A,"I takes the base form.",,,,"routine",published',
  'BEO-IMP02,Olympiad,,SMA,hots,,hard,"Which option best evaluates the claim?",,One,Two,Three,Four,B,"Option B weighs evidence.",,,,,draft',
  'BEO-IMP03,proficiency,,,grammar,,easy,"Missing level and key",,x,y,,,E,"",,,,,draft',
  'BEO-S0001,proficiency,A1,,grammar,to be,easy,"My sister ___ a teacher.",,is,are,am,be,A,"Updated explanation via import.",,,,,published',
].join('\n');
const file = join(tmpdir(), 'beo-import-test.csv');
writeFileSync(file, csv);
await page.goto(`${BASE}/admin/questions/import`);
await page.locator('#import-file').setInputFiles(file);
await page.getByText('Ready to import').waitFor();
await page.getByText('Proficiency questions need a CEFR level').waitFor();
await snap('13-import-preview');
await page.getByRole('button', { name: 'Import 3 questions' }).click();
await page.getByText('Import complete', { exact: true }).waitFor();
await page.getByText(/2\s*created · 1\s*updated · 1\s*skipped/).waitFor();
const { data: upd } = await sb.from('questions').select('explanation').eq('code', 'BEO-S0001').single();
if (upd.explanation !== 'Updated explanation via import.') throw new Error('Import did not update existing question');

step('Export to Excel');
await page.goto(`${BASE}/admin/questions/import`);
const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export all questions' }).click()]);
const out = join(tmpdir(), dl.suggestedFilename());
await dl.saveAs(out);
const XLSX = createRequire(import.meta.url)('xlsx');
const exported = XLSX.utils.sheet_to_json(XLSX.read(readFileSync(out)).Sheets.Questions);
if (exported.length !== 42 || !exported.find((r) => r.question_id === 'BEO-IMP01' && r.correct_answer === 'A')) throw new Error(`Export mismatch: ${exported.length}`);

step('Users: create class for teacher');
await page.goto(`${BASE}/admin/users`);
await page.getByLabel('Class name').fill('IX-A Olympiad Team');
await page.getByLabel('Teacher').selectOption({ label: 'Pak Budi Santoso' });
await page.getByRole('button', { name: 'Create class' }).click();
await page.getByText('Class "IX-A Olympiad Team" created.').waitFor();
await snap('14-admin-users');
const { data: cls } = await sb.from('classes').select('id, join_code').eq('name', 'IX-A Olympiad Team').single();

step('A student joins; teacher sees only their class');
const stu = await user('Rani Putri', 'student');
await sb.from('enrollments').insert({ class_id: cls.id, student_id: stu.id });
await page.getByRole('button', { name: 'Sign out' }).click();
await page.waitForURL(BASE + '/');
await login(teacher.email);
await page.waitForURL('**/teacher');
await page.getByText('Rani Putri').waitFor();
await snap('15-teacher-dashboard');
await page.goto(`${BASE}/admin`);
await page.waitForURL('**/teacher');  // teachers are bounced out of admin

const real = errors.filter((e) => !/favicon|DevTools/.test(e));
if (real.length) { console.log('Console errors:\n' + real.join('\n')); process.exitCode = 1; }
console.log(real.length ? '✘ finished with console errors' : '✔ Admin/Teacher E2E passed');
await browser.close();
