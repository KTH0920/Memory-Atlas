import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import "../styles.css";

const MapView = () => {
  const navigate = useNavigate();
  const [memories, setMemories] = useState([]);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  // ✅ 추억 데이터 불러오기
  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const res = await api.get("/memories");
        const memoriesWithLocation = res.data.filter((m) => m.lat && m.lng);
        setMemories(memoriesWithLocation);
      } catch (err) {
        console.error("지도용 추억 불러오기 실패:", err);
      }
    };
    fetchMemories();
  }, []);

  // ✅ 카카오맵 초기화
  useEffect(() => {
    if (memories.length === 0) return;

    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => initMap());
      }
    };

    const initMap = () => {
      const container = document.getElementById("map");
      const mapOption = {
        center: new window.kakao.maps.LatLng(36.5, 127.8),
        level: 13,
      };
      const map = new window.kakao.maps.Map(container, mapOption);
      mapRef.current = map;

      // InfoWindow 초기화
      infoWindowRef.current = new window.kakao.maps.InfoWindow({
        removable: true,
      });

      // 마커 추가
      const bounds = new window.kakao.maps.LatLngBounds();
      const markers = [];

      memories.forEach((m) => {
        const position = new window.kakao.maps.LatLng(m.lat, m.lng);
        const marker = new window.kakao.maps.Marker({
          position: position,
          map: map,
        });

        // 마커 클릭 이벤트
        window.kakao.maps.event.addListener(marker, "click", () => {
          showInfoWindow(marker, m, map);
          setSelectedMemory(m._id);
        });

        markers.push({ marker, memory: m });
        bounds.extend(position);
      });

      markersRef.current = markers;

      // 모든 마커가 보이도록 지도 범위 설정
      if (memories.length > 1) {
        map.setBounds(bounds);
      } else if (memories.length === 1) {
        map.setCenter(new window.kakao.maps.LatLng(memories[0].lat, memories[0].lng));
        map.setLevel(3);
      }
    };

    loadKakaoMap();
  }, [memories]);

  // InfoWindow 표시
  const showInfoWindow = (marker, memory, map) => {
    const content = `
      <div style="
        padding: 15px;
        min-width: 250px;
        max-width: 300px;
        font-family: 'Pretendard', sans-serif;
      ">
        ${memory.imageUrl ? `
          <img
            src="${memory.imageUrl}"
            alt="${memory.title}"
            style="
              width: 100%;
              height: 150px;
              object-fit: cover;
              border-radius: 8px;
              margin-bottom: 12px;
            "
          />
        ` : ''}
        <h3 style="
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        ">${memory.title}</h3>
        <p style="
          margin: 0 0 8px 0;
          font-size: 13px;
          color: #64748b;
          line-height: 1.5;
        ">${memory.desc || ''}</p>
        <p style="
          margin: 0;
          font-size: 12px;
          color: #94a3b8;
        ">📅 ${new Date(memory.date).toLocaleDateString()}</p>
      </div>
    `;

    infoWindowRef.current.setContent(content);
    infoWindowRef.current.open(map, marker);
  };

  // 추억 클릭 시 해당 위치로 이동
  const handleMemoryClick = (memory) => {
    if (!mapRef.current) return;

    const position = new window.kakao.maps.LatLng(memory.lat, memory.lng);
    mapRef.current.setCenter(position);
    mapRef.current.setLevel(3);

    // 해당 마커 찾아서 InfoWindow 표시
    const markerData = markersRef.current.find((m) => m.memory._id === memory._id);
    if (markerData) {
      showInfoWindow(markerData.marker, memory, mapRef.current);
      setSelectedMemory(memory._id);
    }
  };

  // 전체 보기
  const handleShowAll = () => {
    if (!mapRef.current || memories.length === 0) return;

    const bounds = new window.kakao.maps.LatLngBounds();
    memories.forEach((m) => {
      bounds.extend(new window.kakao.maps.LatLng(m.lat, m.lng));
    });

    if (memories.length > 1) {
      mapRef.current.setBounds(bounds);
    }
    setSelectedMemory(null);
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  };

  return (
    <div className="map-view-container">
      {/* 헤더 */}
      <div className="map-header">
        <div>
          <h1 className="page-title">🗺️ 추억 지도</h1>
          <p className="map-subtitle">
            총 <strong>{memories.length}개</strong>의 추억이 저장되어 있습니다
          </p>
        </div>
        <div className="map-header-buttons">
          <button className="show-all-btn" onClick={handleShowAll}>
            전체 보기
          </button>
          <button className="back-btn" onClick={() => navigate("/mypage")}>
            마이페이지
          </button>
        </div>
      </div>

      <div className="map-content">
        {/* 사이드바 - 추억 리스트 */}
        <div className="memory-sidebar">
          <h3 className="sidebar-title">📍 추억 목록</h3>
          <div className="memory-items">
            {memories.length === 0 ? (
              <p className="empty-text">위치 정보가 있는 추억이 없습니다.</p>
            ) : (
              memories.map((m) => (
                <div
                  key={m._id}
                  className={`memory-item ${selectedMemory === m._id ? "active" : ""}`}
                  onClick={() => handleMemoryClick(m)}
                >
                  {m.imageUrl && (
                    <img src={m.imageUrl} alt={m.title} className="memory-thumbnail" />
                  )}
                  <div className="memory-item-info">
                    <h4>{m.title}</h4>
                    <p>{new Date(m.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 지도 */}
        <div className="map-wrapper">
          <div
            id="map"
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
