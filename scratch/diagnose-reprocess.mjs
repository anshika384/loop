/**
 * Diagnostic: what does the reprocess Prisma query actually find?
 * Run: node --env-file=.env scratch/diagnose-reprocess.mjs
 */
import pg from "pg";
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    console.log("\n=== Reprocess Query Diagnostic ===\n");

    // All workspaces
    const wsRes = await client.query(
      `SELECT id, name FROM "Workspace" ORDER BY "createdAt" DESC`
    );
    console.log("Workspaces:");
    wsRes.rows.forEach((w, i) => console.log(`  [${i+1}] id=${w.id}  name="${w.name}"`));

    // For EVERY workspace: total feedback, feedback with theme, feedback without theme
    for (const ws of wsRes.rows) {
      const total = await client.query(
        `SELECT COUNT(*) FROM "Feedback" WHERE "workspaceId" = $1`, [ws.id]
      );
      const withTheme = await client.query(
        `SELECT COUNT(DISTINCT f.id) FROM "Feedback" f
         JOIN "FeedbackTheme" ft ON ft."feedbackId" = f.id
         WHERE f."workspaceId" = $1`, [ws.id]
      );
      const withoutTheme = await client.query(
        `SELECT f.id, LEFT(f.content, 60) as content FROM "Feedback" f
         WHERE f."workspaceId" = $1
           AND NOT EXISTS (
             SELECT 1 FROM "FeedbackTheme" ft WHERE ft."feedbackId" = f.id
           )
         ORDER BY f."createdAt" ASC`, [ws.id]
      );

      console.log(`\nWorkspace: "${ws.name}" (${ws.id})`);
      console.log(`  Total feedback:        ${total.rows[0].count}`);
      console.log(`  With theme assigned:   ${withTheme.rows[0].count}`);
      console.log(`  Without theme (pending): ${withoutTheme.rows.length}`);
      if (withoutTheme.rows.length > 0) {
        console.log(`  Pending feedback:`);
        withoutTheme.rows.forEach((f, i) => {
          console.log(`    [${i+1}] id=${f.id}  content="${f.content}"`);
        });
      }
    }

    // Test the exact Prisma-equivalent query for the main user
    const userRes = await client.query(
      `SELECT id, email, "workspaceId" FROM "User" WHERE email = 'jainanshi456@gmail.com' LIMIT 1`
    );
    if (userRes.rows.length > 0) {
      const u = userRes.rows[0];
      console.log(`\n--- Simulating Prisma reprocess query for jainanshi456@gmail.com ---`);
      console.log(`User workspaceId: ${u.workspaceId}`);
      const pending = await client.query(
        `SELECT f.id, LEFT(f.content, 70) as content FROM "Feedback" f
         WHERE f."workspaceId" = $1
           AND NOT EXISTS (
             SELECT 1 FROM "FeedbackTheme" ft WHERE ft."feedbackId" = f.id
           )
         ORDER BY f."createdAt" ASC`, [u.workspaceId]
      );
      console.log(`Pending unthemed feedback count: ${pending.rows.length}`);
      pending.rows.forEach((f, i) => {
        console.log(`  [${i+1}] id=${f.id}  content="${f.content}"`);
      });
    }

    console.log("\n=== Done ===\n");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
