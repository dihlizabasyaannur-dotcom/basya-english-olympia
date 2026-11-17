// Integration tests for the database layer (RLS + quiz engine) against a LOCAL Supabase.
// Usage: npx supabase start && npm run test:db
// Uses the well-known local development keys printed by `supabase status` (never production keys).
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'node:child_process';

const status = JSON.parse(execSync('npx supabase status -o json', { encoding: 'utf8' }));
const URL = status.API_URL;
const ANON = status.ANON_KEY;
const SERVICE = status.SERVICE_ROLE_KEY;
if (!URL.includes('127.0.0.1') && !URL.includes('localhost')) throw new Error('Refusing to run against a non-local database');

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });
let passed = 0;
let failed = 0;
const check = (name, cond, extra = '') => {
  if (cond) { passed++; console.log(`  ✔ ${name}`); } else { failed++; console.log(`  ✘ ${name} ${extra}`); }
};

async function makeUser(label, role = 'student') {
  const email = `${label}-${Date.now()}@test.local`;
  const password = 'Test-password-123';
  const { data, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { full_name: `Test ${label}`, school_level: 'SMP', grade: '8' },
  });
  if (error) throw error;
  if (role !== 'student') await admin.from('profiles').update({ role }).eq('id', data.user.id);
  const client = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error: e2 } = await client.auth.signInWithPassword({ email, password });
  if (e2) throw e2;
  return { id: data.user.id, client };
}

async function correctOptionId(questionId) {
  const { data } = await admin.from('question_options').select('id').eq('question_id', questionId).eq('is_correct', true).single();
  return data.id;
}

console.log('\n▶ Profiles & role protection');
const s1 = await makeUser('student1');
const s2 = await makeUser('student2');
{
  const { data } = await s1.client.from('profiles').select('*').eq('id', s1.id).single();
  check('profile auto-created as student', data?.role === 'student' && data.full_name === 'Test student1');
  const { error } = await s1.client.from('profiles').update({ xp: 99999 }).eq('id', s1.id);
  check('student cannot change own XP', !!error);
  const { error: e2 } = await s1.client.from('profiles').update({ role: 'admin' }).eq('id', s1.id);
  check('student cannot promote self to admin', !!e2);
  const { error: e3 } = await s1.client.from('profiles').update({ full_name: 'Renamed' }).eq('id', s1.id);
  check('student can edit own name', !e3);
  const { data: others } = await s1.client.from('profiles').select('id').eq('id', s2.id);
  check("student cannot read another student's profile", others?.length === 0);
}

console.log('\n▶ Answer keys are hidden from students');
{
  const { data: qs } = await s1.client.from('questions').select('id');
  check('students cannot read questions table', qs?.length === 0);
  const { data: os } = await s1.client.from('question_options').select('is_correct');
  check('students cannot read options/answer keys', os?.length === 0);
}

console.log('\n▶ Practice mode (immediate feedback)');
{
  const { data: attemptId, error } = await s1.client.rpc('start_practice', { p_learning_mode: 'proficiency', p_cefr: 'A1', p_count: 5 });
  check('start_practice returns attempt', !!attemptId && !error, error?.message);
  const { data: att } = await s1.client.rpc('get_attempt', { p_attempt_id: attemptId });
  const q0 = att.questions[0];
  check('questions returned with options', att.questions.length === 5 && q0.options.length === 4);
  check('no answer key in question payload', !JSON.stringify(att).includes('is_correct'));
  const right = await correctOptionId(q0.id);
  const { data: fb } = await s1.client.rpc('answer_question', { p_attempt_id: attemptId, p_question_id: q0.id, p_option_id: right });
  check('practice answer returns feedback + explanation', fb.feedback?.is_correct === true && fb.feedback.explanation.length > 0);
  const { error: again } = await s1.client.rpc('answer_question', { p_attempt_id: attemptId, p_question_id: q0.id, p_option_id: right });
  check('practice answer cannot be changed after feedback', again?.message.includes('ALREADY_ANSWERED'));
  const { error: other } = await s2.client.rpc('get_attempt', { p_attempt_id: attemptId });
  check("another student cannot open this attempt", other?.message.includes('ATTEMPT_NOT_FOUND'));
  const { error: e4 } = await s1.client.rpc('start_practice', { p_learning_mode: 'proficiency', p_cefr: 'A1', p_category_slug: 'hots' });
  check('empty selection gives NO_QUESTIONS', e4?.message.includes('NO_QUESTIONS'));
}

console.log('\n▶ Exam mode: diagnostic placement test');
{
  const { data: pkg } = await s1.client.from('quiz_packages').select('id').eq('assessment_type', 'diagnostic').single();
  const { data: attemptId, error } = await s1.client.rpc('start_package_attempt', { p_package_id: pkg.id });
  check('diagnostic starts', !!attemptId, error?.message);
  const { data: att } = await s1.client.rpc('get_attempt', { p_attempt_id: attemptId });
  const levels = att.questions.reduce((m, q) => ({ ...m, [q.cefr_level]: (m[q.cefr_level] ?? 0) + 1 }), {});
  check('diagnostic is balanced across A1–B2', ['A1', 'A2', 'B1', 'B2'].every((l) => levels[l] === 5), JSON.stringify(levels));
  check('timer set (expires_at)', !!att.attempt.expires_at);

  // Answer A1, A2, B1 correctly; B2 wrong → expected placement B1
  for (const q of att.questions) {
    const right = await correctOptionId(q.id);
    const pick = q.cefr_level === 'B2' ? q.options.find((o) => o.id !== right).id : right;
    const { data } = await s1.client.rpc('answer_question', { p_attempt_id: attemptId, p_question_id: q.id, p_option_id: pick });
    if (data.feedback) { check('exam answers must not reveal feedback', false); break; }
  }
  const { data: mid } = await s1.client.rpc('get_attempt', { p_attempt_id: attemptId });
  check('no feedback before submission', mid.questions.every((q) => q.feedback === null));
  const { data: rows } = await s1.client.from('student_answers').select('is_correct').eq('attempt_id', attemptId);
  check('answer correctness hidden before submission', rows.length === 0);

  const { data: res, error: se } = await s1.client.rpc('submit_attempt', { p_attempt_id: attemptId });
  check('submit scores correctly (15/20 = 75%)', res?.correct === 15 && Number(res.score) === 75, se?.message ?? JSON.stringify(res));
  check('placement is B1 (not tied to school grade)', res.placement === 'B1');
  check('XP awarded (15×2 + 10 + 10 = 50)', res.xp_earned === 50);
  check('First Step badge earned', res.new_badges.some((b) => b.code === 'first_step'));
  const { data: after } = await s1.client.rpc('get_attempt', { p_attempt_id: attemptId });
  check('full review visible after submission', after.questions.every((q) => q.feedback?.correct_option_id));
  const { data: prof } = await s1.client.from('profiles').select('cefr_level, xp, current_streak').eq('id', s1.id).single();
  check('profile updated: level, XP (+badge), streak', prof.cefr_level === 'B1' && prof.xp === 70 && prof.current_streak === 1, JSON.stringify(prof));
  const { data: res2 } = await s1.client.rpc('submit_attempt', { p_attempt_id: attemptId });
  check('re-submitting is idempotent (no double XP)', res2.already_submitted === true);
  const { error: late } = await s1.client.rpc('answer_question', { p_attempt_id: attemptId, p_question_id: att.questions[0].id, p_option_id: att.questions[0].options[0].id });
  check('cannot answer after submission', late?.message.includes('ATTEMPT_ALREADY_SUBMITTED'));
  const { data: stats } = await s1.client.rpc('get_student_stats');
  check('student stats come from real answers', stats.answers.answered === 20 && stats.by_level.length === 4);
}

console.log('\n▶ Teacher authorisation');
{
  const t = await makeUser('teacher', 'teacher');
  const a = await makeUser('admin', 'admin');
  const { data: cls, error } = await a.client.from('classes').insert({ name: 'VIII-A', teacher_id: t.id, created_by: a.id }).select().single();
  check('admin creates class for teacher', !!cls, error?.message);
  const { error: je } = await s1.client.rpc('join_class', { p_code: cls.join_code });
  check('student joins with code', !je, je?.message);
  const { error: se1 } = await t.client.rpc('get_student_stats', { p_student_id: s1.id });
  check('teacher can view enrolled student', !se1);
  const { error: se2 } = await t.client.rpc('get_student_stats', { p_student_id: s2.id });
  check('teacher cannot view non-enrolled student', se2?.message.includes('NOT_AUTHORIZED'));
  const { data: tp } = await t.client.from('profiles').select('id').eq('id', s2.id);
  check('teacher cannot read non-enrolled profile', tp.length === 0);
  const { error: te } = await t.client.rpc('admin_save_question', { p: {} });
  check('teacher cannot use admin functions', te?.message.includes('NOT_AUTHORIZED'));

  console.log('\n▶ Admin question bank');
  const payload = {
    learning_mode: 'proficiency', cefr_level: 'A1', category: 'grammar', difficulty: 'easy', question_text: 'They ___ friends.',
    option_a: 'is', option_b: 'are', option_c: 'am', option_d: 'be', correct_answer: 'B', explanation: 'Plural subject.', status: 'draft', tags: 'test',
  };
  const { data: qid, error: qe } = await a.client.rpc('admin_save_question', { p: payload });
  check('admin creates question', !!qid, qe?.message);
  const { error: bad } = await a.client.rpc('admin_save_question', { p: { ...payload, correct_answer: 'E' } });
  check('invalid correct answer rejected', bad?.message.includes('INVALID_CORRECT_ANSWER'));
  const { error: imp } = await a.client.rpc('admin_import_questions', { p_rows: [payload, { ...payload, category: 'nope' }] });
  const { count } = await admin.from('questions').select('*', { count: 'exact', head: true });
  check('import is all-or-nothing on error', imp?.message.includes('Row 2') && count === 41, `${imp?.message} count=${count}`);
  const { data: ov } = await a.client.rpc('get_admin_overview');
  check('admin overview counts', ov.questions === 41 && ov.teachers === 1);
  const { error: so } = await s1.client.rpc('get_admin_overview');
  check('student cannot see admin overview', !!so);
}

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
