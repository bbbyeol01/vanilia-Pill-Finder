import API_KEY from "./config.js";

let numOfRows = 10;

document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.querySelector(".searchBtn");
  const searchInput = document.querySelector(".searchInput");
  const pillContainer = document.querySelector(".pillContainer");
  const pageContainer = document.querySelector(".pageContainer");
  const prevBtn = document.querySelector(".prevBtn");
  const nextBtn = document.querySelector(".nextBtn");

  const loading = document.querySelector(".loading");
  const noSearch = document.querySelector(".noSearch");
  const count = document.querySelector(".count");
  const pageBtns = document.querySelectorAll(".pageBtn");

  const infoContainer = document.querySelector(".infoContainer");
  const infoCloseBtn = document.querySelector(".infoContainer .close");

  const modal = document.querySelector(".modal");
  const modalImg = document.querySelector(".infoContainer .image .pillImg");
  const modalName = document.querySelector(".infoContainer .name");
  const modalEfficacy = document.querySelector(".infoContainer .efficacy");
  const modalMethod = document.querySelector(".infoContainer .method");

  const iconContainer = document.querySelector(".iconContainer");
  const pillImg = document.querySelector(".iconContainer .pillImg");
  const searchOption = document.querySelector(".searchOption");

  searchOption.addEventListener("change", (e) => {
    console.log(e.target.value);
    if (e.target.value === "itemName") {
      searchInput.placeholder = "약 이름을 검색하세요";
    } else {
      searchInput.placeholder = "증상을 검색하세요";
    }
  });

  pillImg.classList.add("active");

  // setInterval(() => {
  //   pillImg.classList.add("active");
  // }, 2500);

  // setInterval(() => {
  //   pillImg.classList.remove("active");
  // }, 5000);

  searchBtn.addEventListener("click", () => {
    let userInput = searchInput.value;
    noSearch.style.display = "none"; // 초기화

    iconContainer.style.height = 0;
    iconContainer.style.margin = 0;

    pillImg.style.width = 0;
    pillImg.style.height = 0;
    pillImg.style.opacity = 0;

    Array.from(pillContainer.children).forEach((child) => {
      if (
        !child.classList.contains("noSearch") &&
        !child.classList.contains("loading") &&
        !child.classList.contains("count")
      ) {
        pillContainer.removeChild(child);
      }
    });

    getData(userInput, 1);
  });

  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      // Enter 키가 눌렸을 때
      let userInput = searchInput.value;
      noSearch.style.display = "none"; // 초기화

      iconContainer.style.height = 0;
      iconContainer.style.margin = 0;

      pillImg.style.width = 0;
      pillImg.style.height = 0;
      pillImg.style.opacity = 0;

      Array.from(pillContainer.children).forEach((child) => {
        if (
          !child.classList.contains("noSearch") &&
          !child.classList.contains("loading") &&
          !child.classList.contains("count")
        ) {
          pillContainer.removeChild(child);
        }
      });

      getData(userInput, 1);
    }
  });

  infoCloseBtn.addEventListener("click", () => {
    modal.style.opacity = 0;
    modal.style.zIndex = 0;
  });

  pageBtns.forEach((pageBtn) => {
    pageBtn.addEventListener("click", (event) => {
      const dataValue = event.target.getAttribute("data-value");
      console.log(dataValue);
    });
  });

  /** open api */
  async function getData(userInput, pageNo) {
    let searchType = searchOption.value;

    const url = `http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList?ServiceKey=${API_KEY}&type=${"json"}&pageNo=${pageNo}&numOfRows=${numOfRows}&${searchType}=${userInput}`;

    const response = await fetch(url);
    const data = await response.json();

    console.log(data);

    if (!data.body.items) {
      console.log("없는데요?");
      noSearch.style.display = "flex";
      count.innerHTML = "";
      return;
    }

    const pills = [];
    const page = data.body.pageNo;
    const total = data.body.totalCount;
    data.body.items.map((pill) => {
      pills.push({
        name: pill.itemName,
        efficacy: pill.efcyQesitm
          ? pill.efcyQesitm.replaceAll(".", ". ")
          : pill.efcyQesitm,
        method: pill.useMethodQesitm
          ? pill.useMethodQesitm.replaceAll(".", ". ")
          : pill.useMethodQesitm,
        image: pill.itemImage,
        date: pill.openDe,
        code: pill.bizrno,
      });
    });

    // 이름으로 오름차순 정렬
    pills.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    printInfo(pills, total, page);
  }

  /** 약 리스트 출력 */
  function printInfo(pills, total, page) {
    count.innerHTML = `총 <strong>${total}</strong>개의 검색 결과가 있습니다.`;

    Array.from(pillContainer.children).forEach((child) => {
      if (
        !child.classList.contains("noSearch") &&
        !child.classList.contains("loading") &&
        !child.classList.contains("count")
      ) {
        pillContainer.removeChild(child);
      }
    });

    // loading.style.opacity = 1;
    // loading.style.zIndex = 9999;
    pills.forEach((pill, index) => {
      const pillItem = document.createElement("div");
      pillItem.setAttribute("data-value", index);

      const image = document.createElement("img");
      const name = document.createElement("div");

      // 초기에는 null-img를 먼저 보여줌
      image.classList.add("img");
      image.src = "./images/null-img.jpg"; // 기본 이미지 설정

      // pill의 이름 추가
      name.classList.add("name");
      const nameText = document.createElement("p");
      nameText.classList.add("name-text");
      nameText.textContent = pill.name;
      name.appendChild(nameText);

      pillItem.appendChild(image); // pillItem에 이미지 추가
      pillItem.appendChild(name); // pillItem에 이름 추가
      pillItem.classList.add("pill-item");

      pillContainer.appendChild(pillItem); // pillContainer에 pillItem 추가
      image.src = pill.image
        ? "/images/loading-icon-background.gif"
        : image.src;

      // 이미지가 로딩되기 전 null-img를 보여주고, 실제 이미지가 로딩된 후 변경
      const tempImg = new Image(); // 임시 이미지 객체 생성
      tempImg.src = pill.image; // 실제 이미지 URL 설정

      // 실제 이미지 로딩이 완료되면 교체
      tempImg.onload = () => {
        image.src = pill.image;
      };

      pillItem.addEventListener("click", () => {
        const value = pillItem.getAttribute("data-value");
        console.log(value);
        modalImg.src = pill.image ? pill.image : "/images/null-img.jpg";
        modalName.innerHTML = pill.name;
        modalEfficacy.innerHTML = pill.efficacy;
        modalMethod.innerHTML = pill.method;
        modal.style.opacity = 1;
        modal.style.zIndex = 9999;
      });
    });

    if (10 < page) {
      prevBtn.style.opacity = 1;
    }

    pageContainer.innerHTML = "";
    for (let i = 1; i <= total / numOfRows; i++) {
      if (10 < i) {
        break;
      }

      const pageBtn = document.createElement("div");
      pageBtn.classList.add("pageBtn");
      pageBtn.innerHTML = i;

      if (i == page) {
        pageBtn.classList.add("active");
      }

      pageBtn.setAttribute("data-value", i);

      pageBtn.addEventListener("click", (event) => {
        const dataValue = event.target.getAttribute("data-value");
        console.log(dataValue);
        getData(searchInput.value, dataValue);
      });

      pageContainer.appendChild(pageBtn);
    }

    if (10 < page) {
      nextBtn.style.opacity = 1;
    }
    pillContainer.appendChild(pageContainer);
  }
});
