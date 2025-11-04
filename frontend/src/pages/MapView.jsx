import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import "../styles.css";

const MapView = () => {
  const [memories, setMemories] = useState([]);

  // ✅ 추억 데이터 불러오기
  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const res = await api.get("/memories");
        setMemories(res.data);
      } catch (err) {
        console.error("지도용 추억 불러오기 실패:", err);
      }
    };
    fetchMemories();
  }, []);

  // ✅ 카카오맵 초기화
  useEffect(() => {
    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => initMap());
      }
    };

    const existingScript = document.querySelector(
      "script[src*='dapi.kakao.com']"
    );
    if (!existingScript) {
      const script = document.createElement("script");
      script.src =
        "//dapi.kakao.com/v2/maps/sdk.js?appkey=a9f14bb72d3f4b51ca67f444ebd92694&autoload=false";
      script.async = true;
      script.onload = loadKakaoMap;
      document.head.appendChild(script);
    } else {
      loadKakaoMap();
    }

    function initMap() {
      if (!memories.length) return;

      const container = document.getElementById("map");
      const mapOption = {
        center: new window.kakao.maps.LatLng(36.5, 127.8), // 대한민국 중심
        level: 13,
      };
      const map = new window.kakao.maps.Map(container, mapOption);

      // ✅ 마커 추가
      memories.forEach((m) => {
        if (!m.lat || !m.lng) return;
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(m.lat, m.lng),
          map: map,
        });

        const iwContent = `
          <div style="padding:10px;font-size:13px;">
            <b>${m.title}</b><br/>${m.desc || ""}
          </div>
        `;
        const infowindow = new window.kakao.maps.InfoWindow({ content: iwContent });
        window.kakao.maps.event.addListener(marker, "click", () => {
          infowindow.open(map, marker);
        });
      });
    }
  }, [memories]);

  return (
    <div className="map-container">
      <h2 className="page-title">🗺️ 추억 지도 보기</h2>
      <div
        id="map"
        style={{
          width: "100%",
          height: "80vh",
          borderRadius: "12px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
          backgroundColor: "#f9f9f9",
        }}
      ></div>
    </div>
  );
};

export default MapView;
