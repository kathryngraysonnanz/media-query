"use client";

import { useState, useEffect } from "react";
import { Input } from "@progress/kendo-react-inputs";
import { searchMedia, updateMediaLoanInfo, returnMediaLoan } from "../../../lib/firestore";
import Header from "../header/header";

import styles from './library.module.scss'

import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Button } from "@progress/kendo-react-buttons";
import { Card } from "@progress/kendo-react-layout";
import { Notification, NotificationGroup } from "@progress/kendo-react-notification";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Fade } from "@progress/kendo-react-animation";

const LibraryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(); 
  const [dialogOpen, setDialogOpen] = useState(false); 
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [daysOut, setDaysOut] = useState();
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const media = await searchMedia(searchTerm);
      setResults(media);
    };

    if (searchTerm.trim().length > 1) {
      fetch();
    } else {
      setResults([]);
    }
  }, [searchTerm]);

  function showDetails(media) {
    setDialogOpen(true); 
    setSelected(media); 
    if (media.loaned.date) {
      daysSince(media.loaned.date) 
    }
  }

  function clearSelection() {
    setDialogOpen(false);
    setSelected(null); 
    setLoanDialogOpen(false); 
    setName(null);
    setDate(null); 
    setDaysOut(null)
  }

   const handleLoanSave = async () => {
    await updateMediaLoanInfo(selected.id, name, date);
    setLoanDialogOpen(false);
    clearSelection()
    setSearchTerm("");
    setResults([]); 
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const returnLoan = async () => {
    await returnMediaLoan(selected.id); 
    setLoanDialogOpen(false);
    clearSelection()
    setSearchTerm("");
    setResults([]); 
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  function daysSince(loanDate) {
    const today = new Date();
    const loaned = new Date(loanDate)
  
    const start = new Date(loaned.getFullYear(), loaned.getMonth(), loaned.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const diffTime = end - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
    
    setDaysOut(diffDays);
  }

  return (
    <>
      <Header/>
     
      <main>
      <h2>Search By Title / Author / Tag</h2>
      <Input
        placeholder="Search by title..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.value)}
        className={styles.search}
      />

      {results.length === 0 && searchTerm.trim().length > 1 ? (
        <p>No results found.</p>
      ) : (
        <ul className={styles.results}>
          {results.map((media) => (
            <li key={media.id} onClick={(e) => showDetails(media)}>
              <strong>{media.title}</strong> by {media.author} 
            </li>
          ))}
        </ul>
      )}

      {dialogOpen && selected && 
        <Dialog title={selected.title} onClose={(e) => clearSelection()}>
          <img src={selected.cover} className={styles.cover}/>
          <p><b>ISBN:</b> {selected.isbn}</p>
          <p style={{textTransform: 'capitalize'}}><b>Title:</b> <i>{selected.title}</i></p>
          <p><b>Author(s):</b> {selected.author}</p>
          <p><b>Publish Date:</b> {selected.published}</p>
          <p><b>Tags:</b></p>
          <div className={styles.tagContainer}>
            {selected.tags && selected.tags.map(tag => {
                return (
                    <Card className={styles.tag}>{tag}</Card>
                )
              })}
            </div>
          {selected.loaned && 
            <Card type="warning">
              <p>Loaned to {selected.loaned.name} {daysOut} days ago.</p>
            </Card>
          }
          {console.log(selected)}
          <DialogActionsBar>
              {!selected.loaned && 
                <Button onClick={(e) => setLoanDialogOpen(true)}>Loan Media</Button>
              }
              {selected.loaned && 
                <Button onClick={(e) => returnLoan()}>Return Loan</Button>
              }
              <Button onClick={(e) => clearSelection()}>Close</Button>
          </DialogActionsBar>
        </Dialog>
      }

      {loanDialogOpen && 
        <Dialog title="Loan Book" onClose={(e) => clearSelection()}>
          <div style={{ marginBottom: "1rem" }}>
            <label>Borrower's Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex"
            />
          </div>
          <div>
            <label>Loan Date</label>
            <DatePicker value={date} onChange={(e) => setDate(e.value)} />
          </div>
          <DialogActionsBar>
            <Button themeColor="primary" onClick={(e) => handleLoanSave()}>Save</Button>
            <Button onClick={(e) => clearSelection()}>Cancel</Button>
          </DialogActionsBar>
        </Dialog>
      }

       <Fade enter={true} exit={true}>
          {success && 
            <NotificationGroup className={styles.position}>
              <Notification 
                className={styles.notification}
                type={{
                    style: 'success',
                    icon: true
                  }} 
                closable={true} 
                onClose={() => setSuccess(false)}>
                <p>Your loan data has been updated.</p>
              </Notification>
            </NotificationGroup>
            }
        </Fade>

      </main>
    </>
  );
};

export default LibraryPage;
