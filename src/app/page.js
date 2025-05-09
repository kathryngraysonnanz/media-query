'use client'

import { TextBox } from "@progress/kendo-react-inputs";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import styles from "./page.module.css";

import { useState } from "react";
import BarcodeScanner from "./scanner";
import { Button } from "@progress/kendo-react-buttons";


export default function Home() {

    const [mediaInfo, setMediaInfo] = useState(null);
    const [scannerOpen, setScannerOpen] = useState(false);

    function resetScanner() {
      setMediaInfo(null);
      setScannerOpen(true);
    }

    function cancelScan() {
      setMediaInfo(null);
      setScannerOpen(false);
    }

  return (
    <div>
      <main> 
        <h1>The Grayson-Nanz Media Library</h1>
        <div style={{ padding: "1rem" }}>
      
      {!scannerOpen && 
      <>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Scan a Barcode</h2>
        <Button onClick={(e) => setScannerOpen(!scannerOpen)}>Open the Scanner</Button>
      </>
       
      }
      {!mediaInfo && scannerOpen && 
        <BarcodeScanner onScan={(scanned) => setMediaInfo(scanned)} />
      }
      {mediaInfo && 
        <div>
          {mediaInfo.error && 
            <>
              <p>Error: {mediaInfo.error}</p>
              <Button onClick={(e) => resetScanner()}>Rescan</Button>
            </>
          }
          {!mediaInfo.error && 
          <div className={styles.results}>
            <h2>Scan Results</h2>
            <br/>
            <img src={mediaInfo.cover} className={styles.cover}/>
            <p><b>ISBN:</b> {mediaInfo.isbn}</p>
            <p><b>Title:</b> <i>{mediaInfo.title}</i></p>
            <p><b>Author(s):</b> {mediaInfo.authors}</p>
            <p><b>Publish Date:</b> {mediaInfo.publish_date}</p>

            <Button onClick={(e) => resetScanner()}>Rescan</Button>
            <Button>Edit Information</Button>
            <Button>Add to Library</Button>
            <Button onClick={(e) => cancelScan()}>Cancel</Button>
          
            </div>
          }
          {console.log('info', mediaInfo)}
        </div>
      }
     
    </div>
        </main>
    </div>
  );
}
