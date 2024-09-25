document.addEventListener("DOMContentLoaded", () => {
  const userInfoContainer = document.querySelector(".userInfoContainer");
  const nickname = document.querySelector(".nickname");
  const mySymptomContainer = document.querySelector(".mySymptomContainer");
  const myPillContainer = document.querySelector(".myPillContainer");

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

        const username = user.username;

        mySymptomContainer.innerHTML = "";
        myPillContainer.innerHTML = "";

        axios.get(`/symptom/${username}`).then((response) => {
          response.data.symptomList.forEach((symptom) => {
            const symptomDiv = document.createElement("div");
            symptomDiv.classList.add("mySymptom");
            symptomDiv.innerHTML = symptom;
            mySymptomContainer.appendChild(symptomDiv);
          });
        });

        axios.get(`/pill/${username}`).then((response) => {
          response.data.pillList.forEach((pill) => {
            const pillDiv = document.createElement("div");
            pillDiv.classList.add("myPill");
            pillDiv.innerHTML = pill;

            pillDiv.addEventListener("click", () => {
              // 그 약 정보 가져오는 거...
            });

            myPillContainer.appendChild(pillDiv);
          });
        });
      })
      .catch((error) => {
        console.error("유저 정보를 불러올 수 없습니다. ", error);
      });
  }
});
