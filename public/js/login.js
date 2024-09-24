document.addEventListener("DOMContentLoaded", () => {
  let JWTtoken = JSON.parse(localStorage.getItem("token"));
  console.log(JWTtoken);

  if (JWTtoken) {
    const now = new Date();

    // 만료시간(expires)이 현재 시간보다 작다면
    if (JWTtoken.expires < now.getTime()) {
      localStorage.removeItem("token");
      return;
    }

    location.href = "/";
  }

  const showPwd = document.querySelector(".showPwd");
  const showImg = document.querySelector(".showImg");

  const pwd = document.querySelector(".pwd");

  const loginForm = document.querySelector(".loginForm");

  let displayPwd = false;

  showPwd.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!displayPwd) {
      displayPwd = !displayPwd;
      pwd.type = "text";
      showImg.src = "images/eye-false.png";
    } else {
      displayPwd = !displayPwd;
      pwd.type = "password";
      showImg.src = "images/eye-true.png";
    }
  });

  // 로그인
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const username = document.querySelector("#username");
    const password = document.querySelector("#password");

    if (!username.value || !password.value) {
      loginForm.classList.add("shake");

      // 애니메이션 종료 후 클래스 제거
      setTimeout(() => {
        loginForm.classList.remove("shake");
      }, 500); // 애니메이션 시간과 동일하게 설정
      return;
    }

    const data = {
      username: username.value,
      password: password.value,
    };

    // 로그인으로 JWT 토큰 발급
    axios
      .post("/login", data)
      .then((response) => {
        const token = response.data.token;

        let now = new Date();
        let hour = 1;

        const setting = {
          value: token,
          expires: now.getTime() + hour * 60 * 1000 * 1000,
        };

        localStorage.setItem("token", JSON.stringify(setting));
        location.href = "/";
      })
      .catch((error) => {
        // 정보가 틀리면 div 흔들기
        loginForm.classList.add("shake");

        // 애니메이션 종료 후 클래스 제거
        setTimeout(() => {
          loginForm.classList.remove("shake");
        }, 500); // 애니메이션 시간과 동일하게 설정
      });
  });

  // 카카오 로그인
  // const kakaoBtn = document.querySelector(".kakao");
  // kakaoBtn.addEventListener("click", () => {
  //   // 로그인 성공 후 프론트엔드에서 처리
  //   location.href = "/login/kakao";
  // });
});
