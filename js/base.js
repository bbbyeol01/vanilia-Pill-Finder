document.addEventListener("DOMContentLoaded", () => {
  const logoContainer = document.querySelector(".logoContainer");
  const pillFinder = document.querySelector(".pillFinder");
  const findMap = document.querySelector(".findMap");
  const login = document.querySelector(".login");

  pillFinder.addEventListener("click", () => {
    location.href = "index.html";
  });

  logoContainer.addEventListener("click", () => {
    location.href = "index.html";
  });

  findMap.addEventListener("click", () => {
    location.href = "map.html";
  });

  login.addEventListener("click", () => {
    location.href = "login.html";
  });
});
