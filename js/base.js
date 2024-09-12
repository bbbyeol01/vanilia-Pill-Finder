document.addEventListener("DOMContentLoaded", () => {
  const logoContainer = document.querySelector(".logoContainer");
  const pillFinder = document.querySelector(".pillFinder");
  const findMap = document.querySelector(".findMap");

  pillFinder.addEventListener("click", () => {
    location.href = "index.html";
  });

  logoContainer.addEventListener("click", () => {
    location.href = "index.html";
  });

  findMap.addEventListener("click", () => {
    location.href = "map.html";
  });
});
