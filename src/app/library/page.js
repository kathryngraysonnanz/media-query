"use client";

import { useState, useEffect } from "react";
import { Input } from "@progress/kendo-react-inputs";
import { searchMedia, updateMediaLoanInfo } from "../../../lib/firestore";
import Header from "../header/header";
import { DatePicker } from "@progress/kendo-react-dateinputs";

import styles from './library.module.scss'

import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Button } from "@progress/kendo-react-buttons";
import { Card } from "@progress/kendo-react-layout";

const LibraryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(); 
  const [dialogOpen, setDialogOpen] = useState(false); 
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [daysOut, setDaysOut] = useState()

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
    //TO-DO: success notification 
  };

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
      <h2>Search Your Library</h2>
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
          {selected.loaned && 
            <Card type="warning">
              <p>Loaned to {selected.loaned.name} {daysOut} days ago.</p>
            </Card>
          }
          {console.log(selected)}
          <DialogActionsBar>
              {!selected.loaned && 
                <Button onClick={(e) => setLoanDialogOpen(true)}>Set as Loaned</Button>
              }
              {selected.loaned && 
              //TO-DO: create return function 
                <Button>Set as Returned</Button>
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

      </main>
    </>
  );
};

export default LibraryPage;
