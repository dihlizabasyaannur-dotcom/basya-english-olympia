// Browser end-to-end test of the student journey against the local dev server + local Supabase.
// Usage: npm run dev (in another terminal), then: node scripts/e2e-student.mjs [screenshotDir]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const shots = process.argv[2];
if (shots) mkdirSync(shots, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 }, deviceScaleFactor: shots ? 2 : 1 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
const snap = async (name, full = true) => shots && page.screenshot({ path: `${shots}/${name}.png`, fullPage: full, caret: "initial" });
const step = (s) => console.log('•', s);

step('Landing page');
await page.goto(BASE);
await page.getByRole('heading', { name: /Learn\. Practise\./ }).waitFor();
await snap('01-landing');

step('Register validation + account creation');
await page.goto(`${BASE}/register`);
await page.getByRole('button', { name: 'Create account' }).click();
await page.getByText('Enter your full name').waitFor();
const email = `siti-${Date.now()}@example.com`;
await page.getByLabel('Full name').fill('Siti Rahmawati');
await page.getByLabel('Email').fill(email);
await page.getByLabel('School level').selectOption('SMP');
await page.getByLabel('Grade').selectOption('8');
await page.getByLabel('School name').fill('SMP Negeri 1 Bandung');
await page.locator('#password').fill('Belajar-123');
await page.locator('#confirm').fill('Belajar-123');
await page.getByRole('button', { name: 'Create account' }).click();
await page.waitForURL('**/student?welcome=1');
await page.getByText('Not placed yet').first().waitFor();
await snap('02-dashboard-new-student');

step('Placement test (exam mode)');
await page.getByRole('button', { name: 'Start placement test' }).click();
await page.waitForURL('**/student/quiz/**');
await page.getByText('Question 1 of 20').waitFor();
await page.getByRole('timer').waitFor();
await snap('03-placement-question', false);
for (let i = 0; i < 20; i++) {
  await page.getByText(`Question ${i + 1} of 20`).waitFor();
  const opts = page.getByRole('radio');
  await opts.nth(i % 4).click();
  await page.waitForFunction(() => !document.querySelector('[role=radiogroup] .animate-spin'));
  if (await page.locator('[role=status]').filter({ hasText: /Correct|Not quite/ }).count()) throw new Error('Exam mode leaked feedback!');
  if (i < 19) await page.getByRole('button', { name: /^Next/ }).click();
}
await page.getByRole('button', { name: 'Finish & submit' }).click();
await page.getByRole('dialog').getByText('Submit your quiz?').waitFor();
await snap('04-submit-confirm', false);
await page.getByRole('button', { name: 'Yes, submit' }).click();
await page.waitForURL('**/student/results/**');
await page.getByText('Your placement').waitFor();
await page.getByText('Answer review').waitFor();
await snap('05-results');

step('Dashboard after placement');
await page.goto(`${BASE}/student`);
await page.getByText('You are here').waitFor();
await snap('06-dashboard-placed');

step('Practice mode with immediate feedback');
await page.goto(`${BASE}/student/learn/proficiency/a1`);
await page.getByRole('button', { name: 'Practise Grammar' }).click();
await page.waitForURL('**/student/quiz/**');
await page.getByRole('radio').first().click();
await page.locator('[role=status]').filter({ hasText: /Correct|Not quite/ }).waitFor();
await page.getByText('Explanation:').first().waitFor();
await snap('07-practice-feedback', false);
if (!(await page.getByRole('radio').first().isDisabled())) throw new Error('Practice answer should lock after feedback');

step('Learning programs, Olympiad track, assessments, progress, history, profile render');
for (const [path, text] of [
  ['/student/learn', 'Choose your path'],
  ['/student/learn/olympiad/smp', 'SMP Olympiad Track'],
  ['/student/assessments', 'Assessments & simulations'],
  ['/student/progress', 'Skill performance'],
  ['/student/history', 'Your quiz history'],
  ['/student/profile', 'Edit profile'],
]) {
  await page.goto(BASE + path);
  await page.getByText(text).first().waitFor();
  if (path === '/student/progress') { await page.waitForTimeout(600); await snap('08-progress'); }
  if (path === '/student/learn/olympiad/smp') await snap('09-olympiad-smp');
}

step('Profile save');
await page.getByLabel('School name').fill('SMP Negeri 2 Bandung');
await page.getByRole('button', { name: 'Save changes' }).click();
await page.getByText('Profile saved.').waitFor();

step('Mobile layout');
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${BASE}/student`);
await page.getByRole('button', { name: 'Open menu' }).waitFor();
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
if (overflow) throw new Error('Horizontal overflow on mobile dashboard');
await snap('10-mobile-dashboard');

step('Sign out');
await page.getByRole('button', { name: 'Open menu' }).click();
await page.getByRole('button', { name: 'Sign out' }).click();
await page.waitForURL(BASE + '/');

const real = errors.filter((e) => !/favicon|Download the React DevTools/.test(e));
if (real.length) { console.log('Console errors:\n' + real.join('\n')); process.exitCode = 1; }
console.log(real.length ? '✘ finished with console errors' : '✔ Student E2E passed');
await browser.close();
