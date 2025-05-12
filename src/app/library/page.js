'use client'

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default function Library() {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "media"));
        const mediaData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMediaItems(mediaData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching media:", error);
        setLoading(false);
      }
    };

    fetchMedia(); // auto-load on mount
  }, []);

  if (loading) return <p>Loading media...</p>;

  return (
    <div>
      <h2>Scanned Media</h2>
      {mediaItems.length === 0 ? (
        <p>No media found.</p>
      ) : (
        <ul>
          {mediaItems.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              {item.authors && ` by ${item.authors}`}
              {item.type && ` (${item.type})`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
