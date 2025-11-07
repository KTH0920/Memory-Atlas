import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import "../styles.css";

const AddMemory = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [map, setMap] = useState(null);
  const markerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ 지도 초기화 (마커 1개만 표시)
  useEffect(() => {
    const loadMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          const container = document.getElementById("mini-map");
          if (!container) {
            console.error("mini-map 컨테이너를 찾을 수 없습니다.");
            return;
          }

          const options = {
            center: new window.kakao.maps.LatLng(37.5665, 126.9780),
            level: 5,
          };

          const mapInstance = new window.kakao.maps.Map(container, options);
          setMap(mapInstance);

          console.log("✅ 지도 초기화 완료");
          console.log("✅ services 사용 가능:", !!window.kakao.maps.services);

          // 클릭 이벤트 등록
          window.kakao.maps.event.addListener(mapInstance, "click", (mouseEvent) => {
            const latlng = mouseEvent.latLng;

            // 기존 마커 제거
            if (markerRef.current) {
              markerRef.current.setMap(null);
            }

            // 새 마커 생성
            const newMarker = new window.kakao.maps.Marker({
              position: latlng,
              map: mapInstance,
            });

            markerRef.current = newMarker;
            setLat(latlng.getLat());
            setLng(latlng.getLng());
          });
        });
      }
    };

    if (window.kakao && window.kakao.maps) {
      loadMap();
    } else {
      console.log("카카오맵 SDK 로딩 대기 중...");
      const checkKakao = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkKakao);
          console.log("카카오맵 SDK 로드 완료");
          loadMap();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkKakao);
        if (!map) {
          console.error("❌ 카카오맵 SDK 로드 타임아웃");
        }
      }, 10000);
    }
  }, []);

  // ✅ 장소 검색
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      alert("검색어를 입력해주세요.");
      return;
    }

    if (!map) {
      alert("지도가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (!window.kakao || !window.kakao.maps) {
      alert("카카오맵이 로드되지 않았습니다.");
      return;
    }

    try {
      if (!window.kakao.maps.services) {
        console.error("services 라이브러리가 없습니다!");
        alert("검색 서비스 라이브러리가 로드되지 않았습니다. 페이지를 새로고침해주세요.");
        return;
      }

      const ps = new window.kakao.maps.services.Places();

      ps.keywordSearch(searchQuery, (data, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const place = data[0];
          const coords = new window.kakao.maps.LatLng(place.y, place.x);

          // 기존 마커 제거
          if (markerRef.current) markerRef.current.setMap(null);

          // 새 마커 표시
          const newMarker = new window.kakao.maps.Marker({
            map: map,
            position: coords,
          });

          markerRef.current = newMarker;
          map.setCenter(coords);

          setLat(coords.getLat());
          setLng(coords.getLng());

          alert(`📍 ${place.place_name}로 이동했습니다.`);
        } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
          alert("검색 결과가 없습니다. 다른 키워드로 검색해주세요.");
        } else {
          console.error("검색 실패 - status:", status);
          alert("검색 중 오류가 발생했습니다.");
        }
      });
    } catch (error) {
      console.error("검색 기능 오류 상세:", error);
      alert(`검색 기능 오류: ${error.message}\n\n브라우저 콘솔(F12)을 확인해주세요.`);
    }
  };

  // Enter 키로 검색
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // ✅ 추억 추가
  const handleAddMemory = async (e) => {
    e.preventDefault();
    if (!image) return alert("이미지를 선택해주세요!");
    if (!lat || !lng) return alert("지도를 클릭하거나 장소를 검색하세요!");

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("desc", desc);
    formData.append("image", image);
    formData.append("lat", lat);
    formData.append("lng", lng);

    try {
      await api.post("/memories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("새 추억이 등록되었습니다!");
      navigate("/mypage");
    } catch (err) {
      console.error("추억 등록 실패:", err);
      alert("추억 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 취소 버튼
  const handleCancel = () => {
    if (window.confirm("작성을 취소하고 돌아가시겠습니까?")) {
      navigate("/mypage");
    }
  };

  return (
    <div className="dashboard-container">
      {/* 상단 헤더 */}
      <div className="dashboard-header">
        <h1 className="page-title">📝 추억 등록</h1>
        <div className="header-buttons">
          <button className="map-btn" onClick={handleCancel}>
            돌아가기
          </button>
        </div>
      </div>

      {/* 업로드 폼 */}
      <form onSubmit={handleAddMemory} className="memory-form">
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="내용"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        {/* 🔍 검색창 */}
        <div className="search-container">
          <input
            type="text"
            placeholder="장소를 검색하세요 (예: 진접역)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
          />
          <button type="button" onClick={handleSearch}>
            검색
          </button>
        </div>

        {/* 지도 */}
        <div
          id="mini-map"
          style={{
            width: "100%",
            height: "400px",
            borderRadius: "10px",
            marginBottom: "15px",
            backgroundColor: "#f9f9f9",
          }}
        ></div>

        {lat && lng && (
          <p style={{ color: "#333", fontSize: "0.9rem" }}>
            📍 선택된 위치: {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "업로드 중..." : "추억 등록"}
        </button>
      </form>
    </div>
  );
};

export default AddMemory;
