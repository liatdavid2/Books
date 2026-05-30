const pages = Array.from(document.querySelectorAll(".page"));
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const dotsRoot = document.getElementById("dots");
const pageCounter = document.getElementById("pageCounter");

let currentPage = 0;

function createDots() {
  pages.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `עמוד ${index + 1}`);
    dot.addEventListener("click", () => showPage(index));
    dotsRoot.appendChild(dot);
  });
}

function updateControls() {
  prevBtn.disabled = currentPage === 0;
  nextBtn.disabled = currentPage === pages.length - 1;

  Array.from(dotsRoot.children).forEach((dot, index) => {
    dot.classList.toggle("is-active", index === currentPage);
  });
}

function showPage(nextPage) {
  if (nextPage < 0 || nextPage >= pages.length || nextPage === currentPage) {
    return;
  }

  const direction = nextPage > currentPage ? "forward" : "back";
  const previous = pages[currentPage];
  const next = pages[nextPage];

  previous.classList.remove("is-active");
  previous.classList.add(direction === "forward" ? "is-leaving-forward" : "is-leaving-back");

  next.classList.remove("is-leaving-forward", "is-leaving-back");
  next.classList.add("is-active");

  currentPage = nextPage;
  updateControls();

  window.setTimeout(() => {
    previous.classList.remove("is-leaving-forward", "is-leaving-back");
  }, 540);
}

function goNext() {
  showPage(currentPage + 1);
}

function goPrev() {
  showPage(currentPage - 1);
}

nextBtn.addEventListener("click", goNext);
prevBtn.addEventListener("click", goPrev);

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    goNext();
  }

  if (event.key === "ArrowRight") {
    goPrev();
  }
});

let touchStartX = null;
let touchStartY = null;

document.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
  touchStartY = event.changedTouches[0].clientY;
}, { passive: true });

document.addEventListener("touchend", (event) => {
  if (touchStartX === null || touchStartY === null) {
    return;
  }

  const touchEndX = event.changedTouches[0].clientX;
  const touchEndY = event.changedTouches[0].clientY;
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;

  if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX < 0) {
      goNext();
    } else {
      goPrev();
    }
  }

  touchStartX = null;
  touchStartY = null;
}, { passive: true });

createDots();
updateControls();
