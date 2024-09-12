document.addEventListener("DOMContentLoaded", () => {
  let myLocation = {
    latitude: 37.472552,
    longitude: 126.886209,
  };

  const mapInfo = document.querySelector(".mapInfo");
  const mapContainer = document.querySelector(".map"); // 지도를 표시할 div
  const goToMyLocation = document.querySelector(".goToMyLocation");
  const mapLoading = document.querySelector(".mapLoading");

  mapLoading.style.visibility = "hidden";

  const mapOption = {
    center: new kakao.maps.LatLng(myLocation.latitude, myLocation.longitude), // 지도의 중심좌표
    level: 6, // 지도의 확대 레벨
  };

  // 지도를 생성합니다
  var map = new kakao.maps.Map(mapContainer, mapOption);

  // 장소 검색 객체를 생성합니다
  var ps = new kakao.maps.services.Places();

  goToMyLocation.addEventListener("click", () => {
    setCenter(myLocation.latitude, myLocation.longitude);
  });

  // 내 위치 불러오기 => callback(latitude, longitude)
  function getMyLocation(callback) {
    navigator.geolocation.getCurrentPosition(function (pos) {
      callback(pos.coords.latitude, pos.coords.longitude);
    });
  }

  /** 지도 센터 변경 */
  function setCenter(latitude, longitude) {
    // 이동할 위도 경도 위치를 생성
    var moveLatLon = new kakao.maps.LatLng(latitude, longitude);
    // 지도 중심 이동
    map.panTo(moveLatLon);
  }

  /** 주소 목록 추가 */
  function addListBtn(place) {
    const marker = new kakao.maps.Marker({
      map: map,
      position: new kakao.maps.LatLng(place.y, place.x),
    });

    const infowindow = new kakao.maps.InfoWindow({
      content: `<div style="padding:15px;"><div style="text-align:center;">${place.place_name}</div></div>`,
    });

    const spot = document.createElement("div");
    const spotInfo = document.createElement("div");
    const goToSpot = document.createElement("button");
    const spotNavigate = document.createElement("img");
    spotNavigate.src = "images/navigation-icon.png";
    spotNavigate.classList.add("spotNavigate");
    goToSpot.appendChild(spotNavigate);

    spot.classList.add("spot");
    spotInfo.classList.add("spotInfo");
    goToSpot.classList.add("goToSpot");

    const name = document.createElement("div");
    name.classList.add("name");
    name.innerHTML = place.place_name;
    const addr = document.createElement("div");
    addr.classList.add("addr");
    addr.innerHTML = place.road_address_name;
    const tel = document.createElement("div");
    tel.classList.add("tel");
    tel.innerHTML = "☎️ " + place.phone;

    spotInfo.appendChild(name);
    spotInfo.appendChild(addr);
    spotInfo.appendChild(tel);

    spot.appendChild(spotInfo);
    spot.appendChild(goToSpot);

    // spot.classList.add(place.id);
    spot.setAttribute("data-id", place.id);

    spot.addEventListener("click", () => {
      infowindow.open(map, marker);
      setCenter(place.y, place.x);
      spot.style.backgroundColor = "#96b9ff";
      spot.style.outline = "";
      spot.style.color = "white";
      spotNavigate.style.backgroundColor = "white";
      spotNavigate.src = "images/navigation-icon-color.png";
    });

    spot.addEventListener("mouseleave", () => {
      infowindow.close(map, marker);
      spot.style.backgroundColor = "";
      spot.style.color = "";
      spotNavigate.style.backgroundColor = "#96b9ff";
      spotNavigate.src = "images/navigation-icon.png";
    });

    spotNavigate.addEventListener("click", () => {
      window.open(place.place_url);
    });

    mapInfo.append(spot);

    kakao.maps.event.addListener(marker, "mouseover", function () {
      infowindow.open(map, marker);
      spot.style.outline = "solid 2px #96b9ff";
    });

    kakao.maps.event.addListener(marker, "click", () => {
      spot.style.backgroundColor = "#96b9ff";
      spot.style.outline = "";
      spot.style.color = "white";

      const spotDiv = document.querySelector(`[data-id="${place.id}"]`);
      if (spotDiv) {
        spotDiv.scrollIntoView({
          behavior: "smooth", // 스크롤 애니메이션 (부드럽게)
          block: "start", // 요소의 상단으로 스크롤 정렬
          inline: "nearest", // 수평 위치도 맞춤
        });
      }
    });

    kakao.maps.event.addListener(marker, "mouseout", function () {
      spot.style.outline = "";
      spot.style.backgroundColor = "";
      spot.style.color = "";
      infowindow.close();
    });
  }

  getMyLocation((latitude, longitude) => {
    // 위치를 받아오는 동안 로딩창
    mapLoading.style.visibility = "visible";

    myLocation = {
      latitude: latitude,
      longitude: longitude,
    };

    console.log(myLocation);
    // 내 위치로 지도 센터 변경, 마커 추가

    // 커스텀 마커 이미지
    const customMarkerImage = new kakao.maps.MarkerImage(
      "images/marker-red.png", // 마커 이미지 URL
      new kakao.maps.Size(35, 35), // 마커 이미지 크기
      {
        offset: new kakao.maps.Point(17, 35), // 마커의 중심점 위치
      }
    );

    // const infowindow = new kakao.maps.InfoWindow({
    //   content: `<div style="padding:5px;">${"내 위치"}</div>`,
    // });

    // 내 위치 마커
    new kakao.maps.Marker({
      position: new kakao.maps.LatLng(
        myLocation.latitude,
        myLocation.longitude
      ),
      map: map,
      clickable: true,
      image: customMarkerImage,
    });

    setCenter(latitude, longitude);

    // 내 위치 근처 약국 검색
    ps.keywordSearch(
      "약국",
      (data, status, pagination) => {
        if (status === kakao.maps.services.Status.OK) {
          console.log("검색 결과:", data);

          // 검색 결과를 지도에 마커로 표시
          data.forEach((place) => {
            // 마커 이벤트 추가

            addListBtn(place);

            // 로딩창 지우기
            mapLoading.style.visibility = "hidden";
          });
        } else {
          console.log("검색 실패:", status);
        }
      }, // callback 함수
      {
        location: new kakao.maps.LatLng(
          myLocation.latitude,
          myLocation.longitude
        ), // 중심 위치
        radius: 1000, // 반경 1km
      } // 내 위치 정보
    );
  });
});
