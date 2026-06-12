const slides = Array.from(document.querySelectorAll(".slide"));
const prevButton = document.getElementById("prevSlide");
const nextButton = document.getElementById("nextSlide");
const slideCount = document.getElementById("slideCount");
const progressBar = document.getElementById("progressBar");
const deck = document.querySelector(".deck");
const slideImages = Array.from(document.querySelectorAll(".slide img"));

let currentSlide = 0;
let imageLightbox = null;
let lightboxImage = null;
let lightboxCaption = null;
let lastFocusedElement = null;

function slideIndexFromHash() {
  const value = Number.parseInt(window.location.hash.replace("#", ""), 10);
  if (Number.isNaN(value)) {
    return 0;
  }

  return value - 1;
}

function showSlide(index) {
  currentSlide = Math.max(0, Math.min(index, slides.length - 1));

  slides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === currentSlide;
    slide.classList.toggle("active", isActive);
    slide.setAttribute("aria-hidden", String(!isActive));
  });

  const current = currentSlide + 1;
  slideCount.textContent = `${String(current).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  progressBar.style.width = `${(current / slides.length) * 100}%`;

  prevButton.disabled = currentSlide === 0;
  nextButton.disabled = currentSlide === slides.length - 1;

  const expectedHash = `#${current}`;
  if (window.location.hash !== expectedHash) {
    window.history.replaceState(null, "", expectedHash);
  }
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

function previousSlide() {
  showSlide(currentSlide - 1);
}

function createImageLightbox() {
  const lightbox = document.createElement("div");
  lightbox.className = "image-lightbox";
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Cerrar imagen ampliada">×</button>
    <figure class="lightbox-frame">
      <img class="lightbox-image" alt="" />
      <figcaption class="lightbox-caption"></figcaption>
    </figure>
  `;

  document.body.appendChild(lightbox);

  imageLightbox = lightbox;
  lightboxImage = lightbox.querySelector(".lightbox-image");
  lightboxCaption = lightbox.querySelector(".lightbox-caption");

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox || event.target.classList.contains("lightbox-close")) {
      closeImageLightbox();
    }
  });
}

function openImageLightbox(image) {
  if (!imageLightbox) {
    createImageLightbox();
  }

  const figure = image.closest("figure");
  const caption = figure?.querySelector("figcaption")?.textContent?.trim() || image.alt || "Imagen ampliada";

  lastFocusedElement = document.activeElement;
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt || caption;
  lightboxCaption.textContent = caption;
  imageLightbox.classList.add("is-open");
  imageLightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  imageLightbox.querySelector(".lightbox-close").focus();
}

function closeImageLightbox() {
  if (!imageLightbox || !imageLightbox.classList.contains("is-open")) {
    return;
  }

  imageLightbox.classList.remove("is-open");
  imageLightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  lightboxImage.removeAttribute("src");

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

prevButton.addEventListener("click", previousSlide);
nextButton.addEventListener("click", nextSlide);

slideImages.forEach((image) => {
  image.classList.add("expandable-image");
  image.setAttribute("tabindex", "0");
  image.setAttribute("role", "button");
  image.setAttribute("aria-label", `Ampliar imagen: ${image.alt || "vista de la presentación"}`);

  image.addEventListener("click", () => openImageLightbox(image));
  image.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openImageLightbox(image);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (imageLightbox?.classList.contains("is-open")) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeImageLightbox();
    }

    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
    }

    return;
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    nextSlide();
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    previousSlide();
  }

  if (event.key === "Home") {
    event.preventDefault();
    showSlide(0);
  }

  if (event.key === "End") {
    event.preventDefault();
    showSlide(slides.length - 1);
  }
});

window.addEventListener("hashchange", () => {
  showSlide(slideIndexFromHash());
});

showSlide(slideIndexFromHash());

requestAnimationFrame(() => {
  deck.classList.add("is-ready");
});
