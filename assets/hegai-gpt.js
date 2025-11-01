const storageKey = "hegaiGPT.conversations.v1";
const state = {
  conversations: [],
  activeConversationId: null,
  activeSources: new Set(["chats", "profiles", "media"]),
};

const quickPrompts = [
  "Собери дайджест из канала #weekly-sync за последнюю неделю",
  "Кто из участников занимается мультимодальными исследованиями?",
  "Какие записи из медиатеки советуешь продакт-менеджеру?",
  "Подскажи, кто может помочь с запуском пилота в enterprise",
];

const knowledgeSnippets = [
  {
    keywords: ["weekly", "дайджест", "неделю", "канал"],
    response:
      "В канале #weekly-sync обсуждали подготовку к демо-дню и обновление дорожной карты. Мария Новак поделилась прогрессом по мультимодальной модели, а продуктовая группа планирует воркшоп по новым кейсам внедрения.",
    followUps: [
      "Сделай краткий список задач по демо-дню",
      "Кто будет вести воркшоп и когда?",
    ],
  },
  {
    keywords: ["участ", "мультимод", "исслед"],
    response:
      "Мультимодальными исследованиями занимаются Мария Новак и команда NeuroLab. Они проводят эксперименты с генерацией дизайнов и ведут воркшоп по оценке LLM.",
    followUps: [
      "Покажи профиль Марии Новак",
      "Кто ещё подключён к рабочей группе LLM?",
    ],
  },
  {
    keywords: ["медиатек", "запис", "продакт"],
    response:
      "В медиатеке есть запись " +
      '"Product Ops для AI-продуктов" от Антона Волкова и кейс внедрения AI copilots от команды Launchpad.',
    followUps: [
      "Скинь ссылку на Product Ops сессию",
      "Есть ли материалы по онбордингу команд?",
    ],
  },
  {
    keywords: ["пилот", "enterprise", "запуск"],
    response:
      "Для пилотов в enterprise можно обратиться к Игорю Синицыну — он ведёт трек go-to-market и помогает готовить предложения корпорациям. Также полезна группа по GTM-экспериментам.",
    followUps: [
      "Расскажи о ближайших GTM-встречах",
      "Кого подключить к отработке презентации?",
    ],
  },
];

const defaultFollowUps = [
  "Что нового произошло в клубе?",
  "Есть ли свежие видео в медиатеке?",
  "С кем познакомиться новичку?",
];

const summaryTemplate = `# Еженедельный отчёт по heg.ai\n\n## Ключевые события\n- \n- \n\n## Важные участники недели\n- \n- \n\n## Материалы и записи\n- \n- \n`;

const elements = {
  conversationList: document.querySelector("#conversation-list"),
  insightList: document.querySelector("#insight-list"),
  newConversation: document.querySelector("#new-conversation"),
  search: document.querySelector("#conversation-search"),
  sidebar: document.querySelector("#sidebar"),
  sidebarToggle: document.querySelector("#sidebar-toggle"),
  sidebarBackdrop: document.querySelector("#sidebar-backdrop"),
  messageList: document.querySelector("#message-list"),
  messageScroll: document.querySelector("#message-scroll"),
  emptyState: document.querySelector("#empty-state"),
  emptyPrompts: document.querySelector("#empty-prompts"),
  promptSuggestions: document.querySelector("#prompt-suggestions"),
  composerForm: document.querySelector("#composer-form"),
  composerInput: document.querySelector("#composer-input"),
  insertSummary: document.querySelector("#insert-summary"),
  sourceToggles: document.querySelectorAll(".source-toggle"),
};

document.addEventListener("DOMContentLoaded", () => {
  restoreState();
  ensureDemoConversation();
  bindEvents();
  renderConversations();
  renderActiveConversation();
  renderQuickPrompts(elements.emptyPrompts, quickPrompts);
});

const mobileBreakpoint = 1100;

function bindEvents() {
  elements.newConversation?.addEventListener("click", () => {
    const conversation = createConversation();
    state.conversations.unshift(conversation);
    state.activeConversationId = conversation.id;
    saveState();
    renderConversations();
    renderActiveConversation();
    focusComposer();
    closeSidebar();
  });

  elements.search?.addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase();
    const cards = elements.conversationList?.querySelectorAll(
      ".conversation-item"
    );
    cards?.forEach((card) => {
      const text = card.dataset.search ?? "";
      card.hidden = !text.includes(query);
    });
  });

  elements.composerForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = elements.composerInput?.value.trim();
    if (!value) return;
    handleUserMessage(value);
  });

  elements.insertSummary?.addEventListener("click", () => {
    if (!elements.composerInput) return;
    const current = elements.composerInput.value;
    const separator = current && !current.endsWith("\n") ? "\n\n" : "";
    elements.composerInput.value = current + separator + summaryTemplate;
    elements.composerInput.focus();
  });

  elements.sourceToggles.forEach((button) => {
    button.addEventListener("click", () => {
      const source = button.dataset.source;
      if (!source) return;
      if (state.activeSources.has(source) && state.activeSources.size === 1) {
        return; // минимум один источник должен оставаться активным
      }
      if (state.activeSources.has(source)) {
        state.activeSources.delete(source);
        button.classList.remove("is-active");
      } else {
        state.activeSources.add(source);
        button.classList.add("is-active");
      }
      if (state.activeConversationId) {
        const conversation = getActiveConversation();
        if (conversation) {
          conversation.sources = Array.from(state.activeSources);
          saveState();
        }
      }
    });
  });

  elements.sidebarToggle?.addEventListener("click", () => {
    if (elements.sidebar?.classList.contains("is-open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  elements.sidebarBackdrop?.addEventListener("click", () => closeSidebar());

  window.addEventListener("resize", () => {
    if (window.innerWidth >= mobileBreakpoint) {
      closeSidebar();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSidebar();
    }
  });
}

function openSidebar() {
  elements.sidebar?.classList.add("is-open");
  elements.sidebarBackdrop?.classList.add("is-active");
}

function closeSidebar() {
  elements.sidebar?.classList.remove("is-open");
  elements.sidebarBackdrop?.classList.remove("is-active");
}

function renderQuickPrompts(container, prompts) {
  if (!container) return;
  container.innerHTML = "";
  prompts.forEach((prompt) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "prompt-pill";
    button.textContent = prompt;
    button.addEventListener("click", () => handleUserMessage(prompt));
    container.appendChild(button);
  });
}

function restoreState() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      state.conversations = [];
      state.activeConversationId = null;
      return;
    }
    const parsed = JSON.parse(raw);
    state.conversations = Array.isArray(parsed.conversations)
      ? parsed.conversations
      : [];
    state.activeConversationId = parsed.activeConversationId ?? null;
    if (parsed.activeSources) {
      state.activeSources = new Set(parsed.activeSources);
      elements.sourceToggles.forEach((button) => {
        if (state.activeSources.has(button.dataset.source)) {
          button.classList.add("is-active");
        } else {
          button.classList.remove("is-active");
        }
      });
    }
  } catch (error) {
    console.warn("Не удалось восстановить историю", error);
    state.conversations = [];
    state.activeConversationId = null;
  }
}

function saveState() {
  const payload = {
    conversations: state.conversations,
    activeConversationId: state.activeConversationId,
    activeSources: Array.from(state.activeSources),
  };
  localStorage.setItem(storageKey, JSON.stringify(payload));
}

function ensureDemoConversation() {
  if (state.conversations.length) return;

  const now = Date.now();
  const conversation = createConversation();
  conversation.title = "Как HegaiGPT помогает";

  const intro = createMessage(
    "assistant",
    "Привет! Я помогу ориентироваться в активностях heg.ai, подсвечу встречи и интересных участников, а скоро подключу живые данные."
  );
  intro.createdAt = now - 1000 * 60 * 90;
  intro.followUps = [
    "Что ты знаешь про медиатеку?",
    "Кому задать вопрос про исследования?",
  ];

  const question = createMessage(
    "user",
    "Собери дайджест по #weekly-sync за прошлую неделю"
  );
  question.createdAt = now - 1000 * 60 * 80;

  const answer = createMessage(
    "assistant",
    "Вот краткий дайджест по #weekly-sync:\n- команда продуктов подготовила чек-лист к демо-дню;\n- Мария Новак поделилась прогрессом мультимодальной модели;\n- обсуждали, кого привлечь к enterprise-пилотам.\n\nМогу подсветить детали по задачам или собрать контакты спикеров."
  );
  answer.createdAt = now - 1000 * 60 * 78;
  answer.followUps = [
    "Покажи задачи к демо-дню",
    "Кто ведёт enterprise-пилоты?",
  ];

  conversation.messages.push(intro, question, answer);
  conversation.createdAt = intro.createdAt;

  const insightCreatedAt = now - 1000 * 60 * 75;
  conversation.insights.push({
    id: crypto.randomUUID(),
    messageId: answer.id,
    title: "Дайджест недели heg.ai",
    content: truncate(answer.content, 220),
    createdAt: insightCreatedAt,
  });

  conversation.updatedAt = insightCreatedAt;

  state.conversations = [conversation];
  state.activeConversationId = conversation.id;
  saveState();
}

function createConversation() {
  const id = crypto.randomUUID();
  return {
    id,
    title: "Новый диалог",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    insights: [],
    sources: Array.from(state.activeSources),
  };
}

function getActiveConversation() {
  return state.conversations.find(({ id }) => id === state.activeConversationId);
}

function renderConversations() {
  const container = elements.conversationList;
  if (!container) return;
  container.innerHTML = "";
  if (!state.conversations.length) {
    const placeholder = document.createElement("div");
    placeholder.className = "sidebar-placeholder";
    placeholder.innerHTML =
      "Начните первый диалог, чтобы HegaiGPT запомнил ваши вопросы и инсайты.";
    container.appendChild(placeholder);
    renderInsights();
    return;
  }

  state.conversations
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .forEach((conversation) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "conversation-item";
      if (conversation.id === state.activeConversationId) {
        item.classList.add("is-active");
      }
      const lastMessage = conversation.messages.at(-1)?.content ?? "";
      item.dataset.search = (
        conversation.title + " " + conversation.messages.map((m) => m.content).join(" ")
      ).toLowerCase();
      item.innerHTML = `
        <div class="conversation-meta">
          <strong>${escapeHtml(conversation.title)}</strong>
          <time>${formatRelativeTime(conversation.updatedAt)}</time>
        </div>
        <p>${escapeHtml(truncate(lastMessage, 72))}</p>
        <span class="conversation-tags">${conversation.sources
          .map((source) => renderSourceTag(source))
          .join(" ")}</span>
      `;
      item.addEventListener("click", () => {
        state.activeConversationId = conversation.id;
        saveState();
        renderConversations();
        renderActiveConversation();
        closeSidebar();
      });
      container.appendChild(item);
    });

  renderInsights();
}

function renderSourceTag(source) {
  switch (source) {
    case "chats":
      return '<span class="source-tag">Чаты</span>';
    case "profiles":
      return '<span class="source-tag">Профили</span>';
    case "media":
      return '<span class="source-tag">Медиатека</span>';
    default:
      return "";
  }
}

function renderActiveConversation() {
  const conversation = getActiveConversation();
  const hasMessages = conversation && conversation.messages.length > 0;
  elements.messageList.innerHTML = "";
  elements.promptSuggestions.innerHTML = "";
  elements.emptyState.style.display = hasMessages ? "none" : "";

  if (!conversation) {
    renderQuickPrompts(elements.emptyPrompts, quickPrompts);
    bindDynamicButtons();
    return;
  }

  if (!hasMessages) {
    renderQuickPrompts(elements.emptyPrompts, quickPrompts);
    bindDynamicButtons();
    return;
  }

  conversation.messages.forEach((message) => {
    const bubble = document.createElement("article");
    bubble.className = `message ${message.role}`;
    const avatarLabel = message.role === "user" ? "Вы" : "HegaiGPT";
    bubble.innerHTML = `
      <div class="message-avatar">${avatarLabel}</div>
      <div class="message-bubble">
        ${renderMarkdown(message.content)}
        <footer class="message-footer">
          <time>${formatRelativeTime(message.createdAt)}</time>
          ${renderMessageActions(message)}
        </footer>
        ${renderFollowUps(message)}
      </div>
    `;
    elements.messageList.appendChild(bubble);
  });

  renderQuickPrompts(elements.promptSuggestions, quickPrompts.slice(0, 3));
  scrollMessagesToBottom();
  bindDynamicButtons();
}

function renderFollowUps(message) {
  if (!message.followUps?.length) return "";
  return `
    <div class="follow-ups">
      ${message.followUps
        .map(
          (followUp) => `
            <button type="button" class="follow-up" data-message="${message.id}">
              ${escapeHtml(followUp)}
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function renderMessageActions(message) {
  if (message.role !== "assistant") return "";
  return `
    <div class="message-actions">
      <button type="button" class="ghost" data-save-insight="${message.id}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 9h-5m5 4h-5m-1-8H7a2 2 0 0 0-2 2v10l3.5-2 3.5 2 3.5-2 3.5 2V7a2 2 0 0 0-2-2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Сохранить инсайт
      </button>
    </div>
  `;
}

function handleUserMessage(content) {
  let conversation = getActiveConversation();
  if (!conversation) {
    conversation = createConversation();
    state.conversations.unshift(conversation);
    state.activeConversationId = conversation.id;
  }

  const userMessage = createMessage("user", content);
  conversation.messages.push(userMessage);
  conversation.updatedAt = Date.now();
  if (conversation.title === "Новый диалог") {
    conversation.title = generateTitle(content);
  }

  saveState();
  renderConversations();
  renderActiveConversation();
  clearComposer();

  setTimeout(() => {
    const response = generateAssistantResponse(content, conversation.sources);
    const assistantMessage = createMessage("assistant", response.text, {
      followUps: response.followUps,
    });
    conversation.messages.push(assistantMessage);
    conversation.updatedAt = Date.now();
    saveState();
    renderConversations();
    renderActiveConversation();
  }, 480);
}

function bindDynamicButtons() {
  elements.messageList
    .querySelectorAll("button[data-save-insight]")
    .forEach((button) => {
      const messageId = button.dataset.saveInsight;
      button.addEventListener("click", () => saveInsight(messageId));
    });

  elements.messageList.querySelectorAll(".follow-up").forEach((button) => {
    button.addEventListener("click", () => handleUserMessage(button.textContent));
  });
}

function renderInsights() {
  const container = elements.insightList;
  if (!container) return;
  container.innerHTML = "";
  const conversation = getActiveConversation();
  if (!conversation?.insights?.length) {
    const placeholder = document.createElement("p");
    placeholder.className = "insight-placeholder";
    placeholder.textContent = "Инсайты из ответов можно закреплять здесь";
    container.appendChild(placeholder);
    return;
  }

  conversation.insights
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((insight) => {
      const item = document.createElement("article");
      item.className = "insight-item";
      item.innerHTML = `
        <strong>${escapeHtml(insight.title)}</strong>
        <p>${escapeHtml(insight.content)}</p>
        <time>${formatRelativeTime(insight.createdAt)}</time>
      `;
      container.appendChild(item);
    });
}

function saveInsight(messageId) {
  const conversation = getActiveConversation();
  if (!conversation) return;
  const message = conversation.messages.find((m) => m.id === messageId);
  if (!message) return;
  const summary = message.content.split("\n")[0];
  conversation.insights.push({
    id: crypto.randomUUID(),
    messageId,
    title: truncate(summary, 64),
    content: truncate(message.content, 220),
    createdAt: Date.now(),
  });
  conversation.updatedAt = Date.now();
  saveState();
  renderConversations();
  renderInsights();
}

function generateAssistantResponse(prompt, sources = []) {
  const normalized = prompt.toLowerCase();
  const match = knowledgeSnippets.find(({ keywords }) =>
    keywords.some((keyword) => normalized.includes(keyword))
  );

  let text = match?.response ??
    "Я зафиксировал ваш запрос и проверю релевантные каналы, профили и записи. После подключения к Supabase смогу давать ответы по живым данным.";

  if (sources.length && sources.length < 3) {
    const names = sources.map(renderSourceLabel).join(", ");
    text += `\n\nФокусируюсь на источниках: ${names}.`;
  }

  const followUps = match?.followUps ?? defaultFollowUps;
  return { text, followUps };
}

function renderSourceLabel(source) {
  switch (source) {
    case "chats":
      return "чаты";
    case "profiles":
      return "профили";
    case "media":
      return "медиатека";
    default:
      return source;
  }
}

function createMessage(role, content, extras = {}) {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: Date.now(),
    ...extras,
  };
}

function clearComposer() {
  if (!elements.composerInput) return;
  elements.composerInput.value = "";
  elements.composerInput.style.height = "auto";
}

function focusComposer() {
  elements.composerInput?.focus();
}

elements.composerInput?.addEventListener("input", () => {
  const input = elements.composerInput;
  if (!input) return;
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 168)}px`;
});

function scrollMessagesToBottom() {
  const target = elements.messageScroll ?? elements.messageList;
  target?.scrollTo({ top: target.scrollHeight, behavior: "smooth" });
}

function renderMarkdown(text) {
  return text
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (trimmed.startsWith("- ")) {
        const items = trimmed
          .split("\n")
          .map((line) => `<li>${escapeHtml(line.replace(/^-\s*/, ""))}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }
      if (trimmed.includes("\n")) {
        return `<p>${trimmed
          .split("\n")
          .map(escapeHtml)
          .join("<br />")}</p>`;
      }
      return `<p>${escapeHtml(trimmed)}</p>`;
    })
    .join("");
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncate(text, length) {
  if (text.length <= length) return text;
  return text.slice(0, length - 1) + "…";
}

function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} дн назад`;
  const date = new Date(timestamp);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
}

function generateTitle(prompt) {
  const sentence = prompt.split(/\.|\?|!/)[0];
  return truncate(sentence.trim() || "Новый запрос", 32);
}
