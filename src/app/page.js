'use client'

import { TextBox } from "@progress/kendo-react-inputs";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import styles from "./page.module.css";

import { useState } from "react";
import BarcodeScanner from "./scanner";


export default function Home() {

    const [code, setCode] = useState(null);

  return (
    <div>
      <main> 
        <h1>The Grayson-Nanz Media Library</h1>
        <div style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Scan a Barcode</h1>
      {!code ? (
        <BarcodeScanner onScan={(scanned) => setCode(scanned)} />
      ) : (
        <div>
          <p style={{ color: "green", fontWeight: "bold" }}>Scanned Code:</p>
          <p style={{ fontSize: "1.2rem" }}>{code.isbn}</p>
          <p>Title:</p>
          <p>{code.title}</p>
          {console.log('info', code)}
        </div>
      )}
    </div>
        </main>
    </div>
  );
}
