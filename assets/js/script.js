(() => {
  "use strict";

  const root = document.documentElement;
  const siteHeader = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = Array.from(document.querySelectorAll(".main-nav a"));
  const revealItems = Array.from(document.querySelectorAll(".reveal"));
  const themeButtons = Array.from(document.querySelectorAll("[data-set-theme]"));
  const paletteButtons = Array.from(document.querySelectorAll("[data-set-palette]"));
  const previewLabel = document.getElementById("preview-label");
  const yearElement = document.getElementById("year");
  const contactForm = document.getElementById("contact-form");
  const feedback = document.getElementById("form-feedback");
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  const STORAGE_KEY = "site-template-ui-preferences-v1";
  const SESSION_WELCOME_KEY = "site-template-welcome-v1";

  const themeLabels = {
    dark: "Dark Mode",
    light: "Light Mode",
    pro: "Color Mode"
  };

  const paletteLabels = {
    sunset: "Sunset Pro",
    ocean: "Ocean Mint",
    vibrant: "Vibrant Pop",
    pastel: "Pastel Soft"
  };

  const state = {
    theme: "dark",
    palette: "sunset"
  };

  function readStoredPreferences() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        if (typeof parsed.theme === "string" && themeLabels[parsed.theme]) {
          state.theme = parsed.theme;
        }
        if (typeof parsed.palette === "string" && paletteLabels[parsed.palette]) {
          state.palette = parsed.palette;
        }
      }
    } catch (_error) {
      // Ignore storage read errors in private mode or restricted browsers.
    }
  }

  function savePreferences() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_error) {
      // Ignore storage write errors.
    }
  }

  function updatePreviewLabel() {
    if (!previewLabel) {
      return;
    }

    previewLabel.textContent = `Preview atual: ${themeLabels[state.theme]} + ${paletteLabels[state.palette]}`;
  }

  function updateThemeColorMeta() {
    if (!themeColorMeta) {
      return;
    }

    const themeMap = {
      dark: "#080f1d",
      light: "#f2f6fc",
      pro: "#0d121e"
    };

    themeColorMeta.setAttribute("content", themeMap[state.theme] || "#080f1d");
  }

  function syncButtonState() {
    themeButtons.forEach((button) => {
      const isActive = button.dataset.setTheme === state.theme;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    paletteButtons.forEach((button) => {
      const isActive = button.dataset.setPalette === state.palette;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function applyUIState() {
    root.dataset.theme = state.theme;
    root.dataset.palette = state.palette;
    syncButtonState();
    updatePreviewLabel();
    updateThemeColorMeta();
    savePreferences();
  }

  function setMenuOpen(isOpen) {
    if (!siteHeader || !menuToggle) {
      return;
    }

    siteHeader.classList.toggle("nav-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  }

  function setupThemePaletteActions() {
    themeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const nextTheme = button.dataset.setTheme;
        if (!nextTheme || !themeLabels[nextTheme]) {
          return;
        }

        state.theme = nextTheme;
        applyUIState();
      });
    });

    paletteButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const nextPalette = button.dataset.setPalette;
        if (!nextPalette || !paletteLabels[nextPalette]) {
          return;
        }

        state.palette = nextPalette;
        applyUIState();
      });
    });
  }

  function setupMobileNav() {
    if (!siteHeader || !menuToggle) {
      return;
    }

    menuToggle.addEventListener("click", () => {
      const open = !siteHeader.classList.contains("nav-open");
      setMenuOpen(open);
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        setMenuOpen(false);
      });
    });

    document.addEventListener("click", (event) => {
      if (!siteHeader.classList.contains("nav-open")) {
        return;
      }

      const target = event.target;
      if (target instanceof Node && !siteHeader.contains(target)) {
        setMenuOpen(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 860) {
        setMenuOpen(false);
      }
    });
  }

  function setActiveLink(sectionId) {
    navLinks.forEach((link) => {
      const hash = link.getAttribute("href");
      const isActive = hash === `#${sectionId}`;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function setupActiveNavTracking() {
    const sections = Array.from(document.querySelectorAll("main section[id]"));
    if (!sections.length) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setActiveLink(sections[0].id);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveLink(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-15% 0px -55% 0px",
        threshold: 0.25
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  function setupRevealEffects() {
    if (!revealItems.length) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.18
      }
    );

    revealItems.forEach((item) => observer.observe(item));
  }

  function setupContactForm() {
    if (!contactForm || !feedback) {
      return;
    }

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!contactForm.checkValidity()) {
        feedback.textContent = "Revise os campos obrigatorios para enviar sua solicitacao.";
        contactForm.reportValidity();
        return;
      }

      const nomeField = contactForm.elements.namedItem("nome");
      const nome = nomeField && "value" in nomeField ? String(nomeField.value).trim() : "";
      const primeiroNome = nome.split(" ").filter(Boolean)[0] || "Cliente";

      feedback.textContent = `${primeiroNome}, recebemos seu pedido. Em breve voce recebe a proposta completa.`;
      contactForm.reset();
    });
  }

  function showWelcomeToast() {
    let shouldShow = true;

    try {
      shouldShow = sessionStorage.getItem(SESSION_WELCOME_KEY) !== "1";
      sessionStorage.setItem(SESSION_WELCOME_KEY, "1");
    } catch (_error) {
      shouldShow = true;
    }

    if (!shouldShow) {
      return;
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.textContent =
      "Bem-vindo. Personalize tema e paleta na Home para mostrar ao cliente como o site pode ficar.";

    document.body.appendChild(toast);

    window.setTimeout(() => {
      toast.remove();
    }, 5200);
  }

  function setCurrentYear() {
    if (!yearElement) {
      return;
    }

    yearElement.textContent = String(new Date().getFullYear());
  }

  readStoredPreferences();
  applyUIState();
  setupThemePaletteActions();
  setupMobileNav();
  setupActiveNavTracking();
  setupRevealEffects();
  setupContactForm();
  showWelcomeToast();
  setCurrentYear();
})();





//
