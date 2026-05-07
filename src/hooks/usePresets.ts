import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Preset } from '../types/Preset';

export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDocs(collection(db, 'presets'))
      .then((snap) => {
        const items: Preset[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Preset, 'id'>),
        }));
        setPresets(items);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { presets, loading, error };
}
