export type Status = "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type ProjectType = "KANBAN" | "SCRUM";
export type SprintStatus = "PLANNED" | "ACTIVE" | "COMPLETED";

export type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  author: { name: string };
};

export type Activity = {
  id: string;
  type: string;
  fromValue: string | null;
  toValue: string | null;
  createdAt: Date;
  user: { name: string };
};

export type Issue = {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  dueDate: Date | null;
  storyPoints: number | null;
  sprintId: string | null;
  number: number;
  order: number;
  assignee: { id: string; name: string } | null;
  comments: Comment[];
  activities: Activity[];
};
export type ProjectSummary = {
  id: string;
  name: string;
  key: string;
};
export type Sprint = {
  id: string;
  name: string;
  goal: string | null;
  status: SprintStatus;
  startDate: Date | null;
  endDate: Date | null;
};

export type Member = {
  id: string;
  user: { id: string; name: string; email: string };
};

export type Project = {
  id: string;
  name: string;
  key: string;
  type: ProjectType;
  issues: Issue[];
  members: Member[];
  sprints: Sprint[];
};
