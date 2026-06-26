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

function setupAwardsSlider() {
  const root = document.querySelector("[data-awards-slider]");
  if (!root) return;

  const track = root.querySelector(".highlighted-awards-track");
  const cards = Array.from(root.querySelectorAll(".accomplishment-card"));
  const prev = root.querySelector("[data-awards-prev]");
  const next = root.querySelector("[data-awards-next]");
  const current = root.querySelector("[data-awards-current]");
  const total = root.querySelector("[data-awards-total]");
  if (!track || !cards.length || !prev || !next || !current || !total) return;

  const format = value => String(value).padStart(2, "0");
  let index = 0;
  total.textContent = format(cards.length);

  function updateCounter() {
    const trackLeft = track.getBoundingClientRect().left;
    let nearest = 0;
    let nearestDistance = Infinity;

    cards.forEach((card, i) => {
      const distance = Math.abs(card.getBoundingClientRect().left - trackLeft);
      if (distance < nearestDistance) {
        nearest = i;
        nearestDistance = distance;
      }
    });

    index = nearest;
    current.textContent = format(index + 1);
  }

  function goTo(nextIndex) {
    index = (nextIndex + cards.length) % cards.length;
    cards[index].scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start"
    });
    current.textContent = format(index + 1);
  }

  prev.addEventListener("click", () => goTo(index - 1));
  next.addEventListener("click", () => goTo(index + 1));
  track.addEventListener("scroll", () => window.requestAnimationFrame(updateCounter), { passive: true });
  window.addEventListener("resize", updateCounter);
  updateCounter();
}

document.addEventListener("DOMContentLoaded", function () {
  setupAwardsSlider();

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
