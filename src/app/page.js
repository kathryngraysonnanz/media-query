'use client'

import styles from "./page.module.scss";

import { useState } from "react";

import { saveMediaToFirestore } from "../../lib/firestore";
import {BarcodeScanner, getBookInfo} from "./scanner";
import Header from "./header/header";

import { Button } from "@progress/kendo-react-buttons";
import { Card } from "@progress/kendo-react-layout";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Input } from "@progress/kendo-react-inputs";
import { FieldWrapper } from "@progress/kendo-react-form";
import { Fade } from "@progress/kendo-react-animation";
import { Notification, NotificationGroup } from "@progress/kendo-react-notification";


export default function Home() {

    const [mediaInfo, setMediaInfo] = useState(null);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [isbnSearchOpen, setIsbnSearchOpen] = useState(false);
    const [manualIsbn, setManualISBN] = useState(); 
    const [error, setError] = useState("");
    const [manualAddOpen, setManualAddOpen] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false); 
    const [formData, setFormData] = useState({
      added: new Date(),
      author: "",
      isbn: "",
      loaned: false,
      published: "", 
      title: "",
      type: "book", 
      cover: "",
      tags: []
    });

    function resetScanner() {
      setMediaInfo(null);
      setScannerOpen(true);
    }

    function cancelScan() {
      setMediaInfo(null);
      setScannerOpen(false);
      setIsbnSearchOpen(false);
      setManualISBN(null);
      setManualAddOpen(false);
      setError("")
      setSavedSuccess(false);
      setFormData({
        added: new Date(),
        author: "",
        isbn: "",
        loaned: false,
        published: "", 
        title: "",
        type: "book", 
        cover: "",
        tags: [] 
      })
    }

    function extractYear(dateString) {
      if (!dateString) return "";
      const match = dateString.match(/\b\d{4}\b/); // Matches a 4-digit year
      return match ? match[0] : "";
    }

    function formatMedia(mediaInfo){
      let savedMedia = {
        "type": "book", 
        "cover": mediaInfo.cover,
        "title": mediaInfo.title,
        "author": mediaInfo.authors, 
        "isbn": mediaInfo.isbn,
        "published": extractYear(mediaInfo.publish_date), 
        "added": new Date(),
        "loaned": false,
        "tags": mediaInfo.tags
      }
      
      saveMediaToFirestore(savedMedia);
      setSavedSuccess(true); 
      cancelScan(); 
      setTimeout(() => setSavedSuccess(false), 3000);
    }

    const manualISBNSearch = async () => {
      const result = await getBookInfo(manualIsbn);
      setMediaInfo(result); 
    };

    const handleChange = (field) => (e) => {
      setFormData({ ...formData, [field]: e.target.value });
    };

    const handleSave = async () => {
      try {
        await saveMediaToFirestore({ ...formData, duplicate: false });
        cancelScan();
      } catch (err) {
        console.error("Error saving manual entry:", err);
      }
    };

    const handleInputChange = (e) => {
      const raw = e.target.value.replace(/\D/g, "");

      const cleaned = raw.slice(0, 13);
      setManualISBN(cleaned);

      if (cleaned.length > 0 && cleaned.length !== 10 && cleaned.length !== 13) {
        setError(true);
      } else {
        setError(false);
      }
    };


  return (
    <div>
      <Header/>

      <main> 
        <h2>Add media to library: </h2>
         

          {!scannerOpen && 
          <div className={styles.buttonGroup}>
            <Button onClick={(e) => setScannerOpen(!scannerOpen)}>Scan Barcode</Button>
            <Button onClick={(e) => setIsbnSearchOpen(!isbnSearchOpen)}>Search by ISBN</Button>
            <Button onClick={(e) => setManualAddOpen(!manualAddOpen)}>Manually Add</Button>
          </div>
          }

          {!mediaInfo && isbnSearchOpen && 
            <Dialog title={'ISBN Search'} onClose={(e) => cancelScan()}>
              <FieldWrapper>
                <label className="k-label">ISBN:</label>
                <Input
                  required
                  onChange={handleInputChange}
                  value={manualIsbn}
                />
                {error && <p>ISBN must be 10 or 13 digits long</p>}
              </FieldWrapper>
              {console.log(manualIsbn)}
              <DialogActionsBar>
                <Button disabled={error} onClick={(e) => manualISBNSearch(manualIsbn)}>Search</Button>
                <Button onClick={(e) => cancelScan()}>Cancel</Button>
              </DialogActionsBar>
            </Dialog>
          }

          {!mediaInfo && manualAddOpen && 
            <Dialog title={'Manually Add Media Information'} onClose={(e) => cancelScan()}>
              <Card type="warning">Note that manually added media is not checked for duplication in the database. <br/> <b>'Scan Barcode' or 'Search by ISBN' input methods are recommended whenever possible.</b></Card>
                <Input label="Title" value={formData.title} onChange={handleChange("title")} />
                <Input label="Author(s)" value={formData.author} onChange={handleChange("author")} />
                <Input label="Publish Year (optional)" value={formData.published} onChange={handleChange("published")} />
                <Input label="ISBN (optional)" value={formData.isbn} onChange={handleChange("isbn")} />
              <DialogActionsBar>
                <Button themeColor={'primary'} onClick={handleSave}>Add to Library</Button>
                <Button onClick={(e) => cancelScan()}>Cancel</Button>
              </DialogActionsBar>
            </Dialog>
          }

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
                <Dialog title={'Search Results'} className={styles.dialog}>
                  {mediaInfo.duplicate && 
                    <Card type="warning"> This title is already in your library.</Card>
                  }
                  <img src={mediaInfo.cover} className={styles.cover}/>
                  <p><b>ISBN:</b> {mediaInfo.isbn}</p>
                  <p style={{textTransform: 'capitalize'}}><b>Title:</b> <i>{mediaInfo.title}</i></p>
                  <p><b>Author(s):</b> {mediaInfo.authors}</p>
                  <p><b>Published:</b> {mediaInfo.publish_date}</p>
                  <DialogActionsBar>
                      <Button themeColor={'primary'} disabled={mediaInfo.duplicate} onClick={(e) => formatMedia(mediaInfo)}>Add to Library</Button>
                      <Button onClick={(e) => cancelScan()}>Close</Button>
                  </DialogActionsBar>
                </Dialog>
              }
            </>
          }
        
      </main>
      <Fade>
          {savedSuccess && 
           <NotificationGroup className={styles.position}>
              <Notification 
                className={styles.notification}
                type={{
                    style: 'success',
                    icon: true
                  }} 
                closable={true} 
                onClose={() => setSavedSuccess(false)}>
                <p>Your data has been saved.</p>
              </Notification>
            </NotificationGroup>
            }
        </Fade>
    </div>
  );
}
