// src/components/Map/LeafletMap.tsx
"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ref, set } from "firebase/database";
import { database } from "@/lib/firebase";
import { User } from "./Map";
import { FirebaseUser } from "@/lib/types";

type MapUpdaterProps = {
  center: [number, number];
};

type LeafletMapProps = {
  userPosition: [number, number];
  setUserPosition: React.Dispatch<React.SetStateAction<[number, number]>>;
  groupUsers: User[];
  isTracking: boolean;
  user: FirebaseUser;
};

const MapUpdater = ({ center }: MapUpdaterProps) => {
  const map = useMap();

  useEffect(() => {
    if (center[0] !== 0 && center[1] !== 0) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
};

const createAvatarIcon = (name: string) => {
  const initial = name.charAt(0).toUpperCase();

  const colors = ['#4CAF50', '#2196F3', '#9C27B0', '#F44336', '#FF9800', '#795548'];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const backgroundColor = colors[colorIndex];

  const avatarHtml = `
    <div style="
      background-color: ${backgroundColor};
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      font-weight: bold;
      font-size: 18px;
      border: 2px solid white;
      box-shadow: 0 0 5px rgba(0,0,0,0.3);
    ">
      ${initial}
    </div>
  `;

  return L.divIcon({
    html: avatarHtml,
    className: 'avatar-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const LeafletMap: React.FC<LeafletMapProps> = ({
  userPosition,
  setUserPosition,
  groupUsers,
  isTracking,
  user
}) => {
  const currentZoom = 13;

  useEffect(() => {
    if (!user || !isTracking) return;


    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const hasMoved =
          Math.abs(latitude - userPosition[0]) > 0.0001 ||
          Math.abs(longitude - userPosition[1]) > 0.0001 ||
          userPosition[0] === 0;

        if (hasMoved) {
          setUserPosition([latitude, longitude]);
          const userLocRef = ref(database, `locations/${user.uid}`);
          set(userLocRef, {
            id: user.uid,
            name: user.displayName || "Usuário",
            groupId: user.groupId || "default",
            latitude,
            longitude,
            lastUpdated: Date.now()
          });
        }
      },
      (error) => {
        console.error("Erro ao obter localização:", error);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 30000 }
    );

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [user, isTracking, setUserPosition, userPosition]);

  return (
    <MapContainer
      center={userPosition[0] !== 0 ? userPosition : [-23.55052, -46.633308]}
      zoom={currentZoom}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {groupUsers.map((member) => (
        <Marker
          key={member.id}
          position={[member.latitude, member.longitude]}
          icon={createAvatarIcon(member.name)}
        >
          <Popup>
            <div className="text-center">
              <div
                className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}` }}
              >
                {member.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-bold">{member.name}</h3>
              <p className="text-xs mt-1">
                Última atualização:<br />
                {new Date(member.lastUpdated).toLocaleString()}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {userPosition[0] !== 0 && <MapUpdater center={userPosition} />}
    </MapContainer>
  );
};

export default LeafletMap;