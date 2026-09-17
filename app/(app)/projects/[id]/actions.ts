"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";

async function assertMember(projectId: string, userId: string) {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!membership) throw new Error("دسترسی نداری");
}

export async function createIssue(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("باید وارد شوی");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as string;
  const projectId = formData.get("projectId") as string;
  const status = (formData.get("status") as string) || "TODO";

  await assertMember(projectId, currentUser.id);

  if (!title || title.trim() === "") {
    throw new Error("عنوان نمی‌تونه خالی باشه");
  }
  const lastIssue = await prisma.issue.findFirst({
    where: { projectId },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const nextNumber = (lastIssue?.number ?? 0) + 1;
  const issue = await prisma.issue.create({
    data: {
      title,
      description: description || null,
      priority: priority as "LOW" | "MEDIUM" | "HIGH",
      status: status as "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE",
      projectId,
      number: nextNumber,
      order: 0,
    },
  });

  await prisma.activity.create({
    data: {
      type: "CREATED",
      issueId: issue.id,
      userId: currentUser.id,
    },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function updateIssue(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("باید وارد شوی");

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as string;
  const status = formData.get("status") as string;
  const assigneeId = formData.get("assigneeId") as string;
  const dueDateRaw = formData.get("dueDate") as string;
  const storyPointsRaw = formData.get("storyPoints") as string;

  const existing = await prisma.issue.findUnique({
    where: { id },
    include: { assignee: true },
  });
  if (!existing) throw new Error("کار پیدا نشد");
  await assertMember(existing.projectId, currentUser.id);

  if (!title || title.trim() === "") {
    throw new Error("عنوان نمی‌تونه خالی باشه");
  }

  const newAssigneeId = assigneeId === "" ? null : assigneeId;

  const updated = await prisma.issue.update({
    where: { id },
    data: {
      title,
      description: description || null,
      priority: priority as "LOW" | "MEDIUM" | "HIGH",
      status: status as "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE",
      assigneeId: newAssigneeId,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      storyPoints: storyPointsRaw ? parseInt(storyPointsRaw, 10) : null,
    },
  });

  const activities: { type: string; fromValue?: string; toValue?: string }[] =
    [];

  if (existing.status !== updated.status) {
    activities.push({
      type: "STATUS_CHANGED",
      fromValue: existing.status,
      toValue: updated.status,
    });
  }
  if (existing.priority !== updated.priority) {
    activities.push({
      type: "PRIORITY_CHANGED",
      fromValue: existing.priority,
      toValue: updated.priority,
    });
  }
  if (existing.assigneeId !== newAssigneeId) {
    const newAssignee = newAssigneeId
      ? await prisma.user.findUnique({ where: { id: newAssigneeId } })
      : null;
    activities.push({
      type: "ASSIGNEE_CHANGED",
      fromValue: existing.assignee?.name ?? "بدون مسئول",
      toValue: newAssignee?.name ?? "بدون مسئول",
    });
  }

  if (activities.length > 0) {
    await prisma.activity.createMany({
      data: activities.map((a) => ({
        ...a,
        issueId: id,
        userId: currentUser.id,
      })),
    });
  }

  revalidatePath(`/projects/${updated.projectId}`);
}

export async function deleteIssue(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("باید وارد شوی");

  const id = formData.get("id") as string;

  const existing = await prisma.issue.findUnique({ where: { id } });
  if (!existing) throw new Error("کار پیدا نشد");
  await assertMember(existing.projectId, currentUser.id);

  const deleted = await prisma.issue.delete({ where: { id } });

  revalidatePath(`/projects/${deleted.projectId}`);
}

export async function updateIssueStatus(
  issueId: string,
  newStatus: "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE",
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("باید وارد شوی");

  const existing = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!existing) throw new Error("کار پیدا نشد");
  await assertMember(existing.projectId, currentUser.id);

  await prisma.issue.update({
    where: { id: issueId },
    data: { status: newStatus },
  });

  revalidatePath(`/projects/${existing.projectId}`);
}

export async function reorderIssues(
  updates: {
    id: string;
    status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";
    order: number;
  }[],
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("باید وارد شوی");

  if (updates.length === 0) return;

  const firstIssue = await prisma.issue.findUnique({
    where: { id: updates[0].id },
  });
  if (!firstIssue) throw new Error("کار پیدا نشد");
  await assertMember(firstIssue.projectId, currentUser.id);

  await prisma.$transaction(
    updates.map((u) =>
      prisma.issue.update({
        where: { id: u.id },
        data: { status: u.status, order: u.order },
      }),
    ),
  );

  revalidatePath(`/projects/${firstIssue.projectId}`);
}

export async function createComment(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("باید وارد شوی");

  const issueId = formData.get("issueId") as string;
  const content = formData.get("content") as string;

  if (!content || content.trim() === "") {
    throw new Error("کامنت نمی‌تونه خالی باشه");
  }

  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue) throw new Error("کار پیدا نشد");
  await assertMember(issue.projectId, currentUser.id);

  await prisma.comment.create({
    data: {
      content,
      issueId,
      authorId: currentUser.id,
    },
  });

  revalidatePath(`/projects/${issue.projectId}`);
}

// ---------- Sprint actions ----------

export async function createSprint(projectId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("باید وارد شوی");
  await assertMember(projectId, currentUser.id);

  const count = await prisma.sprint.count({ where: { projectId } });

  await prisma.sprint.create({
    data: {
      name: `Sprint ${count + 1}`,
      projectId,
    },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function startSprint(sprintId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("باید وارد شوی");

  const sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
  if (!sprint) throw new Error("اسپرینت پیدا نشد");
  await assertMember(sprint.projectId, currentUser.id);

  const activeExists = await prisma.sprint.findFirst({
    where: { projectId: sprint.projectId, status: "ACTIVE" },
  });
  if (activeExists) {
    throw new Error("یه اسپرینت فعال دیگه از قبل وجود داره");
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 14);

  await prisma.sprint.update({
    where: { id: sprintId },
    data: { status: "ACTIVE", startDate, endDate },
  });

  revalidatePath(`/projects/${sprint.projectId}`);
}

export async function completeSprint(sprintId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("باید وارد شوی");

  const sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
  if (!sprint) throw new Error("اسپرینت پیدا نشد");
  await assertMember(sprint.projectId, currentUser.id);

  // کارهای تمام‌نشده برمی‌گردن به بک‌لاگ؛ کارهای انجام‌شده به‌عنوان تاریخچه می‌مونن
  await prisma.issue.updateMany({
    where: { sprintId, status: { not: "DONE" } },
    data: { sprintId: null, status: "BACKLOG" },
  });

  await prisma.sprint.update({
    where: { id: sprintId },
    data: { status: "COMPLETED" },
  });

  revalidatePath(`/projects/${sprint.projectId}`);
}

export async function moveIssueToSprint(
  issueId: string,
  sprintId: string | null,
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("باید وارد شوی");

  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue) throw new Error("کار پیدا نشد");
  await assertMember(issue.projectId, currentUser.id);

  await prisma.issue.update({
    where: { id: issueId },
    data: {
      sprintId,
      status: sprintId
        ? issue.status === "BACKLOG"
          ? "TODO"
          : issue.status
        : "BACKLOG",
    },
  });

  revalidatePath(`/projects/${issue.projectId}`);
}
