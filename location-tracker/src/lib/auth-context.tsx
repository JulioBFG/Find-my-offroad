"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, database } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from "firebase/auth";
import { ref, get, set } from "firebase/database";

type User = FirebaseUser & {
  groupId?: string;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logOut: () => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  createGroup: (groupName: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Buscar informações adicionais do usuário (como groupId)
        const userRef = ref(database, `users/${firebaseUser.uid}`);
        const snapshot = await get(userRef);
        const userData = snapshot.val() || {};

        // Mesclar os dados do Firebase Auth com os dados extras
        const enhancedUser = {
          ...firebaseUser,
          groupId: userData.groupId || null
        };

        setUser(enhancedUser as User);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });

    // Criar entrada inicial do usuário no banco
    const userRef = ref(database, `users/${result.user.uid}`);
    await set(userRef, {
      name,
      email,
      createdAt: Date.now()
    });
  };

  const logOut = async () => {
    await signOut(auth);
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;

    // Verificar se o grupo existe
    const groupRef = ref(database, `groups/${groupId}`);
    const snapshot = await get(groupRef);

    if (!snapshot.exists()) {
      throw new Error("Grupo não encontrado");
    }

    // Atualizar o usuário no banco com o groupId
    const userRef = ref(database, `users/${user.uid}`);
    await set(userRef, {
      name: user.displayName,
      email: user.email,
      groupId
    });

    // Atualizar o estado local do usuário
    setUser({
      ...user,
      groupId
    });
  };

  const createGroup = async (groupName: string) => {
    if (!user) throw new Error("Usuário não autenticado");

    // Criar um ID para o grupo (timestamp + random para simplicidade)
    const groupId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Criar o grupo
    const groupRef = ref(database, `groups/${groupId}`);
    await set(groupRef, {
      name: groupName,
      createdBy: user.uid,
      createdAt: Date.now(),
      members: {
        [user.uid]: true
      }
    });

    // Atualizar o usuário no banco com o groupId
    const userRef = ref(database, `users/${user.uid}`);
    await set(userRef, {
      name: user.displayName,
      email: user.email,
      groupId
    });

    // Atualizar o estado local do usuário
    setUser({
      ...user,
      groupId
    });

    return groupId;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      logOut,
      joinGroup,
      createGroup
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
};