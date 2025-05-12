"use client";

import { useEffect, useRef } from "react";
import Quagga from "quagga";

import { checkMediaExists } from "../../lib/firestore";

export const getBookInfo = async (isbn) => {
  console.log('isbn:', isbn)
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data[`ISBN:${isbn}`]) {
      const book = data[`ISBN:${isbn}`];

      let searchedISBN = book.identifiers.isbn_10[0]
      const isDuplicate = await checkMediaExists(searchedISBN);
      console.log('book', book)

      return {
        isbn: searchedISBN,
        title: book.title,
        authors: book.authors ? book.authors.map((author) => author.name).join(", ") : "Unknown",
        publish_date: book.publish_date || "Unknown",
        cover: book.cover ? book.cover.large : null,
        description: book.notes || "No description available",
        duplicate: isDuplicate,
      };
    } else {
      return { error: `Book not found. ISBN: ${isbn}` };
    }
  } catch (error) {
    console.error("Error fetching book info:", error);
    return { error: "Error fetching book info" };
  }
};

export const BarcodeScanner = ({ onScan }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    Quagga.init({
      inputStream: {
        type: "LiveStream",
        target: scannerRef.current, 
        constraints: {
          facingMode: "environment",
        },
      },
      locator: {
        patchSize: "large",  
        halfSample: true,   
      },
      decoder: {
        readers: [
          "ean_reader",  // ISBN-13 / EAN-13
        ],
      },
      locate: true,
      debug: {
        drawBoundingBox: true,  
        showFrequency: true,    
        drawScanline: true,   
      }
    }, (err) => {
      if (err) {
        console.error("Quagga init error:", err);
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected(async (result) => {
      const isbn = result.codeResult.code;
      console.log("Detected ISBN: ", isbn);
      Quagga.stop();

      const bookDetails = await getBookInfo(isbn);
      onScan(bookDetails);
    });

    return () => {
      Quagga.stop();
    };
  }, [onScan]);

  return (
    <div>
      <div ref={scannerRef} style={{ width: "100%", height: "300px" }} />
    </div>
  );
};

