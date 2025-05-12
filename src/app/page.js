'use client'

import styles from "./page.module.scss";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { saveMediaToFirestore } from "../../lib/firestore";

import { useState } from "react";

import BarcodeScanner from "./scanner";
import Header from "./header";

import { Button } from "@progress/kendo-react-buttons";
import { Card } from "@progress/kendo-react-layout";


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

    function formatMedia(mediaInfo){
      let savedMedia = {
        "type": "book", 
        "title": mediaInfo.title,
        "author": mediaInfo.authors, 
        "isbn": mediaInfo.isbn,
        "published": mediaInfo.publish_date, 
        "added": new Date(),
        "loaned": false
      }

      saveMediaToFirestore(savedMedia);
    }


  return (
    <div>
      <Header></Header>
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
            {mediaInfo.duplicate && 
              <Card type="warning"> Note: this title is already in your library.</Card>
            }
            <img src={mediaInfo.cover} className={styles.cover}/>
            <p><b>ISBN:</b> {mediaInfo.isbn}</p>
            <p><b>Title:</b> <i>{mediaInfo.title}</i></p>
            <p><b>Author(s):</b> {mediaInfo.authors}</p>
            <p><b>Publish Date:</b> {mediaInfo.publish_date}</p>

            <Button onClick={(e) => resetScanner()}>Rescan</Button>
            <Button>Edit Information</Button>
            <Button disabled={mediaInfo.duplicate} onClick={(e) => formatMedia(mediaInfo)}>Add to Library</Button>
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
