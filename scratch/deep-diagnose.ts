// Deep diagnostic: show feedback without themes in each workspace
import prisma from '../lib/prisma';

async function main() {
  const workspaces = await prisma.workspace.findMany({ select: { id: true, name: true } });

  for (const ws of workspaces) {
    const feedbackWithoutThemes = await prisma.feedback.findMany({
      where: { workspaceId: ws.id, themes: { none: {} } },
      select: { id: true, content: true, createdAt: true, channel: true },
      take: 5,
    });
    if (feedbackWithoutThemes.length > 0) {
      console.log(`\nWorkspace "${ws.name}" (${ws.id}) — feedback WITHOUT themes:`);
      feedbackWithoutThemes.forEach((f, i) => {
        console.log(`  [${i+1}] id=${f.id} channel=${f.channel} date=${f.createdAt.toISOString().substring(0,10)}`);
        console.log(`       content: "${f.content.substring(0, 80)}"`);
      });
    }
  }

  // Also check LOOP Enterprise specifically
  const enterpriseWs = workspaces.find(w => w.name === 'LOOP Enterprise');
  if (enterpriseWs) {
    console.log('\n\n=== LOOP Enterprise detailed theme state ===');
    const themes = await prisma.theme.findMany({
      where: { workspaceId: enterpriseWs.id },
      include: { feedbacks: true },
    });
    themes.forEach(t => {
      console.log(`Theme: "${t.name}" — ${t.feedbacks.length} linked feedbacks`);
    });
    
    const allFeedback = await prisma.feedback.count({ where: { workspaceId: enterpriseWs.id } });
    const withThemes = await prisma.feedback.count({ where: { workspaceId: enterpriseWs.id, themes: { some: {} } } });
    console.log(`\nTotal feedback: ${allFeedback}, with themes: ${withThemes}, without themes: ${allFeedback - withThemes}`);
  }
  
  console.log('\nDone.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
