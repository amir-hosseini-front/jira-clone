"use server";

import { hashPassword } from "@/lib/hash";
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
      members: {
        create: { userId: user.id },
      },
    },
  });

  revalidatePath("/");
  redirect(`/projects/${project.id}`);
}

export async function addProjectMember(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const email = formData.get("email") as string;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("کاربری با این ایمیل پیدا نشد");
  }

  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });
  if (existing) {
    throw new Error("این کاربر از قبل عضو پروژه هست");
  }

  await prisma.projectMember.create({
    data: { projectId, userId: user.id },
  });

  revalidatePath(`/projects/${projectId}`);
}
export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    throw new Error("همه فیلدها الزامی هستن");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("این ایمیل قبلاً ثبت شده");
  }

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword(password),
    },
  });
}
