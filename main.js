// Адреса контактов. Пустая строка оставляет подпись без перехода.
const LINKS = {
  telegram: "",
  email: "",
  linkedin: "",
  resume: "",
};

const spine = document.querySelector(".spine");
const mark = document.querySelector(".spine-mark");
const spineLinks = [...document.querySelectorAll(".spine a")];
const sections = [...document.querySelectorAll("main section")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function placeMark(link) {
  if (!mark || !link) return;
  const horizontal = window.matchMedia("(max-width: 720px)").matches;
  if (horizontal) {
    const left = link.offsetLeft + link.offsetWidth / 2 - mark.offsetWidth / 2;
    const top = link.offsetTop + link.offsetHeight / 2 - mark.offsetHeight / 2;
    mark.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    return;
  }
  const top = link.offsetTop + link.offsetHeight / 2 - mark.offsetHeight / 2;
  mark.style.transform = `translate3d(12px, ${top}px, 0)`;
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
  placeMark(link);
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

Object.entries(LINKS).forEach(([key, url]) => {
  const node = document.getElementById(`link-${key}`);
  if (!node) return;
  if (url) {
    node.href = url;
    if (key !== "email") node.target = "_blank";
    node.rel = "noopener noreferrer";
    return;
  }
  node.removeAttribute("href");
  node.setAttribute("aria-disabled", "true");
  node.title = "Адрес можно добавить в начале main.js";
});

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    syncActive();
    ticking = false;
  });
}, { passive: true });

window.addEventListener("resize", () => {
  const current = spineLinks.find((item) => item.classList.contains("is-on"));
  placeMark(current || spineLinks[0]);
});

spine?.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  const id = link.getAttribute("href")?.slice(1);
  if (id) setActive(id);
});

if (reduceMotion) mark?.style.setProperty("transition", "none");

document.fonts?.ready.then(() => {
  document.body.classList.add("is-ready");
  syncActive();
});

requestAnimationFrame(() => {
  document.body.classList.add("is-ready");
  syncActive();
});
