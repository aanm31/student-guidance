const json = (data, status = 200) => Response.json(data, {
  status,
  headers: {'cache-control':'no-store'}
});

async function ensureQuiz(db) {
  await db.prepare(`
    INSERT OR IGNORE INTO quizzes (slug, title, description, is_active)
    VALUES ('awareness-compass', 'بوصلة الوعي', 'مسابقة التوجيه والإرشاد الأسبوعية', 1)
  `).run();
  return db.prepare('SELECT id FROM quizzes WHERE slug = ?')
    .bind('awareness-compass').first('id');
}

async function createResult(request, env) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if(contentLength > 4096) return json({error:'الطلب أكبر من المسموح'}, 413);

  let body;
  try { body = await request.json(); }
  catch { return json({error:'بيانات غير صالحة'}, 400); }

  const correctAnswers = Number(body.correctAnswers);
  const totalQuestions = Number(body.totalQuestions);
  const scorePercent = Number(body.scorePercent);
  const valid = Number.isInteger(correctAnswers)
    && Number.isInteger(totalQuestions)
    && Number.isInteger(scorePercent)
    && totalQuestions > 0 && totalQuestions <= 100
    && correctAnswers >= 0 && correctAnswers <= totalQuestions
    && scorePercent === Math.round((correctAnswers / totalQuestions) * 100);
  if(!valid) return json({error:'نتيجة غير صالحة'}, 400);

  const quizId = await ensureQuiz(env.DB);
  const attemptUuid = crypto.randomUUID();
  await env.DB.prepare(`
    INSERT INTO quiz_attempts
      (attempt_uuid, quiz_id, correct_answers, total_questions, score_percent, completed_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(attemptUuid, quizId, correctAnswers, totalQuestions, scorePercent).run();

  return json({ok:true, attemptId:attemptUuid}, 201);
}

async function listResults(env) {
  const [recent, summary] = await Promise.all([
    env.DB.prepare(`
      SELECT score_percent AS score, completed_at AS completedAt
      FROM quiz_attempts
      WHERE completed_at IS NOT NULL
      ORDER BY completed_at DESC, id DESC
      LIMIT 5
    `).all(),
    env.DB.prepare(`
      SELECT COUNT(*) AS totalAttempts,
             COALESCE(ROUND(AVG(score_percent)), 0) AS averageScore
      FROM quiz_attempts
      WHERE completed_at IS NOT NULL
    `).first()
  ]);
  return json({results:recent.results, summary});
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if(url.pathname === '/api/results' && request.method === 'GET') return listResults(env);
      if(url.pathname === '/api/results' && request.method === 'POST') return createResult(request, env);
      if(url.pathname.startsWith('/api/')) return json({error:'المسار غير موجود'}, 404);
      return env.ASSETS.fetch(request);
    } catch(error) {
      console.error(JSON.stringify({event:'request_failed', path:url.pathname, message:error?.message || String(error)}));
      return json({error:'حدث خطأ غير متوقع'}, 500);
    }
  }
};
