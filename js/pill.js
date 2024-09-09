import API_KEY from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  // 초기값
  let numOfRows = 10;
  let total = 0;
  let page = 1; // 현재 페이지
  let startPage = 1; // 현재 페이지 그룹의 시작 페이지

  const logo = document.querySelector(".logo");

  const searchBtn = document.querySelector(".searchBtn");
  const searchInput = document.querySelector(".searchInput");
  const pillContainer = document.querySelector(".pillContainer");
  const pageContainer = document.querySelector(".pageContainer");
  const pageList = document.querySelector(".pageList");
  const prevBtn = document.querySelector(".prevBtn");
  const nextBtn = document.querySelector(".nextBtn");

  const noSearch = document.querySelector(".noSearch");
  const count = document.querySelector(".count");

  const infoContainer = document.querySelector(".infoContainer");
  const infoCloseBtn = document.querySelector(".infoContainer .close");

  const modal = document.querySelector(".modal");
  const modalImg = document.querySelector(".infoContainer .image .pillImg");
  const modalName = document.querySelector(
    ".infoContainer .nameContainer .name"
  );
  const modalCompany = document.querySelector(".company");
  const modalEfficacy = document.querySelector(".infoContainer .efficacy");
  const modalMethod = document.querySelector(".infoContainer .method");

  const iconContainer = document.querySelector(".iconContainer");
  const pillImg = document.querySelector(".iconContainer .pillImg");
  const searchOption = document.querySelector(".searchOption");

  const pillType = document.createElement("div");
  pillType.classList.add("pillType");

  logo.addEventListener("click", () => {
    location.href = "pill.html";
  });

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
    page = 1;
    startPage = 1;
    noSearch.style.display = "none"; // 초기화

    iconContainer.style.height = 0;
    iconContainer.style.margin = 0;

    pillContainer.style.height = "100%";

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
      page = 1;
      startPage = 1;
      noSearch.style.display = "none"; // 초기화

      pillContainer.style.height = "100vh";

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

  // 이전 버튼 클릭 시
  prevBtn.addEventListener("click", () => {
    console.log(`startPage = ${startPage}`);
    if (startPage > 1) {
      startPage -= numOfRows; // 페이지 범위 변경
      renderPagination();
    }
  });

  // 다음 버튼 클릭 시
  nextBtn.addEventListener("click", () => {
    console.log(`startPage = ${startPage}`);
    if (startPage < total / numOfRows) {
      startPage += numOfRows; // 페이지 범위 변경
    }
    renderPagination();
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
    page = data.body.pageNo;
    total = data.body.totalCount;
    data.body.items.map((pill) => {
      pills.push({
        name: pill.itemName,
        company: pill.entpName,
        efficacy: pill.efcyQesitm
          ? pill.efcyQesitm.replaceAll(".", ". ")
          : pill.efcyQesitm,
        method: pill.useMethodQesitm
          ? pill.useMethodQesitm.replaceAll(".", ". ")
          : pill.useMethodQesitm,
        image: pill.itemImage ? pill.itemImage : "",
        date: pill.openDe,
        code: pill.bizrno,
      });
    });

    // 이름으로 오름차순 정렬
    pills.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    printInfo(pills);
  }

  /** 약 리스트 출력 */
  function printInfo(pills) {
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

    /** 아이템 목록 추가 */
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

      /** 아이템 클릭하면 모달창 정보 변경 -> 띄움 */
      pillItem.addEventListener("click", () => {
        const value = pillItem.getAttribute("data-value");
        console.log(value);
        modalCompany.innerHTML = pill.company;
        modalImg.src = pill.image ? pill.image : "images/null-img.jpg";
        modalName.innerHTML = pill.name;
        modalEfficacy.innerHTML = pill.efficacy;
        modalMethod.innerHTML = pill.method;
        modal.style.opacity = 1;
        modal.style.zIndex = 9999;
      });
    });

    renderPagination();
    pillContainer.appendChild(pageContainer);
  }

  // 페이지네이션
  function renderPagination() {
    pageList.innerHTML = ""; // 기존 페이지 버튼 삭제
    pageContainer.style.opacity = 1;

    let endPage = total / numOfRows; // 현재 페이지 그룹의 마지막 페이지
    if (total % numOfRows) {
      endPage++;
    }

    // 페이지 범위 설정
    endPage = Math.min(startPage + numOfRows - 1, endPage);

    // 페이지 버튼 생성
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.textContent = i;
      pageBtn.value = i;
      pageBtn.classList.add("pageBtn");

      if (page === i) {
        pageBtn.classList.add("active");
      }

      pageBtn.addEventListener("click", (e) => {
        page = parseInt(e.target.value); // 현재 페이지 업데이트
        getData(searchInput.value, page);
        console.log("현재 페이지:", page); // 페이지 클릭 시 페이지 값 출력
      });
      pageList.appendChild(pageBtn);
    }
  }
});
