// @author codex
import { CheckCircle2, ChevronDown, Circle } from "lucide-react";
import { useMemo, useState } from "react";
import { categories, domains, learningPaths, topics } from "../../data";
import type { LearningPath, Mastery, Topic } from "../../types/knowledge";
import { TopicDetail } from "../knowledge/TopicDetail";

type KnowledgeSystemProps = {
  selectedDomainId: string;
  selectedTopicId: string | null;
  topicMastery: Record<string, Mastery>;
  onSetTopicMastery: (topicId: string, mastery: Mastery) => void;
  onOpenTopic: (topicId: string) => void;
  onOpenQuestion: (questionId: string) => void;
};

const categoryById = new Map(categories.map((category) => [category.id, category]));
const topicById = new Map(topics.map((topic) => [topic.id, topic]));

const learningPathModeLabels: Record<LearningPath["mode"], string> = {
  foundation: "基础",
  intensive: "强化",
  interview: "面试",
  project: "项目",
};

const domainOf = (topic: Topic) =>
  topic.domainId ?? categoryById.get(topic.categoryId)?.domainId;

const topicsForDomain = (domainId: string) =>
  topics.filter((topic) => domainOf(topic) === domainId);

const groupedTopics = (domainTopics: Topic[]) =>
  categories
    .map((category) => ({
      category,
      topics: domainTopics.filter((topic) => topic.categoryId === category.id),
    }))
    .filter((group) => group.topics.length > 0);

type StudyFilter = "all" | "unlearned" | "learned";

const studyFilterOptions: Array<{
  id: StudyFilter;
  label: string;
}> = [
  { id: "all", label: "全部" },
  { id: "unlearned", label: "未学习" },
  { id: "learned", label: "已学习" },
];

const isTopicLearned = (
  topicMastery: Record<string, Mastery>,
  topicId: string,
) => {
  const mastery = topicMastery[topicId];
  return Boolean(mastery && mastery !== "new");
};

const learningPathViewsForDomain = (
  domainId: string,
  domainTopics: Topic[],
  topicMastery: Record<string, Mastery>,
) => {
  const domainTopicIds = new Set(domainTopics.map((topic) => topic.id));

  return learningPaths
    .map((path) => {
      const pathTopics = path.nodeIds
        .map((topicId) => topicById.get(topicId))
        .filter((topic): topic is Topic => Boolean(topic));
      const firstTopic = pathTopics[0];
      const domainTopicCount = pathTopics.filter((topic) =>
        domainTopicIds.has(topic.id),
      ).length;

      if (!firstTopic || domainOf(firstTopic) !== domainId || domainTopicCount === 0) {
        return null;
      }

      const completed = pathTopics.filter((topic) =>
        isTopicLearned(topicMastery, topic.id),
      ).length;
      const nextTopic =
        pathTopics.find((topic) => !isTopicLearned(topicMastery, topic.id)) ??
        pathTopics[pathTopics.length - 1];

      return {
        completed,
        nextTopic,
        path,
        total: pathTopics.length,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
};

export function GraphLearning({
  selectedDomainId,
  selectedTopicId,
  topicMastery,
  onSetTopicMastery,
  onOpenTopic,
  onOpenQuestion,
}: KnowledgeSystemProps) {
  const selectedDomain = domains.find((domain) => domain.id === selectedDomainId);
  const domainTopics = topicsForDomain(selectedDomainId);
  const [studyFilter, setStudyFilter] = useState<StudyFilter>("all");
  const [collapsedCategoryIds, setCollapsedCategoryIds] = useState<Set<string>>(
    () => new Set(),
  );
  const learnedCount = domainTopics.filter((topic) =>
    isTopicLearned(topicMastery, topic.id),
  ).length;
  const unlearnedCount = domainTopics.length - learnedCount;
  const domainPathViews = useMemo(
    () => learningPathViewsForDomain(selectedDomainId, domainTopics, topicMastery),
    [domainTopics, selectedDomainId, topicMastery],
  );
  const filteredTopics = useMemo(
    () =>
      domainTopics.filter((topic) => {
        const learned = isTopicLearned(topicMastery, topic.id);
        if (studyFilter === "learned") return learned;
        if (studyFilter === "unlearned") return !learned;
        return true;
      }),
    [domainTopics, studyFilter, topicMastery],
  );
  const selectedTopic =
    filteredTopics.find((topic) => topic.id === selectedTopicId) ?? filteredTopics[0];
  const groups = groupedTopics(filteredTopics);
  const toggleCategory = (categoryId: string) => {
    setCollapsedCategoryIds((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  if (!selectedTopic) {
    return (
      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="min-w-0 space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-base font-bold text-slate-950">
              {selectedDomain?.title ?? "专题"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {domainTopics.length} 个知识点 · 已学习 {learnedCount} · 未学习 {unlearnedCount}
            </p>
          </section>
          <nav className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="grid grid-cols-3 gap-1 rounded-md bg-slate-100 p-1">
              {studyFilterOptions.map((option) => (
                <button
                  className={`h-8 rounded px-2 text-xs font-bold transition ${
                    studyFilter === option.id
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                  key={option.id}
                  onClick={() => setStudyFilter(option.id)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="px-2 py-6 text-sm leading-6 text-slate-500">
              当前筛选下没有知识点。
            </p>
          </nav>
        </aside>
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-base font-bold text-slate-950">
            {selectedDomain?.title ?? "专题"}
          </h2>
          <p className="mt-2 text-sm text-slate-600">当前筛选下没有内容。</p>
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="min-w-0 space-y-4">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-bold text-slate-950">
            {selectedDomain?.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {domainTopics.length} 个知识点 · 已学习 {learnedCount} · 未学习 {unlearnedCount}
          </p>
        </section>

        {domainPathViews.length > 0 ? (
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-950">复习路径</h3>
              <span className="shrink-0 text-xs font-semibold text-slate-500">
                {domainPathViews.length} 条
              </span>
            </div>
            <div className="mt-3 divide-y divide-slate-100">
              {domainPathViews.map(({ completed, nextTopic, path, total }) => (
                <button
                  className="w-full py-3 text-left transition first:pt-0 last:pb-0 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                  key={path.id}
                  onClick={() => onOpenTopic(nextTopic.id)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-600">
                      {path.focusWindow ?? learningPathModeLabels[path.mode]}
                    </span>
                    <span className="shrink-0 text-[11px] font-semibold text-slate-500">
                      {completed}/{total}
                    </span>
                  </div>
                  <p className="mt-2 break-words text-sm font-bold leading-5 text-slate-900">
                    {path.title}
                  </p>
                  <p className="mt-1 break-words text-xs leading-5 text-slate-600">
                    {path.description}
                  </p>
                  <p className="mt-2 break-words text-xs font-semibold leading-5 text-slate-700">
                    当前：{nextTopic.title}
                  </p>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <nav className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-3 grid grid-cols-3 gap-1 rounded-md bg-slate-100 p-1">
            {studyFilterOptions.map((option) => {
              const isActive = studyFilter === option.id;
              return (
                <button
                  className={`h-8 rounded px-2 text-xs font-bold transition ${
                    isActive
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                  key={option.id}
                  onClick={() => setStudyFilter(option.id)}
                  type="button"
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.category.id}>
                <button
                  aria-expanded={!collapsedCategoryIds.has(group.category.id)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                  onClick={() => toggleCategory(group.category.id)}
                  type="button"
                >
                  <span>{group.category.title}</span>
                  <span className="flex items-center gap-2">
                    <span>{group.topics.length}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition ${
                        collapsedCategoryIds.has(group.category.id) ? "-rotate-90" : "rotate-0"
                      }`}
                    />
                  </span>
                </button>
                {!collapsedCategoryIds.has(group.category.id) ? (
                  <div className="mt-2 space-y-1">
                    {group.topics.map((topic) => {
                      const learned = isTopicLearned(topicMastery, topic.id);
                      const StatusIcon = learned ? CheckCircle2 : Circle;
                      return (
                        <button
                          className={`flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm leading-5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 ${
                            topic.id === selectedTopic.id
                              ? "bg-slate-900 font-semibold text-white"
                              : "text-slate-700 hover:bg-slate-100"
                          }`}
                          key={topic.id}
                          onClick={() => onOpenTopic(topic.id)}
                          type="button"
                        >
                          <StatusIcon
                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                              topic.id === selectedTopic.id
                                ? "text-white"
                                : learned
                                  ? "text-emerald-600"
                                  : "text-slate-300"
                            }`}
                          />
                          <span className="min-w-0 break-words">{topic.title}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ))}
            {groups.length === 0 ? (
              <p className="px-2 py-6 text-sm leading-6 text-slate-500">
                当前筛选下没有知识点。
              </p>
            ) : null}
          </div>
        </nav>
      </aside>

      <div className="min-w-0">
        <TopicDetail
          onSetTopicMastery={onSetTopicMastery}
          onOpenQuestion={onOpenQuestion}
          onOpenTopic={onOpenTopic}
          topicId={selectedTopic.id}
          topicMastery={topicMastery}
        />
      </div>
    </div>
  );
}
