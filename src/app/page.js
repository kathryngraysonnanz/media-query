'use client'

import styles from "./page.module.scss";

import { use, useState } from "react";

import { saveMediaToFirestore } from "../../lib/firestore";
import {BarcodeScanner, getBookInfo} from "./scanner";
import Header from "./header";

import { Button } from "@progress/kendo-react-buttons";
import { Card } from "@progress/kendo-react-layout";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Input, NumericTextBox, MaskedTextBox } from "@progress/kendo-react-inputs";


export default function Home() {

    const [mediaInfo, setMediaInfo] = useState(null);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [isbnSearchOpen, setIsbnSearchOpen] = useState(false);
    const [manualIsbn, setManualISBN] = useState(); 

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

    const manualISBNSearch = async () => {
      const result = await getBookInfo(manualIsbn);
      setMediaInfo(result); 
    };


  return (
    <div>
      <Header></Header>
      <main> 
        <h1>Media Library</h1>
        <div style={{ padding: "1rem" }}>
      
      {!scannerOpen && 
      <>
        <Button onClick={(e) => setScannerOpen(!scannerOpen)}>Scan Barcode</Button>
        <Button onClick={(e) => setIsbnSearchOpen(!isbnSearchOpen)}>Search by ISBN</Button>
        <Button>Manual Add</Button>
      </>
      }

      {!mediaInfo && isbnSearchOpen && 
        <Dialog title={'ISBN Search'}>
           <MaskedTextBox mask="0-000000-00-0" onChange={(e) => setManualISBN(e.value.replace(/-/g, ""))}/>
          <DialogActionsBar>
            <Button onClick={(e) => manualISBNSearch(manualIsbn.value)}>Search</Button>
            <Button>Cancel</Button>
          </DialogActionsBar>
        </Dialog>
      }

      {console.log(manualIsbn)}

      {!mediaInfo && scannerOpen && 
        <>
          <BarcodeScanner onScan={(scanned) => setMediaInfo(scanned)} />
          <Button onClick={(e) => cancelScan()}>Cancel</Button>
        </>
      }

      {mediaInfo && 
        <>
          {mediaInfo.error && 
            <>
              <p>Error: {mediaInfo.error}</p>
              <Button onClick={(e) => resetScanner()}>Rescan</Button>
              <Button onClick={(e) => cancelScan()}>Cancel</Button>
            </>
          }
          {!mediaInfo.error && 
            <Dialog title={'Scan Results'}>
              {console.log(mediaInfo)}
              {mediaInfo.duplicate && 
                <Card type="warning"> This title is already in your library.</Card>
              }
              <img src={mediaInfo.cover} className={styles.cover}/>
              <p><b>ISBN:</b> {mediaInfo.isbn}</p>
              <p style={{textTransform: 'capitalize'}}><b>Title:</b> <i>{mediaInfo.title}</i></p>
              <p><b>Author(s):</b> {mediaInfo.authors}</p>
              <p><b>Publish Date:</b> {mediaInfo.publish_date}</p>
              <DialogActionsBar>
                  <Button onClick={(e) => resetScanner()}>Rescan</Button>
                  <Button>Edit Information</Button>
                  <Button disabled={mediaInfo.duplicate} onClick={(e) => formatMedia(mediaInfo)}>Add to Library</Button>
                  <Button onClick={(e) => cancelScan()}>Cancel</Button>
              </DialogActionsBar>
            </Dialog>
          }
        </>
      }
     
    </div>
        </main>
    </div>
  );
}
