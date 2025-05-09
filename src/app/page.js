import { TextBox } from "@progress/kendo-react-inputs";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import styles from "./page.module.css";

const firebaseConfig = {
  apiKey: "AIzaSyCUm4lKOrEMD2NCf_OTNluVxfl_X_4XPF8",
  authDomain: "media-query-gn.firebaseapp.com",
  projectId: "media-query-gn",
  storageBucket: "media-query-gn.firebasestorage.app",
  messagingSenderId: "329944024899",
  appId: "1:329944024899:web:b8a9dc072c216b858191f6",
  measurementId: "G-M964RJ1DLQ"
};

export default function Home() {

  const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

  return (
    <div>
      <main> 
        <h1>The Grayson-Nanz Media Library</h1>
        <p>Search</p>
        <TextBox></TextBox>

        <br/><br/>
        <p>Browse Books</p>
        <p>Browse Video Games</p>
        <p>Browse Records</p>
        <p>Browse DVDs / BluRay</p>
        </main>
    </div>
  );
}
