/* No tracking, network calls or persistence. All contact actions are simulations. */
(() => {
  "use strict";
  const dialog = document.querySelector("#quote-dialog");
  const service = document.querySelector("#quote-service");
  const environment = document.querySelector("#quote-environment");
  const message = document.querySelector("#message-text");
  const nav = document.querySelector("#navigation");
  const menu = document.querySelector(".menu-toggle");
  const mobileBar = document.querySelector("#mobile-contact");
  const hero = document.querySelector("#hero-contact");
  const finalSection = document.querySelector("#contato");
  const mobile = window.matchMedia("(max-width: 899px)");
  let trigger = null;
  let heroVisible = true;
  let finalVisible = false;

  // If native dialogs are unavailable, preserve the informative fallback link.
  if (typeof dialog.showModal !== "function") return;
  document.documentElement.classList.add("js");
  menu.hidden = false;

  function closeMenu() {
    menu.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  }
  menu.addEventListener("click", () => {
    const expanded = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(expanded));
    nav.classList.toggle("is-open", expanded);
  });
  nav.addEventListener("click", (event) => {
    if (!event.target.closest("a")) return;
    closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menu.getAttribute("aria-expanded") === "true"
    ) {
      closeMenu();
      menu.focus();
    }
  });

  function updateMessage() {
    const need =
      service.value === "Quero orientação"
        ? "gostaria de orientação sobre um serviço de ar-condicionado"
        : `gostaria de solicitar um orçamento de ${service.value.toLocaleLowerCase("pt-BR")} de ar-condicionado`;
    const place =
      environment.value === "A definir"
        ? "Posso contar mais sobre o ambiente e o equipamento."
        : `O ambiente é ${environment.value.toLocaleLowerCase("pt-BR")}. Posso informar os detalhes do equipamento.`;
    message.textContent = `Olá! ${need.charAt(0).toUpperCase() + need.slice(1)}. ${place}`;
  }
  function updateBar() {
    // Keep page height stable while scrolling; reserve room throughout mobile use.
    document.body.classList.toggle("has-contact-bar", mobile.matches);
    mobileBar.hidden =
      !mobile.matches || heroVisible || finalVisible || dialog.open;
  }
  document.querySelectorAll("[data-contact]").forEach((link) => {
    link.setAttribute("aria-haspopup", "dialog");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      trigger = link;
      service.value = link.dataset.service || "Quero orientação";
      environment.value = link.dataset.environment || "A definir";
      updateMessage();
      dialog.showModal();
      document.body.classList.add("dialog-open");
      updateBar();
      dialog.querySelector("[data-close]").focus();
    });
  });
  service.addEventListener("change", updateMessage);
  environment.addEventListener("change", updateMessage);
  dialog
    .querySelectorAll("[data-close]")
    .forEach((button) =>
      button.addEventListener("click", () => dialog.close()),
    );
  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    updateBar();
    // A mobile menu link may be hidden after it opens the dialog.
    (trigger?.getClientRects().length ? trigger : menu).focus({
      preventScroll: true,
    });
  });
  // Keep keyboard navigation inside the modal, including embedded browsers
  // that otherwise move focus to browser chrome at the end of the tab cycle.
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const controls = [...dialog.querySelectorAll("button, select")].filter(
      (control) => !control.disabled && control.getClientRects().length,
    );
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === hero) heroVisible = entry.isIntersecting;
          if (entry.target === finalSection)
            finalVisible = entry.isIntersecting;
        }
        updateBar();
      },
      { threshold: 0 },
    );
    observer.observe(hero);
    observer.observe(finalSection);
  }
  mobile.addEventListener("change", () => {
    closeMenu();
    updateBar();
  });
  updateBar();
})();
