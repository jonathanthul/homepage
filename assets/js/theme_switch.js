const button = document.getElementById("theme-toggle");
const body = document.body;
let themeTransitionTimeout = null;

// Load saved theme if available
if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark");
}

button.addEventListener("click", () => {
  // enable transitions for manual toggle
  body.classList.add("enable-transitions");

  // clear any pending timeout (if user clicks repeatedly)
  if (themeTransitionTimeout) clearTimeout(themeTransitionTimeout);

  // toggle theme class
  body.classList.toggle("dark");

  // persist choice
  localStorage.setItem("theme", body.classList.contains("dark") ? "dark" : "light");

  // remove the temporary transition-enabler shortly after the CSS duration
  themeTransitionTimeout = setTimeout(() => {
    body.classList.remove("enable-transitions");
    themeTransitionTimeout = null;
  }, 350);
});
