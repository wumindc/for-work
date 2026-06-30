// @author codex
import { useEffect, useState } from "react";
import { projectEvidence, topicById } from "../../data";
import type { Mastery, ProjectId } from "../../types/knowledge";
import { masteryLabels, masteryTone } from "../../utils/labels";
import { Badge } from "../shared/Badge";
import { FilterButton } from "../shared/FilterButton";
import { ProgressBar } from "../shared/ProgressBar";
import { Section } from "../shared/Section";

type ProjectTrackProps = {
  selectedProjectId: ProjectId;
  topicMastery: Record<string, Mastery>;
  onSelectProject: (projectId: ProjectId) => void;
  onOpenTopic: (topicId: string) => void;
};

const projectLabels: Record<ProjectId, string> = {
  "paper-agent": "Paper Agent",
  "travel-agent": "Travel Agent",
  "web-agent": "Web Agent",
  "coding-agent": "Coding Agent",
};

export function ProjectTrack({
  selectedProjectId,
  topicMastery,
  onSelectProject,
  onOpenTopic,
}: ProjectTrackProps) {
  const [activeProjectId, setActiveProjectId] =
    useState<ProjectId>(selectedProjectId);

  useEffect(() => {
    setActiveProjectId(selectedProjectId);
  }, [selectedProjectId]);

  const selectedTrack =
    projectEvidence.find((item) => item.project === activeProjectId) ??
    projectEvidence[0];
  const readyTopics = selectedTrack.relatedTopicIds.filter(
    (topicId) => topicMastery[topicId] === "project_ready",
  ).length;

  const selectProject = (projectId: ProjectId) => {
    setActiveProjectId(projectId);
    onSelectProject(projectId);
  };

  return (
    <div className="space-y-5">
      <Section title="项目表达卡">
        <div className="flex flex-wrap gap-3">
          {(Object.keys(projectLabels) as ProjectId[]).map((projectId) => (
            <FilterButton
              active={activeProjectId === projectId}
              key={projectId}
              onClick={() => selectProject(projectId)}
            >
              {projectLabels[projectId]}
            </FilterButton>
          ))}
        </div>
      </Section>

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <main className="space-y-5">
          <Section
            action={
              <Badge tone={readyTopics === selectedTrack.relatedTopicIds.length ? "green" : "amber"}>
                {readyTopics}/{selectedTrack.relatedTopicIds.length} 可表达
              </Badge>
            }
            title={selectedTrack.title}
          >
            <p className="text-sm leading-7 text-slate-700">
              {selectedTrack.scenario}
            </p>
            <div className="mt-5">
              <ProgressBar
                label="关联节点表达准备度"
                max={selectedTrack.relatedTopicIds.length}
                value={readyTopics}
              />
            </div>
          </Section>

          <div className="grid gap-5 lg:grid-cols-2">
            <Section title="系统设计讲法">
              <ul className="space-y-3">
                {selectedTrack.architecturePoints.map((item) => (
                  <li className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="核心工具">
              <div className="flex flex-wrap gap-2">
                {selectedTrack.tools.map((tool) => (
                  <Badge key={tool} tone="blue">
                    {tool}
                  </Badge>
                ))}
              </div>
            </Section>
            <Section title="Eval 指标">
              <ul className="space-y-3">
                {selectedTrack.evalPoints.map((item) => (
                  <li className="rounded-lg bg-teal-50 p-3 text-sm leading-6 text-teal-900" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="安全边界">
              <ul className="space-y-3">
                {selectedTrack.safetyPoints.map((item) => (
                  <li className="rounded-lg bg-red-50 p-3 text-sm leading-6 text-red-900" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          <Section title="简历 Bullet">
            <p className="rounded-lg bg-slate-950 p-4 text-sm leading-7 text-white">
              {selectedTrack.resumeBullet}
            </p>
          </Section>
        </main>

        <aside className="space-y-5">
          <Section title="关联知识节点">
            <div className="space-y-3">
              {selectedTrack.relatedTopicIds.map((topicId) => {
                const topic = topicById.get(topicId);
                const mastery = topicMastery[topicId] ?? "new";
                if (!topic) return null;
                return (
                  <button
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-teal-200 hover:bg-teal-50/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                    key={topicId}
                    onClick={() => onOpenTopic(topicId)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">
                        {topic.title}
                      </p>
                      <Badge tone={masteryTone(mastery)}>
                        {masteryLabels[mastery]}
                      </Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                      {topic.summary}
                    </p>
                  </button>
                );
              })}
            </div>
          </Section>
        </aside>
      </div>
    </div>
  );
}
