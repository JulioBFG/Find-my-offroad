// src/components/Map/index.tsx
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Share2, MapPin, MapPinOff } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

// Importação dinâmica do componente do mapa sem SSR
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
        <p className="mt-2 text-sm text-gray-600">Carregando mapa...</p>
      </div>
    </div>
  ),
});

export type User = {
  id: string;
  name: string;
  groupId: string;
  latitude: number;
  longitude: number;
  lastUpdated: number;
};

const Map = () => {
  const { user } = useAuth();
  const [groupUsers, setGroupUsers] = useState<User[]>([]);
  const [userPosition, setUserPosition] = useState<[number, number]>([0, 0]);
  const [groupShareLink, setGroupShareLink] = useState<string>("");
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [isTracking, setIsTracking] = useState<boolean>(false);

  useEffect(() => {
    if (user?.groupId) {
      const baseUrl = window.location.origin;
      const joinLink = `${baseUrl}/join?group=${user.groupId}`;
      setGroupShareLink(joinLink);
    }
  }, [user]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(groupShareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  useEffect(() => {
    if (!user?.groupId) return;

    const locationsRef = ref(database, "locations");

    const unsubscribe = onValue(locationsRef, (snapshot) => {
      const data = snapshot.val() || {};

      const groupMembers = Object.values<User>(data).filter(
        (member: User) => member.groupId === user.groupId
      );

      setGroupUsers(groupMembers);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return <div className="p-4">Faça login para usar o mapa</div>;
  }

  return (
    <div className="relative h-screen w-full">
      <div className="fixed bottom-4 right-4 left-4 z-50 md:right-6 md:left-auto md:max-w-xs md:top-6 md:bottom-auto">
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-gray-200">
          <Button
            variant={isTracking ? "destructive" : "default"}
            onClick={() => setIsTracking(!isTracking)}
            className="w-full mb-4 flex items-center justify-center"
            size="lg"
          >
            {isTracking ? (
              <>
                <MapPinOff size={18} className="mr-2" />
                Parar Rastreamento
              </>
            ) : (
              <>
                <MapPin size={18} className="mr-2" />
                Iniciar Rastreamento
              </>
            )}
          </Button>

          <div className="border-t border-gray-200 my-3"></div>

          {user.groupId ? (
            <div>
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
                  <Share2 size={16} className="mr-1 md:block hidden" />
                  {linkCopied ? "Copiado!" : "Copiar"}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-amber-600 font-medium">
                Você ainda não está em um grupo.
                Crie ou entre em um grupo para compartilhar sua localização.
              </p>
            </div>
          )}
        </div>
      </div>

      <LeafletMap
        userPosition={userPosition}
        setUserPosition={setUserPosition}
        groupUsers={groupUsers}
        isTracking={isTracking}
        user={user}
      />
    </div>
  );
};

export default Map;