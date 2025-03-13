// src/components/Map.tsx
"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ref, onValue, set } from "firebase/database";
import { database } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

type User = {
  id: string;
  name: string;
  groupId: string;
  latitude: number;
  longitude: number;
  lastUpdated: number;
};

// Componente para atualizar a visualização do mapa
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    if (center[0] !== 0 && center[1] !== 0) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
};

// Função para criar um ícone de avatar com a primeira letra do nome
const createAvatarIcon = (name: string) => {
  // Obter a primeira letra e converter para maiúscula
  const initial = name.charAt(0).toUpperCase();

  // Gerar uma cor baseada no nome para diferenciar usuários
  const colors = ['#4CAF50', '#2196F3', '#9C27B0', '#F44336', '#FF9800', '#795548'];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const backgroundColor = colors[colorIndex];

  // Criar um elemento div para o avatar
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

const Map = () => {
  const { user } = useAuth();
  const [groupUsers, setGroupUsers] = useState<User[]>([]);
  const [userPosition, setUserPosition] = useState<[number, number]>([0, 0]);
  const [currentZoom, setCurrentZoom] = useState<number>(13);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [groupShareLink, setGroupShareLink] = useState<string>("");
  const [linkCopied, setLinkCopied] = useState<boolean>(false);

  // Gerar link para compartilhar o grupo
  useEffect(() => {
    if (user?.groupId) {
      const baseUrl = window.location.origin;
      const joinLink = `${baseUrl}/join?group=${user.groupId}`;
      setGroupShareLink(joinLink);
    }
  }, [user]);

  // Função para copiar o link
  const copyShareLink = () => {
    navigator.clipboard.writeText(groupShareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Atualiza a localização do usuário
  useEffect(() => {
    if (!user) return;

    let watchId: number;

    if (isTracking) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPosition([latitude, longitude]);

          // Enviar para o Firebase
          const userLocRef = ref(database, `locations/${user.uid}`);
          set(userLocRef, {
            id: user.uid,
            name: user.displayName || "Usuário",
            groupId: user.groupId || "default",
            latitude,
            longitude,
            lastUpdated: Date.now()
          });
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
        },
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [user, isTracking]);

  // Busca os membros do grupo
  useEffect(() => {
    if (!user?.groupId) return;

    const locationsRef = ref(database, "locations");

    const unsubscribe = onValue(locationsRef, (snapshot) => {
      const data = snapshot.val() || {};

      // Filtrar apenas os usuários do mesmo grupo
      const groupMembers = Object.values<User>(data).filter(
        (member: any) => member.groupId === user.groupId
      );

      setGroupUsers(groupMembers);
    });

    return () => unsubscribe();
  }, [user]);

  // Caso o usuário não esteja logado
  if (!user) {
    return <div className="p-4">Faça login para usar o mapa</div>;
  }

  return (
    <div className="relative h-screen w-full">
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-xs bg-amber-900">
        <Button
          variant={isTracking ? "destructive" : "default"}
          onClick={() => setIsTracking(!isTracking)}
          className="mb-2 shadow-lg"
        >
          {isTracking ? "Parar Rastreamento" : "Iniciar Rastreamento"}
        </Button>

        {user.groupId ? (
          <div className="bg-white p-3 rounded-md shadow-lg">
            <p className="text-sm font-medium mb-2">Compartilhe seu grupo:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={groupShareLink}
                readOnly
                className="text-xs bg-gray-100 p-2 rounded flex-1 overflow-hidden text-ellipsis"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={copyShareLink}
                className="flex items-center shrink-0"
              >
                <Share2 size={16} className="mr-1" />
                {linkCopied ? "Copiado!" : "Copiar"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-3 rounded-md shadow-lg">
            <p className="text-sm text-amber-600 font-medium">
              Você ainda não está em um grupo.
              <br />Crie ou entre em um grupo para compartilhar sua localização.
            </p>
          </div>
        )}
      </div>

      <MapContainer
        center={userPosition[0] !== 0 ? userPosition : [-23.55052, -46.633308]} // São Paulo como padrão
        zoom={currentZoom}
        style={{ height: "100%", width: "100%" }}
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
    </div>
  );
};

export default Map;