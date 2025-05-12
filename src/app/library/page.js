"use client";

import { useState, useEffect } from "react";
import { Input } from "@progress/kendo-react-inputs";
import { searchMedia } from "../../../lib/firestore";
import Header from "../header";

const LibraryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

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

  return (
    <div>
      <Header/>
      <h2>Search Your Library</h2>
      <Input
        placeholder="Search by title..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.value)}
        style={{ width: "100%", marginBottom: "1rem" }}
      />

      {results.length === 0 && searchTerm.trim().length > 1 ? (
        <p>No results found.</p>
      ) : (
        <ul>
          {results.map((media) => (
            <li key={media.id}>
              <strong>{media.title}</strong> by {media.author}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LibraryPage;
