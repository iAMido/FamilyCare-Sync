import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Preset } from '../types/Preset';

export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'presets'),
      (snap) => {
        const items: Preset[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Preset, 'id'>),
        }));
        // Sort alphabetically by name
        items.sort((a, b) => a.name.localeCompare(b.name));
        setPresets(items);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return { presets, loading, error };
}
