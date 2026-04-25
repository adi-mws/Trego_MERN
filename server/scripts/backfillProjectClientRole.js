import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import { Project } from "../features/projects/project.model.js";
import { ProjectMember } from "../features/projects/projectMember.model.js";
import { WorkspaceMember } from "../features/workspaces/workspaceMember.model.js";
import { ensureProjectClientRole } from "../features/projects/project.service.js";

async function run() {
  await connectDB();

  const projects = await Project.find({}).select("_id workspace").lean();

  let scanned = 0;
  let createdOrUpdated = 0;

  for (const project of projects) {
    scanned += 1;

    const clientRole = await ensureProjectClientRole(project._id);
    createdOrUpdated += 1;

    const clientWorkspaceMembers = await WorkspaceMember.find({
      workspaceId: project.workspace,
      role: "CLIENT",
    })
      .select("userId")
      .lean();

    if (clientWorkspaceMembers.length === 0) {
      continue;
    }

    const clientUserIds = clientWorkspaceMembers.map((member) => member.userId);
    const projectMembers = await ProjectMember.find({
      project: project._id,
      user: { $in: clientUserIds },
    }).select("_id");

    if (projectMembers.length === 0) {
      continue;
    }

    await ProjectMember.updateMany(
      {
        _id: { $in: projectMembers.map((member) => member._id) },
      },
      {
        $set: {
          roles: [clientRole._id],
        },
      }
    );
  }

  console.log(
    `Project client role backfill complete. scanned=${scanned} createdOrUpdated=${createdOrUpdated}`
  );

  process.exit(0);
}

run().catch((error) => {
  console.error("Project client role backfill failed:", error);
  process.exit(1);
});
