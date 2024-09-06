"use strict";

var _config = _interopRequireDefault(require("./config.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var numOfRows = 10;
document.addEventListener("DOMContentLoaded", function () {
  var searchBtn = document.querySelector(".searchBtn");
  var searchInput = document.querySelector(".searchInput");
  var pillContainer = document.querySelector(".pillContainer");
  var pageContainer = document.querySelector(".pageContainer");
  var prevBtn = document.querySelector(".prevBtn");
  var nextBtn = document.querySelector(".nextBtn");
  var loading = document.querySelector(".loading");
  var noSearch = document.querySelector(".noSearch");
  var count = document.querySelector(".count");
  var pageBtns = document.querySelectorAll(".pageBtn");
  var infoContainer = document.querySelector(".infoContainer");
  var infoCloseBtn = document.querySelector(".infoContainer .close");
  var modal = document.querySelector(".modal");
  var modalImg = document.querySelector(".infoContainer .image .pillImg");
  var modalName = document.querySelector(".infoContainer .name");
  var modalEfficacy = document.querySelector(".infoContainer .efficacy");
  var modalMethod = document.querySelector(".infoContainer .method");
  searchBtn.addEventListener("click", function () {
    var pillName = searchInput.value;
    noSearch.style.display = "none"; // 초기화

    Array.from(pillContainer.children).forEach(function (child) {
      if (!child.classList.contains("noSearch") && !child.classList.contains("loading") && !child.classList.contains("count")) {
        pillContainer.removeChild(child);
      }
    });
    getData(pillName);
  });
  searchInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      // Enter 키가 눌렸을 때
      var pillName = searchInput.value;
      noSearch.style.display = "none"; // 초기화

      Array.from(pillContainer.children).forEach(function (child) {
        if (!child.classList.contains("noSearch") && !child.classList.contains("loading") && !child.classList.contains("count")) {
          pillContainer.removeChild(child);
        }
      });
      getData(pillName, 1);
    }
  });
  infoCloseBtn.addEventListener("click", function () {
    modal.style.opacity = 0;
    modal.style.zIndex = 0;
  });
  pageBtns.forEach(function (pageBtn) {
    pageBtn.addEventListener("click", function (event) {
      var dataValue = event.target.getAttribute("data-value");
      console.log(dataValue);
    });
  });

  function getData(pillName, pageNo) {
    var url, response, data, pills, page, total;
    return regeneratorRuntime.async(function getData$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            url = "http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList?ServiceKey=".concat(_config["default"], "&type=", "json", "&pageNo=").concat(pageNo, "&numOfRows=").concat(numOfRows, "&itemName=").concat(pillName);
            _context.next = 3;
            return regeneratorRuntime.awrap(fetch(url));

          case 3:
            response = _context.sent;
            _context.next = 6;
            return regeneratorRuntime.awrap(response.json());

          case 6:
            data = _context.sent;
            console.log(data);

            if (data.body.items) {
              _context.next = 13;
              break;
            }

            console.log("없는데요?");
            noSearch.style.display = "flex";
            count.innerHTML = "";
            return _context.abrupt("return");

          case 13:
            pills = [];
            page = data.body.pageNo;
            total = data.body.totalCount;
            data.body.items.map(function (pill) {
              pills.push({
                name: pill.itemName,
                efficacy: pill.efcyQesitm ? pill.efcyQesitm.replaceAll(".", ". ") : pill.efcyQesitm,
                method: pill.useMethodQesitm ? pill.useMethodQesitm.replaceAll(".", ". ") : pill.useMethodQesitm,
                image: pill.itemImage,
                date: pill.openDe,
                code: pill.bizrno
              });
            }); // 이름으로 오름차순 정렬

            pills.sort(function (a, b) {
              return a.name.localeCompare(b.name);
            });
            printInfo(pills, total, page);

          case 19:
          case "end":
            return _context.stop();
        }
      }
    });
  }
  /** 약 리스트 출력 */


  function printInfo(pills, total, page) {
    count.innerHTML = "\uCD1D <strong>".concat(total, "</strong>\uAC1C\uC758 \uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC788\uC2B5\uB2C8\uB2E4.");
    Array.from(pillContainer.children).forEach(function (child) {
      if (!child.classList.contains("noSearch") && !child.classList.contains("loading") && !child.classList.contains("count")) {
        pillContainer.removeChild(child);
      }
    });
    loading.style.opacity = 1;
    loading.style.zIndex = 9999;
    pills.forEach(function (pill, index) {
      var pillItem = document.createElement("div");
      pillItem.setAttribute("data-value", index);
      var image = document.createElement("img");
      var name = document.createElement("div"); // 초기에는 null-img를 먼저 보여줌

      image.classList.add("img");
      image.src = "./images/null-img.jpg"; // 기본 이미지 설정
      // pill의 이름 추가

      name.classList.add("name");
      var nameText = document.createElement("p");
      nameText.classList.add("name-text");
      nameText.textContent = pill.name;
      name.appendChild(nameText);
      pillItem.appendChild(image); // pillItem에 이미지 추가

      pillItem.appendChild(name); // pillItem에 이름 추가

      pillItem.classList.add("pill-item");
      pillContainer.appendChild(pillItem); // pillContainer에 pillItem 추가
      // 이미지가 로딩되기 전 null-img를 보여주고, 실제 이미지가 로딩된 후 변경

      var tempImg = new Image(); // 임시 이미지 객체 생성

      tempImg.src = pill.image; // 실제 이미지 URL 설정
      // 실제 이미지 로딩이 완료되면 교체

      tempImg.onload = function () {
        image.src = pill.image;
        setTimeout(function () {
          loading.style.opacity = 0;
          loading.style.zIndex = -999;
        }, 500);
      };

      pillItem.addEventListener("click", function () {
        var value = pillItem.getAttribute("data-value");
        console.log(value);
        modalImg.src = pill.image ? pill.image : "./images/null-img.jpg";
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

    for (var i = 1; i <= total / numOfRows; i++) {
      if (10 < i) {
        break;
      }

      var pageBtn = document.createElement("div");
      pageBtn.classList.add("pageBtn");
      pageBtn.innerHTML = i;

      if (i == page) {
        pageBtn.classList.add("active");
      }

      pageBtn.setAttribute("data-value", i);
      pageBtn.addEventListener("click", function (event) {
        var dataValue = event.target.getAttribute("data-value");
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