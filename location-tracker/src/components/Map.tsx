"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Share2, MapPin, MapPinOff, Check } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import { useToast } from "./ui/use-toast";

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
  const { toast } = useToast();
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

    toast({
      title: "Link copiado!",
      description: "O link do grupo foi copiado para a área de transferência.",
      duration: 2000,
    });

    setTimeout(() => setLinkCopied(false), 2000);
  };

  const toggleTracking = () => {
    const newTrackingState = !isTracking;
    setIsTracking(newTrackingState);

    toast({
      title: newTrackingState ? "Rastreamento iniciado" : "Rastreamento desligado",
      description: newTrackingState
        ? "Sua localização está sendo compartilhada com o grupo."
        : "Sua localização não está mais sendo compartilhada.",
      duration: 3000,
    });
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
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-1/2">
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-gray-200 flex gap-3 justify-center">
          <Button
            variant={isTracking ? "destructive" : "default"}
            onClick={toggleTracking}
            className="h-12 rounded-full shadow-lg md:h-10 md:rounded-md md:px-4"
          >
            {isTracking ? (
              <>
                <MapPinOff className="md:mr-2" size={20} />
                <span className="hidden md:inline">Parar</span>
              </>
            ) : (
              <>
                <MapPin className="md:mr-2" size={20} />
                <span className="hidden md:inline">Rastrear</span>
              </>
            )}
          </Button>

          {user.groupId && (
            <Button
              variant="secondary"
              onClick={copyShareLink}
              className="h-12 rounded-full shadow-lg md:h-10 md:rounded-md md:px-4"
              title="Copiar link do grupo"
            >
              {linkCopied ? (
                <>
                  <Check className="md:mr-2" size={20} />
                  <span className="hidden md:inline">Copiado</span>
                </>
              ) : (
                <>
                  <Share2 className="md:mr-2" size={20} />
                  <span className="hidden md:inline">Compartilhar</span>
                </>
              )}
            </Button>
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