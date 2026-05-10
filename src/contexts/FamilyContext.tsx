import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AppUser } from '../types/User';

interface FamilyState {
  /** All family members as AppUser objects */
  members: AppUser[];
  /** Quick uid → displayName lookup */
  familyMap: Record<string, string>;
  loading: boolean;
}

const FamilyContext = createContext<FamilyState>({
  members: [],
  familyMap: {},
  loading: true,
});

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<AppUser[]>([]);
  const [familyMap, setFamilyMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const users: AppUser[] = snap.docs.map((d) => ({
          uid: d.id,
          ...(d.data() as Omit<AppUser, 'uid'>),
        }));
        const map: Record<string, string> = {};
        users.forEach((u) => { map[u.uid] = u.displayName ?? u.uid; });

        setMembers(users);
        setFamilyMap(map);
        setLoading(false);
      },
      (err) => {
        console.error('Family snapshot error:', err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return (
    <FamilyContext.Provider value={{ members, familyMap, loading }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  return useContext(FamilyContext);
}
