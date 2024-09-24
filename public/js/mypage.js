document.addEventListener("DOMContentLoaded", () => {
  const userInfoContainer = document.querySelector(".userInfoContainer");
  const nickname = document.querySelector(".nickname");

  const token = localStorage.getItem("token");

  if (token) {
    getUserInfo();
  } else {
    location.href = "/";
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
        nickname.innerHTML = user.nickname;
      })
      .catch((error) => {
        console.error("유저 정보를 불러올 수 없습니다. ", error);
      });
  }
});
