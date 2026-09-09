"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProject(formData: FormData) {
  const name = formData.get("name") as string;
  const key = formData.get("key") as string;

  if (!name || !key) {
    throw new Error("نام و کد پروژه الزامی هستن");
  }

  const user = await prisma.user.findFirst();
  if (!user) throw new Error("هیچ کاربری پیدا نشد");

  const project = await prisma.project.create({
    data: {
      name,
      key: key.toUpperCase(),
      ownerId: user.id,
    },
  });

  revalidatePath("/");
  redirect(`/projects/${project.id}`);
}
