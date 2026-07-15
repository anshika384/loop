/**
 * Diagnostic script: diagnose-themes.mjs
 * Run with: node --env-file=.env scratch/diagnose-themes.mjs
 *
 * This script directly queries the database to diagnose why
 * the Themes page shows empty even though themes exist.
 */

import { PrismaClient } from "../app/generated/prisma/index.js";

const prisma = new PrismaClient({
  log: ["warn", "error"],
});

async function diagnose() {
  console.log("\n=== LOOP Theme Clustering Diagnostic ===\n");

  try {
    // 1. Show all workspaces
    const workspaces = await prisma.workspace.findMany({
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    console.log(`[1] Total workspaces in database: ${workspaces.length}`);
    workspaces.forEach((ws, i) => {
      console.log(`    [${i + 1}] id=${ws.id}  name="${ws.name}"`);
    });

    // 2. Show all users with their workspaces
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, workspaceId: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    console.log(`\n[2] Most recent users (max 10):`);
    users.forEach((u, i) => {
      console.log(`    [${i + 1}] email=${u.email}  role=${u.role}  workspaceId=${u.workspaceId}`);
    });

    // 3. Show all themes across ALL workspaces
    const allThemes = await prisma.theme.findMany({
      include: {
        _count: { select: { feedbacks: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`\n[3] Total Theme records in ALL workspaces: ${allThemes.length}`);
    allThemes.forEach((t, i) => {
      console.log(`    [${i + 1}] id=${t.id}  name="${t.name}"  workspaceId=${t.workspaceId}  feedbackLinks=${t._count.feedbacks}`);
    });

    // 4. Show all FeedbackTheme join records
    const allFeedbackThemes = await prisma.feedbackTheme.findMany({
      include: {
        feedback: { select: { workspaceId: true, content: true } },
        theme: { select: { name: true, workspaceId: true } },
      },
      take: 20,
    });

    console.log(`\n[4] FeedbackTheme join table records (max 20): ${allFeedbackThemes.length}`);
    allFeedbackThemes.forEach((ft, i) => {
      console.log(`    [${i + 1}] feedbackId=${ft.feedbackId}  themeId=${ft.themeId}  confidence=${ft.confidence}`);
      console.log(`         theme="${ft.theme.name}"  themeWorkspace=${ft.theme.workspaceId}`);
      console.log(`         feedbackContent="${ft.feedback.content?.substring(0, 50)}"  feedbackWorkspace=${ft.feedback.workspaceId}`);
    });

    // 5. For each workspace, simulate the Themes API query
    console.log(`\n[5] Simulating /api/themes Prisma query per workspace:`);
    for (const ws of workspaces) {
      const themes = await prisma.theme.findMany({
        where: { workspaceId: ws.id },
        include: {
          feedbacks: {
            include: { feedback: true },
          },
        },
      });

      console.log(`\n    workspace="${ws.name}" (${ws.id})`);
      console.log(`    → Themes returned by query: ${themes.length}`);
      themes.forEach((t) => {
        console.log(`      Theme: "${t.name}"  feedbackLinks=${t.feedbacks.length}`);
      });
    }

    // 6. Check for workspace ID mismatches (themes in one workspace, feedbacks in another)
    console.log(`\n[6] Checking for workspace ID mismatches in FeedbackTheme:`);
    let mismatchCount = 0;
    for (const ft of allFeedbackThemes) {
      if (ft.feedback.workspaceId !== ft.theme.workspaceId) {
        console.log(`    ⚠️  MISMATCH: feedback.workspaceId=${ft.feedback.workspaceId} vs theme.workspaceId=${ft.theme.workspaceId}`);
        mismatchCount++;
      }
    }
    if (mismatchCount === 0) {
      console.log(`    ✓ No mismatches found.`);
    }

    // 7. Show the most recent feedback and check if they have theme assignments
    const recentFeedback = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        themes: {
          include: { theme: true },
        },
      },
    });

    console.log(`\n[7] Most recent 10 feedback records and their theme assignments:`);
    recentFeedback.forEach((fb, i) => {
      const themeNames = fb.themes.map((ft) => ft.theme.name).join(", ") || "NO THEME";
      console.log(`    [${i + 1}] workspaceId=${fb.workspaceId}  sentiment=${fb.sentiment}`);
      console.log(`         content="${fb.content?.substring(0, 60)}"`);
      console.log(`         themes=[${themeNames}]`);
    });

    console.log(`\n=== Diagnostic Complete ===\n`);
  } catch (err) {
    console.error("Diagnostic error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
