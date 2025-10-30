document.addEventListener("DOMContentLoaded", () => {
  const levelTabs = document.querySelectorAll(".level-tab");
  const levelPanels = document.querySelectorAll(".level-panel");

  levelTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const level = tab.dataset.level;

      levelTabs.forEach((t) => {
        const isActive = t === tab;
        t.classList.toggle("is-active", isActive);
        t.setAttribute("aria-selected", String(isActive));
        t.setAttribute("tabindex", isActive ? "0" : "-1");
      });
      levelPanels.forEach((panel) => {
        const isActive = panel.dataset.level === level;
        panel.classList.toggle("is-active", isActive);
        panel.toggleAttribute("hidden", !isActive);
      });
    });
  });

  const caseToggles = document.querySelectorAll(".case-toggle");
  caseToggles.forEach((toggle) => {
    const target = document.getElementById(toggle.dataset.target);
    if (!target) return;

    toggle.setAttribute("aria-expanded", "false");
    target.setAttribute("aria-hidden", "true");
    target.style.maxHeight = "0";

    toggle.addEventListener("click", () => {
      const isOpen = target.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      target.setAttribute("aria-hidden", String(!isOpen));
      if (isOpen) {
        target.style.maxHeight = `${target.scrollHeight}px`;
      } else {
        target.style.maxHeight = "0";
      }
    });
  });
});
