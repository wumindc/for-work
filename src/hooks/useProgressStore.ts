// @author codex
import { useEffect, useMemo, useState } from "react";
import type { Mastery, QuestionStatus } from "../types/knowledge";

const storageKey = "agent-interview-progress-v1";

export type ProgressState = {
  topicMastery: Record<string, Mastery>;
  questionStatus: Record<string, QuestionStatus>;
};

export type ProgressActions = {
  setTopicMastery: (topicId: string, mastery: Mastery) => void;
  setQuestionStatus: (questionId: string, status: QuestionStatus) => void;
  resetProgress: () => void;
};

const defaultProgress: ProgressState = {
  topicMastery: {},
  questionStatus: {},
};

const readProgress = (): ProgressState => {
  if (typeof window === "undefined") {
    return defaultProgress;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return defaultProgress;
  }

  try {
    const stored = JSON.parse(raw) as Partial<ProgressState>;
    return {
      ...defaultProgress,
      topicMastery: stored.topicMastery ?? defaultProgress.topicMastery,
      questionStatus: stored.questionStatus ?? defaultProgress.questionStatus,
    };
  } catch {
    return defaultProgress;
  }
};

export function useProgressStore(): ProgressState & ProgressActions {
  const [progress, setProgress] = useState<ProgressState>(() => readProgress());

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [progress]);

  const actions = useMemo<ProgressActions>(
    () => ({
      setTopicMastery: (topicId, mastery) => {
        setProgress((current) => ({
          ...current,
          topicMastery: {
            ...current.topicMastery,
            [topicId]: mastery,
          },
        }));
      },
      setQuestionStatus: (questionId, status) => {
        setProgress((current) => ({
          ...current,
          questionStatus: {
            ...current.questionStatus,
            [questionId]: status,
          },
        }));
      },
      resetProgress: () => {
        setProgress(defaultProgress);
      },
    }),
    [],
  );

  return {
    ...progress,
    ...actions,
  };
}
