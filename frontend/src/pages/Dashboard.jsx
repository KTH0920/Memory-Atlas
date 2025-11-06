import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import "../styles.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [memories, setMemories] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [map, setMap] = useState(null);
  const markerRef = useRef(null); // useState 대신 useRef 사용
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ 로그인 유저의 추억 목록 불러오기
  const fetchMemories = async () => {
    try {
      const res = await api.get("/memories");
      setMemories(res.data);
    } catch (err) {
      console.error("메모리 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  // ✅ 로그아웃
  const handleLogout = () => {
    if (window.confirm("정말 로그아웃 하시겠습니까?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  // ✅ 지도 보기 이동
  const handleMapView = () => {
    navigate("/map");
  };

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
            center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 기본 위치: 서울
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

    // index.html에 이미 SDK 스크립트가 포함되어 있으므로 바로 로드
    if (window.kakao && window.kakao.maps) {
      loadMap();
    } else {
      // SDK가 아직 로드되지 않았다면 잠시 기다림
      console.log("카카오맵 SDK 로딩 대기 중...");
      const checkKakao = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkKakao);
          console.log("카카오맵 SDK 로드 완료");
          loadMap();
        }
      }, 100);

      // 10초 후에도 로드 안 되면 타임아웃
      setTimeout(() => {
        clearInterval(checkKakao);
        if (!map) {
          console.error("❌ 카카오맵 SDK 로드 타임아웃");
        }
      }, 10000);
    }
  }, []); // marker 제외 (중요!)

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

    console.log("=== 검색 디버깅 ===");
    console.log("window.kakao:", window.kakao);
    console.log("window.kakao.maps:", window.kakao.maps);
    console.log("window.kakao.maps.services:", window.kakao.maps.services);
    console.log("검색어:", searchQuery);

    try {
      if (!window.kakao.maps.services) {
        console.error("services 라이브러리가 없습니다!");
        alert("검색 서비스 라이브러리가 로드되지 않았습니다. 페이지를 새로고침해주세요.");
        return;
      }

      console.log("Places 객체 생성 시도...");
      const ps = new window.kakao.maps.services.Places();
      console.log("Places 객체 생성 성공:", ps);

      ps.keywordSearch(searchQuery, (data, status) => {
        console.log("검색 콜백 실행 - status:", status);
        console.log("검색 콜백 실행 - data:", data);

        if (status === window.kakao.maps.services.Status.OK) {
          const place = data[0];
          const coords = new window.kakao.maps.LatLng(place.y, place.x);

          console.log("장소 찾음:", place.place_name, "좌표:", coords);

          // 기존 마커 제거
          if (markerRef.current) {
            markerRef.current.setMap(null);
            console.log("기존 마커 제거됨");
          }

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
      console.error("오류 메시지:", error.message);
      console.error("오류 스택:", error.stack);
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
      setTitle("");
      setDesc("");
      setImage(null);
      setLat(null);
      setLng(null);
      if (markerRef.current) markerRef.current.setMap(null);
      fetchMemories();
    } catch (err) {
      console.error("추억 등록 실패:", err);
      alert("추억 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 추억 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("이 추억을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/memories/${id}`);
      setMemories(memories.filter((m) => m._id !== id));
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="dashboard-container">
      {/* 상단 헤더 */}
      <div className="dashboard-header">
        <h1 className="page-title">📸 나의 추억 아카이브</h1>
        <div className="header-buttons">
          <button className="map-btn" onClick={handleMapView}>
            지도 보기
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            로그아웃
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
            height: "300px",
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
          {loading ? "업로드 중..." : "추억 추가"}
        </button>
      </form>

      {/* 추억 목록 */}
      <div className="memory-list">
        {memories.length === 0 ? (
          <p className="empty-text">등록된 추억이 없습니다 🕊️</p>
        ) : (
          memories.map((m) => (
            <div key={m._id} className="memory-card">
              {m.imageUrl && (
                <img
                  src={m.imageUrl}
                  alt={m.title}
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    marginBottom: "10px",
                  }}
                />
              )}
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
              <span className="date">
                {new Date(m.date).toLocaleDateString()}
              </span>
              <button
                className="delete-btn"
                onClick={() => handleDelete(m._id)}
              >
                삭제
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
