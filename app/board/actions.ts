"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createIssue(formData: FormData) {
  const title = formData.get("title") as string;
  const priority = formData.get("priority") as string;
  const projectId = formData.get("projectId") as string;

  if (!title || title.trim() === "") {
    throw new Error("عنوان نمی‌تونه خالی باشه");
  }

  await prisma.issue.create({
    data: {
      title,
      priority: priority as "LOW" | "MEDIUM" | "HIGH",
      status: "TODO",
      projectId,
      order: 0,
    },
  });

  revalidatePath("/board");
}
