// @author codex
import { BookOpen, ChevronDown, MessagesSquare, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { GraphLearning } from "../components/graph/GraphLearning";
import { InterviewDrill } from "../components/interview/InterviewDrill";
import { domains, categories, topics } from "../data";
import { useProgressStore } from "../hooks/useProgressStore";

type View = "knowledge" | "interview";

const navItems: Array<{
  id: View;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "knowledge", label: "知识体系", icon: BookOpen },
  { id: "interview", label: "面试训练", icon: MessagesSquare },
];

const categoryDomainById = new Map(
  categories.map((category) => [category.id, category.domainId]),
);

const domainHasTopics = (domainId: string) =>
  topics.some(
    (topic) => (topic.domainId ?? categoryDomainById.get(topic.categoryId)) === domainId,
  );

export function App() {
  const progress = useProgressStore();
  const [view, setView] = useState<View>("knowledge");
  const availableDomains = useMemo(
    () => domains.filter((domain) => domainHasTopics(domain.id)),
    [],
  );
  const [selectedDomainId, setSelectedDomainId] = useState(
    availableDomains[0]?.id ?? "ai-agent-rag",
  );
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(
    "agent-definition",
  );
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    "q-ai-agent-boundary-structured",
  );

  const openTopic = (topicId: string) => {
    const topic = topics.find((item) => item.id === topicId);
    const domainId = topic
      ? topic.domainId ?? categoryDomainById.get(topic.categoryId)
      : undefined;
    if (domainId) setSelectedDomainId(domainId);
    setSelectedTopicId(topicId);
    setView("knowledge");
    window.requestAnimationFrame(() => window.scrollTo({ left: 0, top: 0 }));
  };

  const openQuestion = (questionId: string) => {
    setSelectedQuestionId(questionId);
    setView("interview");
    window.requestAnimationFrame(() => window.scrollTo({ left: 0, top: 0 }));
  };

  const changeDomain = (domainId: string) => {
    setSelectedDomainId(domainId);
    const firstTopic = topics.find(
      (topic) =>
        (topic.domainId ?? categoryDomainById.get(topic.categoryId)) === domainId,
    );
    setSelectedTopicId(firstTopic?.id ?? null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 print:bg-white">
      <header className="border-b border-slate-200 bg-white print:hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <h1 className="text-base font-bold text-slate-950">
              研发面试知识体系
            </h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <nav className="flex gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    className={`flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 ${
                      view === item.id
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                    key={item.id}
                    onClick={() => setView(item.id)}
                    type="button"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              专题
              <span className="relative inline-flex">
                <select
                  className="h-10 min-w-44 appearance-none rounded-md border border-slate-200 bg-white py-0 pl-3 pr-9 text-sm font-bold text-slate-900 shadow-sm outline-none transition hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  onChange={(event) => changeDomain(event.target.value)}
                  value={selectedDomainId}
                >
                  {availableDomains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </span>
            </label>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5">
        {view === "knowledge" ? (
          <GraphLearning
            onSetTopicMastery={progress.setTopicMastery}
            onOpenQuestion={openQuestion}
            onOpenTopic={openTopic}
            selectedDomainId={selectedDomainId}
            selectedTopicId={selectedTopicId}
            topicMastery={progress.topicMastery}
          />
        ) : null}
        {view === "interview" ? (
          <InterviewDrill
            onOpenTopic={openTopic}
            onSelectQuestion={openQuestion}
            onSetQuestionStatus={progress.setQuestionStatus}
            questionStatus={progress.questionStatus}
            selectedDomainId={selectedDomainId}
            selectedQuestionId={selectedQuestionId}
          />
        ) : null}
      </main>
    </div>
  );
}
