const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const revealItems = document.querySelectorAll(".reveal");
const faqButtons = document.querySelectorAll(".faq-question");
const leadForm = document.querySelector("[data-lead-form]");
const formStatus = document.querySelector("[data-form-status]");

const quizRoot = document.querySelector("[data-quiz]");
const quizProgress = document.querySelector("[data-quiz-progress]");
const quizStep = document.querySelector("[data-quiz-step]");
const quizQuestion = document.querySelector("[data-quiz-question]");
const quizOptions = document.querySelector("[data-quiz-options]");
const quizNav = document.querySelector(".quiz-nav");
const quizBackButton = document.querySelector("[data-quiz-back]");
const quizNextButton = document.querySelector("[data-quiz-next]");
const quizSummary = document.querySelector("[data-quiz-summary]");
const quizSummaryTitle = document.querySelector("[data-quiz-summary-title]");
const quizSummaryText = document.querySelector("[data-quiz-summary-text]");
const quizScrollButton = document.querySelector("[data-quiz-scroll]");
const contactSection = document.querySelector("#contact");

const formTopic = leadForm ? leadForm.querySelector('select[name="topic"]') : null;
const formMessage = leadForm ? leadForm.querySelector('textarea[name="message"]') : null;
const formName = leadForm ? leadForm.querySelector('input[name="name"]') : null;

const quizQuestions = [
  {
    question: "Что сейчас ощущается сильнее всего?",
    options: [
      { label: "Постоянная тревога и внутреннее напряжение", topic: "Тревожность" },
      { label: "Живу на последнем ресурсе и быстро выгораю", topic: "Выгорание" },
      { label: "Слишком больно и тревожно в отношениях", topic: "Отношения" },
      { label: "Мне сложно понять, что со мной происходит", topic: "Не понимаю, что со мной" }
    ]
  },
  {
    question: "Как это чаще всего проявляется в обычных днях?",
    options: [
      { label: "Трудно уснуть и выключить мысли" },
      { label: "Всё делаю через напряжение и усталость" },
      { label: "Срываюсь на близких или замыкаюсь" },
      { label: "Прокручиваю прошлое и боюсь будущего" }
    ]
  },
  {
    question: "Что вам особенно хочется получить от консультации?",
    options: [
      { label: "Спокойствие и внутреннюю опору" },
      { label: "Ясность, почему мне так тяжело" },
      { label: "Понятный и бережный маршрут без давления" },
      { label: "Больше устойчивости в отношениях и к себе" }
    ]
  }
];

const quizAnswers = [];
let currentQuizIndex = 0;

function scrollToContactForm() {
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  window.setTimeout(() => {
    if (formName) {
      formName.focus();
    }
  }, 420);
}

function syncQuizNavigation(index) {
  if (!quizBackButton || !quizNextButton) {
    return;
  }

  const isSummaryStep = index >= quizQuestions.length;
  quizBackButton.disabled = index === 0;
  quizBackButton.hidden = false;
  quizNextButton.hidden = isSummaryStep;

  if (!isSummaryStep) {
    quizNextButton.disabled = !quizAnswers[index];
  }
}

if (header) {
  const syncHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
}

if (navToggle && nav) {
  const closeNav = () => {
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.classList.remove("is-active");
    nav.classList.remove("is-open");
  };

  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    navToggle.classList.toggle("is-active", !expanded);
    nav.classList.toggle("is-open", !expanded);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeNav();
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1120) {
      closeNav();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
    }
  });
}

if ("IntersectionObserver" in window && revealItems.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -50px 0px"
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

faqButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const isOpen = button.getAttribute("aria-expanded") === "true";

    faqButtons.forEach((otherButton) => {
      otherButton.setAttribute("aria-expanded", "false");
      const otherItem = otherButton.closest(".faq-item");
      if (otherItem) {
        otherItem.classList.remove("is-open");
      }
    });

    if (!isOpen && item) {
      button.setAttribute("aria-expanded", "true");
      item.classList.add("is-open");
    }
  });
});

function renderQuizQuestion(index) {
  if (!quizRoot || !quizProgress || !quizStep || !quizQuestion || !quizOptions) {
    return;
  }

  const questionData = quizQuestions[index];
  if (!questionData) {
    renderQuizSummary();
    return;
  }

  currentQuizIndex = index;

  if (quizSummary) {
    quizSummary.setAttribute("hidden", "hidden");
  }
  quizQuestion.hidden = false;
  quizOptions.hidden = false;

  quizStep.textContent = `Вопрос ${index + 1} из ${quizQuestions.length}`;
  quizQuestion.textContent = questionData.question;
  quizProgress.style.width = `${((index + 1) / quizQuestions.length) * 100}%`;

  quizOptions.innerHTML = "";
  const selectedAnswer = quizAnswers[index];

  questionData.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-option";
    button.setAttribute("aria-pressed", String(selectedAnswer === option));

    if (selectedAnswer === option) {
      button.classList.add("is-selected");
    }

    button.innerHTML = `<span>${option.label}</span><span class="quiz-option__arrow">→</span>`;

    button.addEventListener("click", () => {
      quizAnswers[index] = option;

      if (index === quizQuestions.length - 1) {
        button.classList.add("is-selected");
        button.setAttribute("aria-pressed", "true");

        window.setTimeout(() => {
          renderQuizSummary();
          scrollToContactForm();
        }, 120);
        return;
      }

      renderQuizQuestion(index + 1);
    });

    quizOptions.appendChild(button);
  });

  syncQuizNavigation(index);
}

function renderQuizSummary() {
  if (!quizRoot || !quizProgress || !quizStep || !quizQuestion || !quizOptions || !quizSummary) {
    return;
  }

  currentQuizIndex = quizQuestions.length;

  const firstAnswer = quizAnswers[0] || null;
  const secondAnswer = quizAnswers[1] || null;
  const thirdAnswer = quizAnswers[2] || null;
  const primaryTopic = firstAnswer ? firstAnswer.topic : "Не понимаю, что со мной";
  const manifestation = secondAnswer ? secondAnswer.label : "";
  const desiredResult = thirdAnswer ? thirdAnswer.label : "";

  quizProgress.style.width = "100%";
  quizStep.textContent = "Ваш ориентир по квизу";
  quizQuestion.hidden = true;
  quizOptions.hidden = true;
  quizSummary.removeAttribute("hidden");

  if (quizSummaryTitle) {
    quizSummaryTitle.textContent = "Это похоже на запрос, с которым стоит начать мягкую работу.";
  }

  if (quizSummaryText) {
    quizSummaryText.textContent = `Сейчас сильнее всего откликается тема «${primaryTopic.toLowerCase()}». Обычно в таких состояниях важно не тянуть в одиночку, а получить спокойную опору, ясность и понятный маршрут без давления.`;
  }

  if (formTopic) {
    formTopic.value = primaryTopic;
  }

  if (formMessage) {
    formMessage.value = `По квизу: сильнее всего откликается — ${firstAnswer ? firstAnswer.label : ""}; чаще всего это проявляется так — ${manifestation}; от консультации хочется получить — ${desiredResult}.`;
  }
  syncQuizNavigation(currentQuizIndex);
}

if (quizRoot) {
  renderQuizQuestion(0);
}

if (quizBackButton) {
  quizBackButton.addEventListener("click", () => {
    if (currentQuizIndex === 0) {
      return;
    }

    if (currentQuizIndex >= quizQuestions.length) {
      renderQuizQuestion(quizQuestions.length - 1);
      return;
    }

    renderQuizQuestion(currentQuizIndex - 1);
  });
}

if (quizNextButton) {
  quizNextButton.addEventListener("click", () => {
    if (currentQuizIndex >= quizQuestions.length || !quizAnswers[currentQuizIndex]) {
      return;
    }

    if (currentQuizIndex === quizQuestions.length - 1) {
      renderQuizSummary();
      scrollToContactForm();
      return;
    }

    renderQuizQuestion(currentQuizIndex + 1);
  });
}

if (quizScrollButton) {
  quizScrollButton.addEventListener("click", () => {
    scrollToContactForm();
  });
}

if (leadForm && formStatus) {
  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(leadForm);
    const name = String(formData.get("name") || "").trim();
    const contact = String(formData.get("contact") || "").trim();
    const topic = String(formData.get("topic") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !contact || !topic) {
      formStatus.textContent = "Пожалуйста, заполните имя, контакт и запрос, чтобы отправить заявку.";
      formStatus.classList.add("is-error");
      return;
    }

    const payload = {
      name,
      contact,
      topic,
      message,
      createdAt: new Date().toISOString()
    };

    try {
      localStorage.setItem("psychologist-lead-draft", JSON.stringify(payload));
      formStatus.textContent = "Спасибо. Заявка сохранена в браузере. Перед публикацией подключите форму к email, Telegram или CRM.";
      formStatus.classList.remove("is-error");
      leadForm.reset();
    } catch (error) {
      formStatus.textContent = "Заявка заполнена. Если нужно, я могу помочь подключить отправку формы к почте или мессенджеру.";
      formStatus.classList.remove("is-error");
    }
  });
}
