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

  await assertMember(projectId, currentUser.id);

  if (!title || title.trim() === "") {
    throw new Error("عنوان نمی‌تونه خالی باشه");
  }

  await prisma.issue.create({
    data: {
      title,
      description: description || null,
      priority: priority as "LOW" | "MEDIUM" | "HIGH",
      status: "TODO",
      projectId,
      order: 0,
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

  const existing = await prisma.issue.findUnique({ where: { id } });
  if (!existing) throw new Error("کار پیدا نشد");
  await assertMember(existing.projectId, currentUser.id);

  if (!title || title.trim() === "") {
    throw new Error("عنوان نمی‌تونه خالی باشه");
  }

  const updated = await prisma.issue.update({
    where: { id },
    data: {
      title,
      description: description || null,
      priority: priority as "LOW" | "MEDIUM" | "HIGH",
      status: status as "TODO" | "IN_PROGRESS" | "DONE",
      assigneeId: assigneeId === "" ? null : assigneeId,
    },
  });

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
  newStatus: "TODO" | "IN_PROGRESS" | "DONE",
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
    status: "TODO" | "IN_PROGRESS" | "DONE";
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
  const description = formData.get("description") as string;

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
