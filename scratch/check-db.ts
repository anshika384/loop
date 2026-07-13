import prisma from "../lib/prisma";

async function main() {
  console.log("Fetching users from DB...");
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      workspaceId: true,
    }
  });
  console.log("Users:", JSON.stringify(users, null, 2));

  console.log("Fetching invitations from DB...");
  const invites = await prisma.invitation.findMany();
  console.log("Invitations:", JSON.stringify(invites, null, 2));
}

main().catch(err => {
  console.error(err);
});
