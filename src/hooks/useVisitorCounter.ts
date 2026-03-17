import { useState, useEffect } from 'react';
import { doc, getDoc, increment, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION = 'CARE';
const DOCUMENT_ID = 'mpxBHFW0BJfUsnGEUaUd';
const UNIQUE_KEY = 'care_visited';
const EXPIRY_KEY = 'care_expiry';
const TWO_HOURS = 60000 * 120;

export const useVisitorCounter = () => {
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [uniqueCount, setUniqueCount] = useState<number | null>(null);

  useEffect(() => {
    const updateCounts = async () => {
      try {
        const ref = doc(db, COLLECTION, DOCUMENT_ID);
        const updates: { totalCount?: any; uniqueCount?: any } = {};

        // Total count: increment only if no expiry set OR 2-hour window has passed
        const expiry = localStorage.getItem(EXPIRY_KEY);
        if (expiry == null || new Date().getTime() > Number(expiry)) {
          updates.totalCount = increment(1);
          localStorage.setItem(EXPIRY_KEY, (Date.now() + TWO_HOURS).toString());
        }

        // Unique count: increment only if never visited before
        if (localStorage.getItem(UNIQUE_KEY) == null) {
          updates.uniqueCount = increment(1);
          localStorage.setItem(UNIQUE_KEY, 'true');
        }

        if (Object.keys(updates).length > 0) {
          await updateDoc(ref, updates);
        }

        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setTotalCount(data.totalCount);
          setUniqueCount(data.uniqueCount);
        }
      } catch (err) {
        console.error('Visitor counter error:', err);
      }
    };

    updateCounts();
  }, []);

  return { totalCount, uniqueCount };
};
