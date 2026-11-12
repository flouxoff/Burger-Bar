const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-nav");

function setMenuOpen(isOpen) {
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
  navigation.classList.toggle("is-open", isOpen);
}

menuButton.addEventListener("click", () => {
  setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuOpen(false);
});

const slides = Array.from(document.querySelectorAll(".slide"));
const dotsContainer = document.querySelector(".slider-dots");
let activeSlide = 0;

function showSlide(index) {
  activeSlide = (index + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === activeSlide;
    slide.hidden = !isActive;
    slide.classList.toggle("is-active", isActive);
    dotsContainer.querySelectorAll("button")[slideIndex].setAttribute("aria-current", String(isActive));
  });
}

slides.forEach((slide, index) => {
  const dot = document.createElement("button");
  dot.className = "slider-dot";
  dot.type = "button";
  dot.setAttribute("aria-label", `Afficher ${slide.dataset.name}`);
  dot.addEventListener("click", () => showSlide(index));
  dotsContainer.append(dot);
});

document.querySelector(".previous").addEventListener("click", () => showSlide(activeSlide - 1));
document.querySelector(".next").addEventListener("click", () => showSlide(activeSlide + 1));
showSlide(activeSlide);

const reviewCarousel = document.querySelector(".review-carousel");
const reviewTrack = document.querySelector(".review-track");
const reviewCards = Array.from(reviewTrack.querySelectorAll(".review-card"));
const reviewCounter = document.querySelector(".review-counter");
const reviewToggle = document.querySelector(".review-toggle");
let visibleReviewCount = 0;
let currentReview = 0;
let reviewTimer;
let wrapTimer;
let resizeTimer;
let reviewPaused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let reviewPointerInside = false;

function getVisibleReviewCount() {
  if (window.matchMedia("(max-width: 700px)").matches) return 1;
  if (window.matchMedia("(max-width: 1000px)").matches) return 2;
  return 3;
}

function updateReviewPosition() {
  const gap = Number.parseFloat(window.getComputedStyle(reviewTrack).columnGap) || 0;
  const step = reviewCards[0].getBoundingClientRect().width + gap;
  reviewTrack.style.transform = `translateX(-${currentReview * step}px)`;
  const firstVisible = currentReview >= reviewCards.length ? 1 : currentReview + 1;
  const lastVisible = Math.min(firstVisible + visibleReviewCount - 1, reviewCards.length);
  reviewCounter.textContent = `${firstVisible}–${lastVisible} / ${reviewCards.length}`;
}

function resetReviews() {
  window.clearTimeout(wrapTimer);
  reviewTrack.classList.add("is-resetting");
  currentReview = 0;
  updateReviewPosition();
  reviewTrack.getBoundingClientRect();
  window.requestAnimationFrame(() => reviewTrack.classList.remove("is-resetting"));
}

function goToNextReview() {
  if (currentReview >= reviewCards.length) resetReviews();

  const lastStart = reviewCards.length - visibleReviewCount;
  if (currentReview >= lastStart) {
    currentReview = reviewCards.length;
    updateReviewPosition();
    wrapTimer = window.setTimeout(resetReviews, 600);
    return;
  }

  currentReview += 1;
  updateReviewPosition();
}

function goToPreviousReview() {
  if (currentReview >= reviewCards.length) {
    resetReviews();
    currentReview = reviewCards.length - visibleReviewCount;
    updateReviewPosition();
    return;
  }

  currentReview = currentReview === 0
    ? reviewCards.length - visibleReviewCount
    : currentReview - 1;
  reviewTrack.classList.toggle("is-resetting", currentReview === reviewCards.length - visibleReviewCount);
  updateReviewPosition();
  if (currentReview === reviewCards.length - visibleReviewCount) {
    window.requestAnimationFrame(() => reviewTrack.classList.remove("is-resetting"));
  }
}

function refreshReviewCarousel() {
  reviewTrack.querySelectorAll(".is-clone").forEach((clone) => clone.remove());
  visibleReviewCount = getVisibleReviewCount();
  reviewCards.slice(0, visibleReviewCount).forEach((card) => {
    const clone = card.cloneNode(true);
    clone.classList.add("is-clone");
    clone.setAttribute("aria-hidden", "true");
    reviewTrack.append(clone);
  });
  resetReviews();
}

function updateReviewToggle() {
  reviewToggle.textContent = reviewPaused ? "Lire" : "Pause";
  reviewToggle.setAttribute("aria-label", reviewPaused
    ? "Reprendre le défilement automatique"
    : "Mettre le défilement automatique en pause");
  reviewToggle.setAttribute("aria-pressed", String(!reviewPaused));
}

function startReviewAutoplay() {
  window.clearInterval(reviewTimer);
  if (!reviewPaused && !reviewPointerInside && !document.hidden) {
    reviewTimer = window.setInterval(goToNextReview, 5000);
  }
}

reviewCarousel.querySelector(".review-next").addEventListener("click", goToNextReview);
reviewCarousel.querySelector(".review-previous").addEventListener("click", goToPreviousReview);
reviewToggle.addEventListener("click", () => {
  reviewPaused = !reviewPaused;
  updateReviewToggle();
  startReviewAutoplay();
});
reviewCarousel.addEventListener("mouseenter", () => {
  reviewPointerInside = true;
  window.clearInterval(reviewTimer);
});
reviewCarousel.addEventListener("mouseleave", () => {
  reviewPointerInside = false;
  startReviewAutoplay();
});
reviewCarousel.addEventListener("focusin", () => window.clearInterval(reviewTimer));
reviewCarousel.addEventListener("focusout", (event) => {
  if (!reviewCarousel.contains(event.relatedTarget)) startReviewAutoplay();
});
document.addEventListener("visibilitychange", startReviewAutoplay);
window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(refreshReviewCarousel, 150);
});

refreshReviewCarousel();
updateReviewToggle();
startReviewAutoplay();

document.querySelector(".contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.querySelector(".form-status");

  if (!form.reportValidity()) return;

  status.textContent = "Message envoyé avec succès ! (simulation : aucun message n’a réellement été transmis.)";
  status.classList.add("is-success");
  form.reset();
});

document.querySelector(".contact-form").addEventListener("input", () => {
  const status = document.querySelector(".form-status");
  status.textContent = "";
  status.classList.remove("is-success");
});
