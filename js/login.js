document.addEventListener("DOMContentLoaded", () => {
  const showPwd = document.querySelector(".showPwd");
  const showImg = document.querySelector(".showImg");

  const pwd = document.querySelector(".pwd");

  let displayPwd = false;

  showPwd.addEventListener("click", () => {
    // alert("click!");
    if (!displayPwd) {
      displayPwd = !displayPwd;
      pwd.type = "text";
      showImg.src = "images/eye-true.png";
    } else {
      displayPwd = !displayPwd;
      pwd.type = "password";
      showImg.src = "images/eye-false.png";
    }
  });
});
