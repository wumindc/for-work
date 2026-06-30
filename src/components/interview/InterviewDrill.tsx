// @author codex
import { CheckCircle2, ChevronDown, Circle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { categories, domains, questionById, questions, topicById } from "../../data";
import { questionMarkdownById } from "../../data/markdownContent";
import type { InterviewQuestion, QuestionStatus, Topic } from "../../types/knowledge";
import { frequencyLabels } from "../../utils/labels";
import { Badge } from "../shared/Badge";
import { MarkdownDocument } from "../shared/MarkdownDocument";

type InterviewDrillProps = {
  selectedDomainId: string;
  selectedQuestionId: string | null;
  questionStatus: Record<string, QuestionStatus>;
  onSetQuestionStatus: (questionId: string, status: QuestionStatus) => void;
  onOpenTopic: (topicId: string) => void;
  onSelectQuestion: (questionId: string) => void;
};

const categoryById = new Map(categories.map((category) => [category.id, category]));

const domainOfTopic = (topic: Topic | undefined) =>
  topic ? topic.domainId ?? categoryById.get(topic.categoryId)?.domainId : undefined;

const questionDomainIds = (question: InterviewQuestion) =>
  new Set(
    question.topicIds
      .map((topicId) => topicById.get(topicId))
      .map(domainOfTopic)
      .filter(Boolean),
  );

const firstTopicOfQuestion = (question: InterviewQuestion) =>
  question.topicIds.map((topicId) => topicById.get(topicId)).find(Boolean);

type StudyFilter = "all" | "unlearned" | "learned";

const studyFilterOptions: Array<{
  id: StudyFilter;
  label: string;
}> = [
  { id: "all", label: "全部" },
  { id: "unlearned", label: "未学习" },
  { id: "learned", label: "已学习" },
];

export function InterviewDrill({
  selectedDomainId,
  selectedQuestionId,
  questionStatus,
  onSetQuestionStatus,
  onOpenTopic,
  onSelectQuestion,
}: InterviewDrillProps) {
  const domain = domains.find((item) => item.id === selectedDomainId);
  const domainQuestions = useMemo(
    () =>
      questions.filter((question) =>
        questionDomainIds(question).has(selectedDomainId),
      ),
    [selectedDomainId],
  );
  const [studyFilter, setStudyFilter] = useState<StudyFilter>("all");
  const [collapsedCategoryIds, setCollapsedCategoryIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [activeQuestionId, setActiveQuestionId] = useState(
    selectedQuestionId ?? domainQuestions[0]?.id ?? questions[0]?.id,
  );
  const learnedCount = domainQuestions.filter(
    (question) => questionStatus[question.id] === "passed",
  ).length;
  const unlearnedCount = domainQuestions.length - learnedCount;
  const filteredQuestions = useMemo(
    () =>
      domainQuestions.filter((question) => {
        const isLearned = questionStatus[question.id] === "passed";
        if (studyFilter === "learned") return isLearned;
        if (studyFilter === "unlearned") return !isLearned;
        return true;
      }),
    [domainQuestions, questionStatus, studyFilter],
  );

  useEffect(() => {
    if (
      selectedQuestionId &&
      filteredQuestions.some((question) => question.id === selectedQuestionId)
    ) {
      setActiveQuestionId(selectedQuestionId);
      return;
    }
    if (
      filteredQuestions.length > 0 &&
      !filteredQuestions.some((question) => question.id === activeQuestionId)
    ) {
      setActiveQuestionId(filteredQuestions[0].id);
      return;
    }
    if (
      filteredQuestions.length === 0 &&
      !domainQuestions.some((question) => question.id === activeQuestionId)
    ) {
      setActiveQuestionId(domainQuestions[0]?.id ?? questions[0]?.id);
    }
  }, [activeQuestionId, domainQuestions, filteredQuestions, selectedQuestionId]);

  const activeQuestion =
    questionById.get(activeQuestionId) ?? domainQuestions[0] ?? questions[0];
  const activeTopic = activeQuestion ? firstTopicOfQuestion(activeQuestion) : undefined;
  const groupedQuestions = categories
    .map((category) => ({
      category,
      questions: filteredQuestions.filter((question) =>
        firstTopicOfQuestion(question)?.categoryId === category.id,
      ),
    }))
    .filter((group) => group.questions.length > 0);
  const activeStatus = activeQuestion
    ? questionStatus[activeQuestion.id] ?? "new"
    : "new";
  const authoredMarkdown = activeQuestion
    ? questionMarkdownById.get(activeQuestion.id)
    : undefined;
  const selectQuestion = (questionId: string) => {
    setActiveQuestionId(questionId);
    onSelectQuestion(questionId);
    window.requestAnimationFrame(() => {
      if (!window.matchMedia("(max-width: 1023px)").matches) return;
      document
        .getElementById("interview-answer-panel")
        ?.scrollIntoView({ block: "start" });
    });
  };
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

  if (!activeQuestion) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-base font-bold text-slate-950">
          {domain?.title ?? "面试训练"}
        </h2>
        <p className="mt-2 text-sm text-slate-600">当前专题还没有面试题。</p>
      </section>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="min-w-0 space-y-4">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-bold text-slate-950">{domain?.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {domainQuestions.length} 道题 · 已学习 {learnedCount} · 未学习 {unlearnedCount}
          </p>
        </section>

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
            {groupedQuestions.map((group) => (
              <div key={group.category.id}>
                <button
                  aria-expanded={!collapsedCategoryIds.has(group.category.id)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                  onClick={() => toggleCategory(group.category.id)}
                  type="button"
                >
                  <span>{group.category.title}</span>
                  <span className="flex items-center gap-2">
                    <span>{group.questions.length}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition ${
                        collapsedCategoryIds.has(group.category.id) ? "-rotate-90" : "rotate-0"
                      }`}
                    />
                  </span>
                </button>
                {!collapsedCategoryIds.has(group.category.id) ? (
                  <div className="mt-2 space-y-1">
                    {group.questions.map((question) => {
                      const isQuestionLearned = questionStatus[question.id] === "passed";
                      const StatusIcon = isQuestionLearned ? CheckCircle2 : Circle;
                      return (
                        <button
                          className={`flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm leading-5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 ${
                            question.id === activeQuestion.id
                              ? "bg-slate-900 font-semibold text-white"
                              : "text-slate-700 hover:bg-slate-100"
                          }`}
                          key={question.id}
                          onClick={() => selectQuestion(question.id)}
                          type="button"
                        >
                          <StatusIcon
                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                              question.id === activeQuestion.id
                                ? "text-white"
                                : isQuestionLearned
                                  ? "text-emerald-600"
                                  : "text-slate-300"
                            }`}
                          />
                          <span className="min-w-0 break-words">{question.title}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ))}
            {groupedQuestions.length === 0 ? (
              <p className="px-2 py-6 text-sm leading-6 text-slate-500">
                当前筛选下没有题目。
              </p>
            ) : null}
          </div>
        </nav>
      </aside>

      <article className="min-w-0 space-y-5" id="interview-answer-panel">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Badge tone={activeQuestion.frequency === "high" ? "red" : "blue"}>
                {frequencyLabels[activeQuestion.frequency]}
              </Badge>
              <Badge>难度 {activeQuestion.difficulty}</Badge>
              <Badge>{activeStatus === "passed" ? "已掌握" : "未完成"}</Badge>
            </div>
            <button
              className={`inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold transition ${
                activeStatus === "passed"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
              onClick={() =>
                onSetQuestionStatus(
                  activeQuestion.id,
                  activeStatus === "passed" ? "new" : "passed",
                )
              }
              title={activeStatus === "passed" ? "点击取消掌握" : "标记为已掌握"}
              type="button"
            >
              <CheckCircle2 className="h-4 w-4" />
              {activeStatus === "passed" ? "已掌握" : "标记掌握"}
            </button>
          </div>
          <h1 className="mt-4 text-2xl font-bold leading-9 text-slate-950">
            {activeQuestion.title}
          </h1>
          {activeTopic ? (
            <button
              className="mt-3 text-sm font-semibold text-slate-600 hover:text-slate-950"
              onClick={() => onOpenTopic(activeTopic.id)}
              type="button"
            >
              对应知识点：{activeTopic.title}
            </button>
          ) : null}
        </section>

        {authoredMarkdown ? (
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <MarkdownDocument markdown={authoredMarkdown} />
          </section>
        ) : (
          <>
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-base font-bold text-slate-950">参考答案</h2>
              <ol className="mt-4 space-y-3">
                {activeQuestion.answerOutline.map((item, index) => (
                  <li className="text-sm leading-7 text-slate-700" key={item}>
                    <span className="mr-2 font-bold text-slate-500">
                      {index + 1}.
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </section>

            {activeQuestion.keyDetails?.length || activeQuestion.examFocus?.length ? (
              <section className="grid gap-5 md:grid-cols-2">
                {activeQuestion.examFocus?.length ? (
                  <div className="rounded-lg border border-slate-200 bg-white p-5">
                    <h2 className="text-base font-bold text-slate-950">考察点</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeQuestion.examFocus.map((item) => (
                        <Badge tone="blue" key={item}>
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                {activeQuestion.keyDetails?.length ? (
                  <div className="rounded-lg border border-slate-200 bg-white p-5">
                    <h2 className="text-base font-bold text-slate-950">关键细节</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeQuestion.keyDetails.map((item) => (
                        <Badge tone="green" key={item}>
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}

            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-base font-bold text-slate-950">面试官追问</h2>
              {activeQuestion.followUpSteps?.length ? (
                <div className="mt-4 space-y-4">
                  {activeQuestion.followUpSteps.map((step, index) => (
                    <article
                      className="rounded-md border border-slate-200 bg-slate-50 p-4"
                      key={step.question}
                    >
                      <h3 className="text-sm font-bold leading-6 text-slate-950">
                        {index + 1}. {step.question}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-700">
                        {step.answerHint}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {step.probes.map((probe) => (
                          <Badge key={`${step.question}-${probe}`}>{probe}</Badge>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {activeQuestion.followUps.map((item) => (
                    <p className="text-sm leading-7 text-slate-700" key={item}>
                      {item}
                    </p>
                  ))}
                </div>
              )}
            </section>

            {activeQuestion.scenarioExtension?.length ? (
              <section className="rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="text-base font-bold text-slate-950">场景延伸</h2>
                <div className="mt-4 space-y-3">
                  {activeQuestion.scenarioExtension.map((item) => (
                    <p className="text-sm leading-7 text-slate-700" key={item}>
                      {item}
                    </p>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-base font-bold text-slate-950">常见错误</h2>
              <div className="mt-4 space-y-3">
                {activeQuestion.commonMistakes.map((item) => (
                  <p className="text-sm leading-7 text-slate-700" key={item}>
                    {item}
                  </p>
                ))}
              </div>
            </section>
          </>
        )}
      </article>
    </div>
  );
}
