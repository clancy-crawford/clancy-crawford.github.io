const PORTFOLIO_EVENT_URL = "https://portfolio-click-notifications.ckcrawford963.workers.dev/";

function setupPortfolioNotifications() {
  // Local previews should not send real activity alerts.
  if (window.location.origin !== "https://clancy-crawford.github.io") return;

  let portfolioRef = new URLSearchParams(window.location.search).get("ref") || "";
  try {
    if (portfolioRef) {
      window.sessionStorage.setItem("portfolioRef", portfolioRef);
    } else {
      portfolioRef = window.sessionStorage.getItem("portfolioRef") || "";
    }
  } catch (_) {
    // Keep the incoming ref usable even when browser storage is unavailable.
  }

  function sendPortfolioEvent(action) {
    try {
      const body = JSON.stringify({
        action,
        page: window.location.pathname,
        ref: portfolioRef,
        referrer: document.referrer || ""
      });
      fetch(PORTFOLIO_EVENT_URL, {
        method: "POST",
        // The Worker parses JSON; text/plain avoids a preflight during navigation.
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body,
        keepalive: true,
        credentials: "omit",
        referrerPolicy: "no-referrer"
      }).catch(() => {});
    } catch (_) {}
  }

  sendPortfolioEvent("Page View");

  const recentClicks = new Map();
  document.querySelectorAll("a[href]").forEach(link => {
    let destination;
    try { destination = new URL(link.href, window.location.href); } catch (_) { return; }
    let action;
    if (link.hasAttribute("data-resume-notify") && link.hasAttribute("download")) {
      action = "Resume Download";
    } else if (destination.protocol === "mailto:") {
      action = "Email Click";
    } else if (destination.protocol === "https:" &&
        ["linkedin.com", "www.linkedin.com"].includes(destination.hostname)) {
      action = "LinkedIn Click";
    } else if (destination.protocol === "https:" && destination.hostname === "github.com") {
      action = "GitHub Click";
    } else {
      return;
    }

    function notify(event) {
      if (event.defaultPrevented || (event.type === "auxclick" && event.button !== 1)) return;
      // Preserve native downloads, new tabs, keyboard activation, and email links.
      try {
        const key = `${action}:${destination.pathname}`;
        const now = Date.now();
        if (recentClicks.has(key) && now - recentClicks.get(key) < 10000) return;
        recentClicks.set(key, now);
        sendPortfolioEvent(action);
      } catch (_) {}
    }
    link.addEventListener("click", notify);
    link.addEventListener("auxclick", notify);
  });
}

function setupSlider(selector) {
  const root = document.querySelector(selector);
  if (!root) return;

  const slider = root.querySelector(".project-image-wrap");
  if (!slider) return;

  const slides = slider.querySelectorAll(".slides img, .slides video");
  const dotsContainer = slider.querySelector(".dots");
  if (!slides.length || !dotsContainer) return;

  dotsContainer.innerHTML = "";
  let index = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement("div");
    dotsContainer.appendChild(dot);
    if (i === 0) dot.classList.add("active");
  });

  const dots = dotsContainer.querySelectorAll("div");

  function showSlide(i) {
    slides.forEach(slide => slide.classList.remove("active"));
    dots.forEach(dot => dot.classList.remove("active"));

    slides[i].classList.add("active");
    dots[i].classList.add("active");
    index = i;
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => showSlide(i));
  });

  slides.forEach((slide, i) => {
    slide.addEventListener("click", () => {
      const next = (i + 1) % slides.length;
      showSlide(next);
    });
  });

  showSlide(index);
}

function toggleResearch(btn) {
  const content = btn.nextElementSibling;
  const visible = content.style.display === "block";

  content.style.display = visible ? "none" : "block";
  btn.innerHTML = visible
    ? btn.innerHTML.replace("\u25B4", "\u25BE")
    : btn.innerHTML.replace("\u25BE", "\u25B4");
}

function setupResearchPanels() {
  const buttons = document.querySelectorAll("[data-research-target]");
  const panels = document.querySelectorAll("[data-research-panel]");
  if (!buttons.length || !panels.length) return;

  function showResearchPanel(target) {
    buttons.forEach(button => {
      const active = button.dataset.researchTarget === target;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });

    panels.forEach(panel => {
      const active = panel.dataset.researchPanel === target;
      panel.classList.toggle("active", active);
      panel.hidden = !active;
    });
  }

  buttons.forEach(button => {
    button.setAttribute("aria-selected", button.classList.contains("active") ? "true" : "false");
    button.addEventListener("click", () => showResearchPanel(button.dataset.researchTarget));
  });

  panels.forEach(panel => {
    panel.hidden = !panel.classList.contains("active");
  });
}

function toggleAwards() {
  const fullList = document.getElementById("full-awards");
  const btn = document.querySelector(".expand-awards-btn");
  if (!fullList || !btn) return;

  if (fullList.style.display === "block") {
    fullList.style.display = "none";
    btn.innerHTML = "View Full Awards List \u25BE";
  } else {
    fullList.style.display = "block";
    btn.innerHTML = "Hide Full Awards List \u25B4";
  }
}

function setupMouseScrolling() {
  const tracks = document.querySelectorAll(
    ".project-strip-track, .highlighted-awards-track, .full-awards-stage .awards-groups"
  );

  tracks.forEach(track => {
    track.classList.add("mouse-scrollable");
    let drag = null;
    let suppressClick = false;

    track.addEventListener("wheel", event => {
      if (event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 0) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? track.clientWidth : 1;
      const next = Math.max(0, Math.min(maxScroll, track.scrollLeft + event.deltaY * unit));
      // Let the page scroll normally when the row reaches either end.
      if (Math.abs(next - track.scrollLeft) < 1) return;
      event.preventDefault();
      track.scrollTo({ left: next, behavior: "instant" });
    }, { passive: false });

    track.addEventListener("pointerdown", event => {
      suppressClick = false;
      if (event.pointerType !== "mouse" || event.button !== 0 ||
          event.target.closest("a, button, input, select, textarea, video, .dots")) return;
      drag = { id: event.pointerId, x: event.clientX, scroll: track.scrollLeft, moved: false };
    });

    track.addEventListener("pointermove", event => {
      if (!drag || drag.id !== event.pointerId) return;
      const distance = event.clientX - drag.x;
      if (!drag.moved && Math.abs(distance) < 6) return;
      if (!drag.moved) {
        drag.moved = true;
        track.setPointerCapture(event.pointerId);
        track.classList.add("is-dragging");
      }
      event.preventDefault();
      track.scrollTo({ left: drag.scroll - distance, behavior: "instant" });
    });

    function finishDrag() {
      if (!drag) return;
      suppressClick = drag.moved;
      drag = null;
      track.classList.remove("is-dragging");
    }

    track.addEventListener("pointerup", finishDrag);
    track.addEventListener("pointercancel", finishDrag);
    track.addEventListener("lostpointercapture", finishDrag);
    track.addEventListener("pointerleave", () => {
      if (drag && !drag.moved) finishDrag();
    });
    track.addEventListener("dragstart", event => event.preventDefault());
    track.addEventListener("click", event => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
    }, true);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  setupPortfolioNotifications();
  setupMouseScrolling();
  setupResearchPanels();

  document.querySelectorAll(".project-block, .milestones-card").forEach((sliderRoot, index) => {
    if (!sliderRoot.querySelector(".slides")) return;
    const sliderClass = `auto-slider-${index}`;
    sliderRoot.classList.add(sliderClass);
    setupSlider(`.${sliderClass}`);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.01,
    rootMargin: "0px 0px -40px 0px"
  });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
});
