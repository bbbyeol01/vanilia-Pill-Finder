import API_KEYS from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  const companyPage = initCompanyPage();

  // 한 화면에 보여줄 아이템 개수
  let numOfRows = 10;
  // 한 화면에 보여줄 페이지 개수
  let numOfPage = 5;
  //총 아이템 개수
  let total = 0;
  // 현재 페이지
  let page = 1;
  // 현재 페이지 그룹의 시작 페이지
  let startPage = 1;

  const searchBtn = document.querySelector(".searchBtn");
  const searchInput = document.querySelector(".searchInput");
  const searchForm = document.querySelector(".searchForm");
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
  const goToPage = document.querySelector(".goToPage");

  const iconContainer = document.querySelector(".iconContainer");
  const pillImg = document.querySelector(".iconContainer .pillImg");
  const searchOption = document.querySelector(".searchOption");

  const pillType = document.createElement("div");
  pillType.classList.add("pillType");

  searchOption.addEventListener("change", (e) => {
    console.log(e.target.value);
    if (e.target.value === "itemName") {
      searchInput.placeholder = "약 이름을 검색하세요";
    } else {
      searchInput.placeholder = "증상을 검색하세요";
    }
  });

  /** 검색했을 때 */
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();

    let userInput = searchInput.value;
    page = 1;
    startPage = 1;
    noSearch.style.display = "none"; // 초기화

    iconContainer.style.height = 0;
    iconContainer.style.margin = 0;

    pillContainer.style.height = "100vh";
    pageContainer.style.height = "10vh";

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

    // 처음엔 1페이지
    getData(userInput, 1);
  });

  /** 약 정보 클릭 시 모달 창 띄우기 */
  infoCloseBtn.addEventListener("click", () => {
    modal.style.opacity = 0;
    modal.style.zIndex = 0;
  });

  /** 제약회사별 판매처 사이트로 이동*/
  goToPage.addEventListener("click", () => {
    const pageAddr = companyPage.get(modalCompany.innerHTML);
    window.open(pageAddr);
  });

  /** 이전 버튼 클릭 시  */
  prevBtn.addEventListener("click", () => {
    console.log(`startPage = ${startPage}`);
    if (startPage > 1) {
      startPage -= numOfPage; // 페이지 범위 변경
      renderPagination();
    }
  });

  /** 다음 버튼 클릭 시 */
  nextBtn.addEventListener("click", () => {
    console.log(`startPage = ${startPage}`);
    if (startPage < total / numOfPage) {
      startPage += numOfPage; // 페이지 범위 변경
    }
    renderPagination();
  });

  /** 제약회사 판매처 Map (제약회사 이름 : 약국 찾기 페이지) */
  function initCompanyPage() {
    const companyData = {
      "한미약품(주)":
        "https://www.hanmi.co.kr/business/product/pharmacy/search.hm",
      "동아제약(주)": "http://www.dpharm.co.kr/pharmacy/finder",
      "태극제약(주)": "https://www.taiguk.co.kr/store/list.jsp",
      "(주)대웅제약": "https://www.daewoong.co.kr/kr/product/pharmacy",
      "제이더블유중외제약(주)":
        "https://www.jw-pharma.co.kr/mobile/pharma/ko/product/pharmacy_search.jsp",
      "(주)종근당": "https://www.ckdpharm.com/searchPharmacy.do",
      "(주)유유제약": "https://www.yuyu.co.kr/en/productInfo/pharmacy.do",
      "(유)한풍제약": "https://www.hanpoong.co.kr/products/find-sales-pharmacy",
      "광동제약(주)": "https://www.ekdp.com/inc/search_phamacy.do",
      "(주)유한양행": "https://www.yuhan.co.kr/Products/Pharmacy/",
      "대원제약(주)": "https://www.daewonpharm.com/products/sub03_01.jsp",
      "일동제약(주)": "https://mobile.ildong.com/kor/pharm/list.id",
      "현대약품(주)": "http://www.hyundaipharm.co.kr/store/result.jsp",
      "동화약품(주)": "https://www.dong-wha.co.kr/product/pharm_search1.asp",
      "(주)보령": "https://pharm.boryung.co.kr/product/search_pharmacy.do",
      "(주)녹십자": "https://m.gcbiopharma.com/product/store.do",
      "신신제약(주)": "https://www.sinsin.com/sinsinpas/pop_store.php",
      "삼진제약(주)":
        "https://www.samjinpharm.co.kr/front/kr/product/pharmacy.asp",
      "정우신약(주)": "http://www.jwpharm.co.kr/m/pharmacy/step1.php",
      "지엘파마(주)": "https://www.glpharma.co.kr/purchase",
      "조아제약(주)":
        "https://www.joeunai.co.kr/Customer/Find_Shop/FindShop.asp",
      "동성제약(주)":
        "http://dongsung-pharm.com/user/product/product_Pharmsearchlist.php?act_Flag=inside&search_key=product_name&mcate1=2&stype=detail&cate1=&searchWD2=",
      "(주)퍼슨": "https://www.firsonhealthcare.com/sub_customer/pharmacy.php",
      "부광약품(주)": "https://www.bukwang.co.kr/m68.php",
      "(주)녹십자": "http://m.gcbiopharma.com/product/store.do",
      "오스틴제약(주)": "https://www.jeyak.co.kr/sub06/sub01.php",
      "한화제약(주)": "http://erp.hwpharm.com/OTC_DrugStore.asp",
      "(주)동구바이오제약": "https://www.dongkoo.com/kor/product/list",
      주식회사제뉴원사이언스: "https://genuonesciences.com/products/otc/",
      "(주)휴비스트제약": "http://www.huvist.co.kr/sub02/cmo.php",
    };

    // Map으로 변환
    return new Map(Object.entries(companyData));
  }

  /** open api e약은요 */
  async function getData(userInput, pageNo) {
    let searchType = searchOption.value;

    const url = `http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList?ServiceKey=${
      API_KEYS.PILL_API_KEY
    }&type=${"json"}&pageNo=${pageNo}&numOfRows=${numOfRows}&${searchType}=${userInput}`;

    axios
      .get(url)
      .then((response) => {
        const data = response.data.body;

        console.log(data);
        const pills = [];
        page = data.pageNo;
        total = data.totalCount;

        data.items.map((pill) => {
          /**
           * name: 약 이름
           * company: 제약회사
           * efficacy: 효능
           * method: 복용방법
           * image: 사진
           * date: 등록 날짜
           * code: 코드
           */
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

        // 이름으로 오름차순 정렬(페이지당 적용)
        pills.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });

        printInfo(pills);
      })
      .catch((error) => {
        console.error("없는데요?");
        console.error(error);
        noSearch.style.display = "flex";
        count.innerHTML = "";
      }); // axios
  } //  async function getData(userInput, pageNo)

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
      image.loading = "lazy";

      // 이미지가 로딩되기 전 null-img를 보여주고, 실제 이미지가 로딩된 후 변경
      const tempImg = new Image(); // 임시 이미지 객체 생성
      tempImg.src = pill.image; // 실제 이미지 URL 설정

      // 실제 이미지 로딩이 완료되면 교체
      tempImg.onload = () => {
        image.src = pill.image;
      };

      /** 아이템 클릭하면 모달창 정보 변경 -> 띄움 */
      pillItem.addEventListener("click", () => {
        goToPage.style.backgroundColor = "#96b9ff";
        const value = pillItem.getAttribute("data-value");
        console.log(value);
        modalCompany.innerHTML = pill.company;
        modalImg.src = pill.image ? pill.image : "images/null-img.jpg";
        modalName.innerHTML = pill.name;
        modalEfficacy.innerHTML = pill.efficacy;
        modalMethod.innerHTML = pill.method;
        modal.style.opacity = 1;
        modal.style.zIndex = 9999999;

        if (!companyPage.get(modalCompany.innerHTML)) {
          goToPage.style.backgroundColor = "lightgray";
        }
      });
    }); // pills.forEach((pill, index) => {

    renderPagination();
    pillContainer.appendChild(pageContainer);
  } //  function printInfo(pills)

  // 페이지네이션
  function renderPagination() {
    pageList.innerHTML = ""; // 기존 페이지 버튼 삭제
    pageContainer.style.opacity = 1;

    let totalPages = Math.ceil(total / numOfRows); // 총 페이지 수
    let endPage = startPage + numOfPage - 1; // 한 번에 5개의 페이지 버튼만 표시 (startPage에서 4를 더한 값)

    // endPage가 총 페이지 수를 넘지 않도록 조정
    if (endPage > totalPages) {
      endPage = totalPages;
    }

    // 이전 버튼 (시작 페이지가 1보다 크면 활성화)
    prevBtn.disabled = startPage === 1;

    // 다음 버튼 (endPage가 총 페이지 수보다 작으면 활성화)
    nextBtn.disabled = endPage === totalPages;

    // 페이지 버튼 생성
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.textContent = i;
      pageBtn.value = i;
      pageBtn.classList.add("pageBtn");

      // 버튼이 현재 페이지와 같다면
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
