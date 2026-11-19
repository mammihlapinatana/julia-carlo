// Единое место для контактов. Пустая строка — пункт скрыт.
const LINKS = {
  telegram: "https://t.me/nuclear_ka",
  email: "carlo.jul.a@gmail.com",
  linkedin: "https://www.linkedin.com/in/julia-carlo",
  resume: "",
};

const CONTACT_LABELS = {
  telegram: "Написать в Telegram",
  email: "Почта",
  linkedin: "LinkedIn",
  resume: "Резюме",
};

const spine = document.querySelector(".spine");
const mark = document.querySelector(".spine-mark");
const spineLinks = [...document.querySelectorAll(".spine a")];
const sections = [...document.querySelectorAll("main section")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function placeMark() {
  /* Active state is handled by .is-on styles; floating mark is unused. */
}

function setActive(id) {
  const link = spineLinks.find((item) => item.getAttribute("href") === `#${id}`);
  spineLinks.forEach((item) => {
    const on = item === link;
    item.classList.toggle("is-on", on);
    if (on) item.setAttribute("aria-current", "true");
    else item.removeAttribute("aria-current");
  });
  document.body.classList.toggle("at-contact", id === "contact");
}

function currentSectionId() {
  const probe = window.innerHeight * 0.38;
  let current = sections[0]?.id || "hero";
  for (const section of sections) {
    const top = section.getBoundingClientRect().top;
    if (top <= probe) current = section.id;
  }
  return current;
}

function syncActive() {
  setActive(currentSectionId());
}

function stickyOffset() {
  if (!spine) return 0;
  return spine.getBoundingClientRect().height + 8;
}

function scrollToId(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const top = window.scrollY + target.getBoundingClientRect().top - stickyOffset();
  window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      revealObserver.unobserve(entry.target);
    });
  },
  { rootMargin: "0px 0px -8% 0px", threshold: 0.18 }
);

document.querySelectorAll(".reveal-item").forEach((item, index) => {
  item.style.setProperty("--d", String(index % 3));
  revealObserver.observe(item);
});

function renderContacts() {
  const host = document.getElementById("contact-links");
  if (!host) return;

  const entries = Object.entries(LINKS).filter(([, url]) => Boolean(url));
  host.replaceChildren();

  if (!entries.length) {
    host.hidden = true;
    return;
  }

  host.hidden = false;
  entries.forEach(([key, url], index) => {
    const a = document.createElement("a");
    a.id = `link-${key}`;
    a.href = url;
    if (key === "email") {
      a.href = url.startsWith("mailto:") ? url : `mailto:${url}`;
    } else {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }

    const num = document.createElement("span");
    num.textContent = String(index + 1).padStart(2, "0");
    a.append(num, document.createTextNode(CONTACT_LABELS[key] || key));

    const arrow = document.createElement("strong");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    a.append(arrow);

    host.append(a);
  });
}

function initCarousel(root) {
  const track = root.querySelector("[data-carousel-track]");
  const slides = [...root.querySelectorAll("[data-carousel-slide]")];
  const status = root.querySelector("[data-carousel-status]");
  const prev = root.querySelector("[data-carousel-prev]");
  const next = root.querySelector("[data-carousel-next]");
  if (!track || slides.length === 0) return;

  let index = 0;

  function update() {
    if (status) status.textContent = `${index + 1} из ${slides.length}`;
    if (prev) prev.disabled = index <= 0;
    if (next) next.disabled = index >= slides.length - 1;
  }

  function goTo(nextIndex, { smooth = true } = {}) {
    index = Math.max(0, Math.min(slides.length - 1, nextIndex));
    const slide = slides[index];
    const left = slide.offsetLeft - track.offsetLeft;
    track.scrollTo({
      left,
      behavior: smooth && !reduceMotion ? "smooth" : "auto",
    });
    update();
  }

  function nearestIndex() {
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    slides.forEach((slide, i) => {
      const center = slide.offsetLeft - track.offsetLeft + slide.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  }

  prev?.addEventListener("click", () => goTo(index - 1));
  next?.addEventListener("click", () => goTo(index + 1));

  track.addEventListener("scroll", () => {
    const near = nearestIndex();
    if (near !== index) {
      index = near;
      update();
    }
  }, { passive: true });

  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(slides.length - 1);
    }
  });

  update();
}

document.querySelectorAll("[data-carousel]").forEach(initCarousel);
renderContacts();

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    syncActive();
    ticking = false;
  });
}, { passive: true });


spine?.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  const id = link.getAttribute("href")?.slice(1);
  if (!id) return;
  event.preventDefault();
  setActive(id);
  scrollToId(id);
  history.replaceState(null, "", `#${id}`);
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  if (anchor.closest(".spine")) return;
  anchor.addEventListener("click", (event) => {
    const id = anchor.getAttribute("href")?.slice(1);
    if (!id || !document.getElementById(id)) return;
    event.preventDefault();
    setActive(id);
    scrollToId(id);
    history.replaceState(null, "", `#${id}`);
  });
});

document.fonts?.ready.then(() => {
  document.body.classList.add("is-ready");
  syncActive();
});

requestAnimationFrame(() => {
  document.body.classList.add("is-ready");
  syncActive();
});
