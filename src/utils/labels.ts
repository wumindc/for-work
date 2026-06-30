// @author codex
import type { Frequency, Mastery, Priority, QuestionStatus, RoleTag } from "../types/knowledge";

export const masteryLabels: Record<Mastery, string> = {
  new: "未学",
  learning: "学习中",
  can_explain: "能复述",
  can_answer_followups: "能接追问",
  project_ready: "能项目化",
};

export const questionStatusLabels: Record<QuestionStatus, string> = {
  new: "未练",
  practicing: "练习中",
  missed: "需复盘",
  passed: "能讲清",
};

export const priorityLabels: Record<Priority, string> = {
  must: "必会",
  follow_up: "追问",
  extension: "扩展",
};

export const frequencyLabels: Record<Frequency, string> = {
  high: "高频",
  medium: "中频",
  low: "低频",
};

export const roleLabels: Record<RoleTag, string> = {
  development: "开发岗",
  algorithm: "算法岗",
  general: "通用",
};

export const masteryRank: Record<Mastery, number> = {
  new: 0,
  learning: 1,
  can_explain: 2,
  can_answer_followups: 3,
  project_ready: 4,
};

export const masteryTone = (mastery: Mastery) => {
  if (mastery === "project_ready") return "green";
  if (mastery === "can_answer_followups") return "blue";
  if (mastery === "can_explain") return "violet";
  if (mastery === "learning") return "amber";
  return "neutral";
};

export const statusTone = (status: QuestionStatus) => {
  if (status === "passed") return "green";
  if (status === "missed") return "red";
  if (status === "practicing") return "amber";
  return "neutral";
};
