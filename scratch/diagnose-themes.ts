// diagnose-themes.ts - Diagnostic script for Theme Clustering state
import prisma from '../lib/prisma';

async function main() {
  console.log('=== STEP 1: All Workspaces ===');
  const workspaces = await prisma.workspace.findMany({ select: { id: true, name: true } });
  console.log(JSON.stringify(workspaces, null, 2));

  for (const ws of workspaces) {
    console.log(`\n=== Workspace: "${ws.name}" (${ws.id}) ===`);

    const feedbackCount = await prisma.feedback.count({ where: { workspaceId: ws.id } });
    console.log('Total feedback records:', feedbackCount);

    const themeCount = await prisma.theme.count({ where: { workspaceId: ws.id } });
    console.log('Total Theme records:', themeCount);

    const themes = await prisma.theme.findMany({
      where: { workspaceId: ws.id },
      select: { id: true, name: true, color: true, createdAt: true },
    });
    console.log('Themes:', JSON.stringify(themes, null, 2));

    const ftCount = await (prisma as any).feedbackTheme.count({
      where: { feedback: { workspaceId: ws.id } },
    });
    console.log('FeedbackTheme join records:', ftCount);

    const feedbackWithThemes = await prisma.feedback.count({
      where: { workspaceId: ws.id, themes: { some: {} } },
    });
    const feedbackWithoutThemes = await prisma.feedback.count({
      where: { workspaceId: ws.id, themes: { none: {} } },
    });
    console.log('Feedback WITH themes:', feedbackWithThemes);
    console.log('Feedback WITHOUT themes (need reprocessing):', feedbackWithoutThemes);
  }

  console.log('\n=== STEP 2: GEMINI_API_KEY check ===');
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log('GEMINI_API_KEY is NOT SET in process.env');
  } else {
    console.log('GEMINI_API_KEY is set, prefix:', key.substring(0, 10) + '...');
  }

  console.log('\nDone.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
