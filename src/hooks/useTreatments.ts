import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Treatment } from '../types/Treatment';

export function useTreatments() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'treatments'), orderBy('dateTime', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Treatment[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            presetId: data.presetId ?? '',
            title: data.title ?? '',
            location: data.location ?? '',
            dateTime:
              data.dateTime instanceof Timestamp ? data.dateTime.toDate() : new Date(data.dateTime),
            escortId: data.escortId ?? null,
            status: data.status ?? 'scheduled',
            summary: data.summary ?? null,
            calendarEventId: data.calendarEventId ?? null,
            createdAt:
              data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
            createdBy: data.createdBy,
          };
        });
        setTreatments(items);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const upcoming = treatments.filter((t) => t.dateTime > new Date() && t.status !== 'cancelled');
  const nextTreatment = upcoming[0] ?? null;

  return { treatments, upcoming, nextTreatment, loading, error };
}
