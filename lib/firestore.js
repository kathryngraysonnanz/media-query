import { collection, query, where, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export const saveMediaToFirestore = async (mediaInfo) => {
  try {
    const docRef = await addDoc(collection(db, "media"), {
      ...mediaInfo
    });
    console.log("Media saved with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving media to Firestore:", error);
  }
};

export const checkMediaExists = async (isbn) => {
  const mediaRef = collection(db, "media");
  const q = query(mediaRef, where("isbn", "==", isbn));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

export const searchMedia = async (searchTerm) => {
  if (!searchTerm.trim()) return [];

  const mediaRef = collection(db, "media");
  const q = query(mediaRef); 
  const snapshot = await getDocs(q);

  const lowerTerm = searchTerm.toLowerCase();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((item) =>
      item.title?.toLowerCase().includes(lowerTerm) ||
      item.author?.toLowerCase().includes(lowerTerm)
    );
};

export const updateMediaLoanInfo = async (id, name, date) => {
  try {
    const mediaRef = doc(db, "media", id);
    await updateDoc(mediaRef, {
      loaned: {
        name: name,
        date: date.toISOString(), // or use Firestore Timestamp
      },
    });
  } catch (error) {
    console.error("Error updating loan info:", error);
  }
};
