document.addEventListener("DOMContentLoaded", () => {
  const logoContainer = document.querySelector(".logoContainer");
  const pillFinder = document.querySelector(".pillFinder");
  const findMap = document.querySelector(".findMap");
  const login = document.querySelector(".login");
  const mypage = document.querySelector(".mypage");

  pillFinder.addEventListener("click", () => {
    location.href = "/";
  });

  logoContainer.addEventListener("click", () => {
    location.href = "/";
  });

  findMap.addEventListener("click", () => {
    location.href = "/map";
  });

  login.addEventListener("click", () => {
    location.href = "/login";
  });

  mypage.addEventListener("click", () => {
    location.href = "/mypage";
  });

  const loginBtn = document.querySelector(".login");
  const userInfo = document.querySelector(".userInfo");
  const userMenu = document.querySelector(".userInfo .menu");
  const logout = document.querySelector(".logout");
  const profileImage = document.querySelectorAll(".profile-image");

  const JWTtoken = localStorage.getItem("token");

  if (JWTtoken) {
    let now = new Date();

    // 만료시간(expires)이 지났다면
    if (JWTtoken.expires > now.getTime()) {
      console.log(true);
      localStorage.removeItem("token");
      return;
    }

    getUserInfo();
  }

  if (userInfo) {
    userInfo.style.display = "none";

    userInfo.addEventListener("mouseenter", () => {
      userMenu.classList.add("active");
    });
  }

  if (userMenu) {
    userMenu.addEventListener("mouseleave", () => {
      userMenu.classList.remove("active");
    });
  }

  if (logout) {
    logout.addEventListener("click", () => {
      axios.post("/logout");
      localStorage.removeItem("token");
      location.reload();
    });
  }

  function getUserInfo() {
    const token = JSON.parse(localStorage.getItem("token")); // 저장된 토큰 가져오기

    axios
      .get("/api/user-info", {
        headers: {
          Authorization: `Bearer ${token.value}`, // 헤더에 토큰 추가
        },
      })
      .then((response) => {
        const user = response.data[0];
        profileImage.forEach((img) => {
          img.src = user.profile_image
            ? user.profile_image
            : "images/unnamed.jpg";
        });

        userInfo.style.display = "flex";
        loginBtn.style.display = "none";
      })
      .catch((error) => {
        console.error("유저 정보를 불러올 수 없습니다. ", error);
      });
  }
});
