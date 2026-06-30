// @author codex
const {
  categories,
  domains = [],
  projectEvidence,
  questions,
  sources,
  topics,
} = await import("../src/data/index.ts");
const {
  coreDeepReadings,
  coreInterviewSpine,
  coreStudyNodes,
  coreStudyRelations,
} = await import("../src/data/coreStudy.ts");

const errors = [];

const ids = (items) => new Set(items.map((item) => item.id));
const categoryIds = ids(categories);
const domainIds = ids(domains);
const topicIds = ids(topics);
const questionIds = ids(questions);
const projectEvidenceIds = ids(projectEvidence);
const sourceIds = ids(sources);

const requireRef = (kind, ownerId, refs, targetIds, targetKind) => {
  for (const ref of refs) {
    if (!targetIds.has(ref)) {
      errors.push(`${kind} ${ownerId} references missing ${targetKind}: ${ref}`);
    }
  }
};

const categoryById = new Map(categories.map((category) => [category.id, category]));
const topicDomainId = (topic) =>
  topic.domainId ?? categoryById.get(topic.categoryId)?.domainId;

for (const topic of topics) {
  if (!categoryIds.has(topic.categoryId)) {
    errors.push(`topic ${topic.id} references missing category: ${topic.categoryId}`);
  }
  const resolvedDomainId = topicDomainId(topic);
  if (!domainIds.has(resolvedDomainId)) {
    errors.push(`topic ${topic.id} references missing domain: ${resolvedDomainId}`);
  }
  requireRef("topic", topic.id, topic.prerequisites, topicIds, "topic");
  requireRef("topic", topic.id, topic.questionIds, questionIds, "question");
  requireRef(
    "topic",
    topic.id,
    topic.projectEvidenceIds,
    projectEvidenceIds,
    "project evidence",
  );
  requireRef("topic", topic.id, topic.sourceIds, sourceIds, "source");
  if (topic.mustRemember.length < 3) {
    errors.push(`topic ${topic.id} must include at least 3 mustRemember items`);
  }
  if (topic.engineeringNotes.length < 2) {
    errors.push(`topic ${topic.id} must include at least 2 engineering notes`);
  }
  if (topic.commonPitfalls.length < 2) {
    errors.push(`topic ${topic.id} must include at least 2 common pitfalls`);
  }
  if (topic.questionIds.length < 2) {
    errors.push(`topic ${topic.id} must reference at least 2 questions`);
  }
  if (topic.projectEvidenceIds.length < 1) {
    errors.push(`topic ${topic.id} must reference at least 1 project evidence item`);
  }
  if (topic.sourceIds.length < 1) {
    errors.push(`topic ${topic.id} must reference at least 1 source`);
  }
  if (topic.deepDive) {
    for (const key of ["mentalModel", "interviewAngles", "implementationChecklist", "metrics"]) {
      if (!Array.isArray(topic.deepDive[key]) || topic.deepDive[key].length < 3) {
        errors.push(`topic ${topic.id} deepDive.${key} must include at least 3 items`);
      }
    }
    if (
      !Array.isArray(topic.deepDive.projectHooks) ||
      topic.deepDive.projectHooks.length < 2
    ) {
      errors.push(`topic ${topic.id} deepDive.projectHooks must include at least 2 items`);
    }
  }
  if (topic.domainId === "elasticsearch" || topic.scenarios?.length > 0) {
    for (const key of [
      "definition",
      "principles",
      "industrySolutions",
      "scenarios",
      "systemDesignCases",
      "engineeringDetails",
      "tradeoffs",
      "experienceBridge",
    ]) {
      if (!Array.isArray(topic[key]) || topic[key].length === 0) {
        errors.push(`deep topic ${topic.id} must include ${key}`);
      }
    }
  }
}

for (const question of questions) {
  requireRef("question", question.id, question.topicIds, topicIds, "topic");
  if (question.answerOutline.length === 0) {
    errors.push(`question ${question.id} has empty answer outline`);
  }
  if (question.followUps.length === 0) {
    errors.push(`question ${question.id} has empty follow-ups`);
  }
  if (question.projectAnswerHints.length === 0) {
    errors.push(`question ${question.id} has empty project hints`);
  }
  if (question.followUpSteps) {
    if (question.followUpSteps.length < 3) {
      errors.push(`question ${question.id} must include at least 3 structured follow-up steps`);
    }
    for (const [index, step] of question.followUpSteps.entries()) {
      if (!step.question || !step.answerHint) {
        errors.push(`question ${question.id}.followUpSteps[${index}] must include question and answerHint`);
      }
      if (!Array.isArray(step.probes) || step.probes.length < 2) {
        errors.push(`question ${question.id}.followUpSteps[${index}] must include at least 2 probes`);
      }
      requireRef(
        "question follow-up",
        `${question.id}.followUpSteps[${index}]`,
        step.relatedTopicIds,
        topicIds,
        "topic",
      );
    }
  }
}

for (const item of projectEvidence) {
  requireRef("project evidence", item.id, item.relatedTopicIds, topicIds, "topic");
}

const projectIds = new Set(projectEvidence.map((item) => item.project));
const coreReadingSections = [
  "definition",
  "principle",
  "mechanism",
  "engineering",
  "pitfalls",
  "followUps",
  "projectExpression",
  "comparisons",
  "pseudocode",
  "interviewTemplate",
];
const validAgentModules = new Set([
  "Goal",
  "State",
  "Context",
  "Tools",
  "Loop",
  "Guardrails",
  "Eval",
]);
const validCoreRelationKinds = new Set([
  "activation",
  "boundary",
  "context",
  "execution",
]);

if (domains.length === 0) {
  errors.push("expected domains to be exported from data index");
}
if (domains.filter((domain) => domain.status === "sample_ready").length < 2) {
  errors.push("expected at least 2 sample-ready domains");
}
for (const category of categories) {
  if (!domainIds.has(category.domainId)) {
    errors.push(`category ${category.id} references missing domain: ${category.domainId}`);
  }
}

const aiDeepTopics = topics.filter(
  (topic) => topicDomainId(topic) === "ai-agent-rag" && topic.scenarios?.length > 0,
);
const esDeepTopics = topics.filter(
  (topic) => topicDomainId(topic) === "elasticsearch" && topic.scenarios?.length > 0,
);
const mqDeepTopics = topics.filter(
  (topic) => topicDomainId(topic) === "mq" && topic.scenarios?.length > 0,
);
const structuredQuestions = questions.filter(
  (question) => question.followUpSteps?.length >= 3,
);
const structuredQuestionDomainIds = (question) =>
  new Set(
    question.topicIds
      .map((topicId) => topics.find((topic) => topic.id === topicId))
      .filter(Boolean)
      .map(topicDomainId),
  );
const aiStructuredQuestions = structuredQuestions.filter((question) =>
  structuredQuestionDomainIds(question).has("ai-agent-rag"),
);
const esStructuredQuestions = structuredQuestions.filter((question) =>
  structuredQuestionDomainIds(question).has("elasticsearch"),
);
const mqStructuredQuestions = structuredQuestions.filter((question) =>
  structuredQuestionDomainIds(question).has("mq"),
);
if (aiDeepTopics.length < 3) {
  errors.push(`expected at least 3 AI deep sample topics, got ${aiDeepTopics.length}`);
}
if (esDeepTopics.length < 5) {
  errors.push(`expected at least 5 Elasticsearch deep sample topics, got ${esDeepTopics.length}`);
}
if (mqDeepTopics.length < 5) {
  errors.push(`expected at least 5 MQ deep sample topics, got ${mqDeepTopics.length}`);
}
if (aiStructuredQuestions.length < 4) {
  errors.push(
    `expected at least 4 AI handwritten structured questions, got ${aiStructuredQuestions.length}`,
  );
}
if (esStructuredQuestions.length < 4) {
  errors.push(
    `expected at least 4 Elasticsearch handwritten structured questions, got ${esStructuredQuestions.length}`,
  );
}
if (mqStructuredQuestions.length < 4) {
  errors.push(
    `expected at least 4 MQ handwritten structured questions, got ${mqStructuredQuestions.length}`,
  );
}

if (topics.length < 40) {
  errors.push(`expected at least 40 topics, got ${topics.length}`);
}
if (questions.length < 80) {
  errors.push(`expected at least 80 questions, got ${questions.length}`);
}
const deepDiveCount = topics.filter((topic) => topic.deepDive).length;
const topicsMissingDeepDive = topics.filter((topic) => !topic.deepDive);
if (topicsMissingDeepDive.length > 0) {
  errors.push(
    `expected every topic to include deepDive, missing: ${topicsMissingDeepDive
      .map((topic) => topic.id)
      .join(", ")}`,
  );
}
for (const projectId of [
  "paper-agent",
  "travel-agent",
  "web-agent",
  "coding-agent",
]) {
  if (!projectIds.has(projectId)) {
    errors.push(`missing project track: ${projectId}`);
  }
}

if (coreStudyNodes.length !== 5) {
  errors.push(`expected exactly 5 core study nodes, got ${coreStudyNodes.length}`);
}
if (coreInterviewSpine.length !== coreStudyNodes.length) {
  errors.push(
    `expected core interview spine to include ${coreStudyNodes.length} steps, got ${coreInterviewSpine.length}`,
  );
}
const coreNodeIds = new Set(coreStudyNodes.map((node) => node.topicId));
const coreInterviewSpineIds = new Set();
for (const [index, step] of coreInterviewSpine.entries()) {
  const expectedNode = coreStudyNodes[index];
  if (coreInterviewSpineIds.has(step.topicId)) {
    errors.push(`core interview spine has duplicate topic: ${step.topicId}`);
  }
  coreInterviewSpineIds.add(step.topicId);
  if (!coreNodeIds.has(step.topicId)) {
    errors.push(`core interview spine references missing node: ${step.topicId}`);
  }
  if (!coreDeepReadings[step.topicId]) {
    errors.push(`core interview spine ${step.topicId} is missing deep reading`);
  }
  if (expectedNode && step.topicId !== expectedNode.topicId) {
    errors.push(
      `core interview spine step ${index + 1} should be ${expectedNode.topicId}, got ${step.topicId}`,
    );
  }
  if (typeof step.text !== "string" || step.text.length < 20) {
    errors.push(`core interview spine ${step.topicId} must include a concrete answer cue`);
  }
}
for (const node of coreStudyNodes) {
  if (!topicIds.has(node.topicId)) {
    errors.push(`core study node references missing topic: ${node.topicId}`);
  }
  const reading = coreDeepReadings[node.topicId];
  if (!reading) {
    errors.push(`core study node ${node.topicId} is missing deep reading`);
    continue;
  }
  if (!Array.isArray(reading.quickReview) || reading.quickReview.length < 3) {
    errors.push(`core deep reading ${node.topicId}.quickReview must include at least 3 items`);
  } else {
    for (const [index, item] of reading.quickReview.entries()) {
      if (!item.label || !item.content) {
        errors.push(
          `core deep reading ${node.topicId}.quickReview[${index}] must include label and content`,
        );
      }
    }
  }
  for (const key of ["short", "deep", "followup"]) {
    if (
      !reading.answerScript ||
      typeof reading.answerScript[key] !== "string" ||
      reading.answerScript[key].length < 40
    ) {
      errors.push(
        `core deep reading ${node.topicId}.answerScript.${key} must include a reusable spoken answer`,
      );
    }
  }
  if (!Array.isArray(reading.agentModules) || reading.agentModules.length < 3) {
    errors.push(`core deep reading ${node.topicId}.agentModules must include at least 3 items`);
  } else {
    for (const module of reading.agentModules) {
      if (!validAgentModules.has(module)) {
        errors.push(`core deep reading ${node.topicId}.agentModules has invalid module: ${module}`);
      }
    }
  }
  if (!Array.isArray(reading.selfChecks) || reading.selfChecks.length < 3) {
    errors.push(`core deep reading ${node.topicId}.selfChecks must include at least 3 items`);
  } else {
    for (const [index, item] of reading.selfChecks.entries()) {
      if (!item.prompt || !item.passCriteria) {
        errors.push(
          `core deep reading ${node.topicId}.selfChecks[${index}] must include prompt and passCriteria`,
        );
      }
      if (!Array.isArray(item.answerChecklist) || item.answerChecklist.length < 3) {
        errors.push(
          `core deep reading ${node.topicId}.selfChecks[${index}] must include at least 3 answerChecklist items`,
        );
      }
    }
  }
  if (!Array.isArray(reading.followUpDrills) || reading.followUpDrills.length < 3) {
    errors.push(
      `core deep reading ${node.topicId}.followUpDrills must include at least 3 items`,
    );
  } else {
    for (const [index, item] of reading.followUpDrills.entries()) {
      if (
        !item.question ||
        !item.answerHint ||
        item.question.length < 10 ||
        item.answerHint.length < 40
      ) {
        errors.push(
          `core deep reading ${node.topicId}.followUpDrills[${index}] must include question and reusable answerHint`,
        );
      }
    }
  }
  if (
    !reading.projectScript ||
    typeof reading.projectScript.scenario !== "string" ||
    typeof reading.projectScript.spoken !== "string" ||
    typeof reading.projectScript.evidence !== "string" ||
    reading.projectScript.scenario.length < 20 ||
    reading.projectScript.spoken.length < 80 ||
    reading.projectScript.evidence.length < 60
  ) {
    errors.push(
      `core deep reading ${node.topicId}.projectScript must include scenario, spoken answer, and evidence`,
    );
  }
  if (
    !reading.interviewTemplateScript ||
    typeof reading.interviewTemplateScript.oneMinute !== "string" ||
    typeof reading.interviewTemplateScript.twoMinute !== "string" ||
    typeof reading.interviewTemplateScript.pressureClose !== "string" ||
    typeof reading.interviewTemplateScript.memoryHook !== "string" ||
    reading.interviewTemplateScript.oneMinute.length < 80 ||
    reading.interviewTemplateScript.twoMinute.length < 160 ||
    reading.interviewTemplateScript.pressureClose.length < 80 ||
    reading.interviewTemplateScript.memoryHook.length < 20
  ) {
    errors.push(
      `core deep reading ${node.topicId}.interviewTemplateScript must include reusable interview scripts`,
    );
  }
  for (const section of coreReadingSections) {
    if (!Array.isArray(reading[section]) || reading[section].length < 3) {
      errors.push(
        `core deep reading ${node.topicId}.${section} must include at least 3 items`,
      );
    }
  }
}
if (coreStudyRelations.length !== coreStudyNodes.length - 1) {
  errors.push(
    `expected ${coreStudyNodes.length - 1} core relations, got ${coreStudyRelations.length}`,
  );
}
for (const [index, relation] of coreStudyRelations.entries()) {
  const expectedFrom = coreStudyNodes[index]?.topicId;
  const expectedTo = coreStudyNodes[index + 1]?.topicId;
  if (!coreStudyNodes.some((node) => node.topicId === relation.from)) {
    errors.push(`core relation references missing from node: ${relation.from}`);
  }
  if (!coreStudyNodes.some((node) => node.topicId === relation.to)) {
    errors.push(`core relation references missing to node: ${relation.to}`);
  }
  if (expectedFrom && relation.from !== expectedFrom) {
    errors.push(
      `core relation ${index + 1} should start from ${expectedFrom}, got ${relation.from}`,
    );
  }
  if (expectedTo && relation.to !== expectedTo) {
    errors.push(
      `core relation ${index + 1} should point to ${expectedTo}, got ${relation.to}`,
    );
  }
  if (!validCoreRelationKinds.has(relation.kind)) {
    errors.push(`core relation ${relation.from}->${relation.to} has invalid kind`);
  }
  if (typeof relation.label !== "string" || relation.label.length < 8) {
    errors.push(`core relation ${relation.from}->${relation.to}.label must be concrete`);
  }
  for (const key of ["premise", "interviewCue", "selfCheck"]) {
    if (typeof relation[key] !== "string" || relation[key].length < 20) {
      errors.push(
        `core relation ${relation.from}->${relation.to}.${key} must be interview-ready`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error("Data validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `Data validation passed: ${topics.length} topics, ${questions.length} questions, ${projectEvidence.length} project evidence tracks, ${deepDiveCount} deep dives.`,
);
