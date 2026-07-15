/**
 * Diagnostic script: diagnose-themes-raw.mjs
 * Uses raw pg directly (same DATABASE_URL as the app) to debug theme state.
 * Run with: node --env-file=.env scratch/diagnose-themes-raw.mjs
 */

import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function diagnose() {
  const client = await pool.connect();
  console.log("\n=== LOOP Theme Clustering Diagnostic (Raw SQL) ===\n");

  try {
    // 1. All workspaces
    const wsRes = await client.query(
      `SELECT id, name, "createdAt" FROM "Workspace" ORDER BY "createdAt" DESC`
    );
    console.log(`[1] Total Workspaces: ${wsRes.rows.length}`);
    wsRes.rows.forEach((ws, i) => {
      console.log(`    [${i+1}] id=${ws.id}  name="${ws.name}"`);
    });

    // 2. All users (last 10)
    const usersRes = await client.query(
      `SELECT id, email, role, "workspaceId" FROM "User" ORDER BY "createdAt" DESC LIMIT 10`
    );
    console.log(`\n[2] Most recent users (max 10):`);
    usersRes.rows.forEach((u, i) => {
      console.log(`    [${i+1}] email=${u.email}  role=${u.role}  workspaceId=${u.workspaceId}`);
    });

    // 3. ALL themes across all workspaces
    const themesRes = await client.query(
      `SELECT t.id, t.name, t."workspaceId", t."createdAt",
              COUNT(ft."feedbackId") as "feedbackCount"
       FROM "Theme" t
       LEFT JOIN "FeedbackTheme" ft ON ft."themeId" = t.id
       GROUP BY t.id
       ORDER BY t."createdAt" DESC`
    );
    console.log(`\n[3] Total Theme records (ALL workspaces): ${themesRes.rows.length}`);
    themesRes.rows.forEach((t, i) => {
      console.log(`    [${i+1}] id=${t.id}  name="${t.name}"  workspaceId=${t.workspaceId}  feedbackCount=${t.feedbackCount}`);
    });

    // 4. ALL FeedbackTheme join records
    const ftRes = await client.query(
      `SELECT ft."feedbackId", ft."themeId", ft.confidence,
              t.name AS "themeName", t."workspaceId" AS "themeWorkspaceId",
              f."workspaceId" AS "feedbackWorkspaceId",
              LEFT(f.content, 60) AS "feedbackContent"
       FROM "FeedbackTheme" ft
       JOIN "Theme" t ON t.id = ft."themeId"
       JOIN "Feedback" f ON f.id = ft."feedbackId"
       ORDER BY f."createdAt" DESC
       LIMIT 30`
    );
    console.log(`\n[4] FeedbackTheme join records (max 30): ${ftRes.rows.length}`);
    ftRes.rows.forEach((ft, i) => {
      const mismatch = ft.themeWorkspaceId !== ft.feedbackWorkspaceId ? " ⚠️  WORKSPACE MISMATCH!" : "";
      console.log(`    [${i+1}] theme="${ft.themeName}"  confidence=${ft.confidence}${mismatch}`);
      console.log(`         feedback="${ft.feedbackContent}"`);
      console.log(`         themeWorkspace=${ft.themeWorkspaceId}  feedbackWorkspace=${ft.feedbackWorkspaceId}`);
    });

    // 5. Per-workspace theme query (simulating /api/themes)
    console.log(`\n[5] Simulating /api/themes Prisma query per workspace:`);
    for (const ws of wsRes.rows) {
      const res = await client.query(
        `SELECT t.id, t.name, COUNT(ft."feedbackId") as "feedbackCount"
         FROM "Theme" t
         LEFT JOIN "FeedbackTheme" ft ON ft."themeId" = t.id
         WHERE t."workspaceId" = $1
         GROUP BY t.id`,
        [ws.id]
      );
      console.log(`\n    workspace="${ws.name}" (${ws.id})`);
      console.log(`    → Themes returned: ${res.rows.length}`);
      res.rows.forEach((t) => {
        console.log(`      Theme: "${t.name}"  feedbackLinks=${t.feedbackCount}`);
      });
    }

    // 6. Recent feedback without any theme assignment
    const noThemeRes = await client.query(
      `SELECT f.id, f."workspaceId", LEFT(f.content, 60) as content, f."createdAt"
       FROM "Feedback" f
       WHERE NOT EXISTS (
         SELECT 1 FROM "FeedbackTheme" ft WHERE ft."feedbackId" = f.id
       )
       ORDER BY f."createdAt" DESC
       LIMIT 20`
    );
    console.log(`\n[6] Feedbacks with NO theme assignment (max 20): ${noThemeRes.rows.length}`);
    noThemeRes.rows.forEach((f, i) => {
      console.log(`    [${i+1}] workspaceId=${f.workspaceId}  content="${f.content}"`);
    });

    // 7. The session_token / user lookup the API uses
    console.log(`\n[7] Session token lookup test (what /api/themes does):`);
    const sessionCheck = await client.query(
      `SELECT u.id AS "userId", u.email, u.role, u."workspaceId"
       FROM "User" u
       ORDER BY u."createdAt" DESC
       LIMIT 5`
    );
    console.log(`    The /api/themes route looks up user by session_token = user.id (cookie).`);
    console.log(`    These are the most recent users the API would match:`);
    sessionCheck.rows.forEach((u, i) => {
      console.log(`    [${i+1}] userId=${u.userId}  email=${u.email}  workspaceId=${u.workspaceId}`);
    });

    console.log(`\n=== Diagnostic Complete ===\n`);
  } catch (err) {
    console.error("Diagnostic error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

diagnose();
