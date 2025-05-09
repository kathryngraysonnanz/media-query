"use client";

import { useEffect, useRef } from "react";
import Quagga from "quagga";

const BarcodeScanner = ({ onScan }) => {
  const scannerRef = useRef(null);

  const getBookInfo = async (isbn) => {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data[`ISBN:${isbn}`]) {
        const book = data[`ISBN:${isbn}`];
        const bookDetails = {
          isbn: isbn, 
          title: book.title,
          authors: book.authors ? book.authors.map((author) => author.name).join(", ") : "Unknown",
          publish_date: book.publish_date || "Unknown",
          cover: book.cover ? book.cover.large : null,
          description: book.notes || "No description available",
        };
        onScan(bookDetails);
      } else {
        console.error("Book not found");
        onScan({error: "Book not found"})
      }
    } catch (error) {
      console.error("Error fetching book info:", error);
      onScan({error: "Error fetching book info"})
    }
  };

  useEffect(() => {
    if (!scannerRef.current) return;

    Quagga.init({
      inputStream: {
        type: "LiveStream",
        target: scannerRef.current, // Target div for camera feed
        constraints: {
          facingMode: "environment", // Use rear camera
        },
      },
      locator: {
        patchSize: "large",  // Increased patch size for better detection
        halfSample: true,    // Reduces the amount of data for faster scanning
      },
      decoder: {
        readers: [
          "ean_reader",          // ISBN-13 / EAN-13
        ],
      },
      locate: true,
      debug: {
        drawBoundingBox: true,  // Draw bounding box around detected barcodes
        showFrequency: true,    // Show how often a barcode is detected
        drawScanline: true,     // Show scanning line
      }
    }, (err) => {
      if (err) {
        console.error("Quagga init error:", err);
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected((result) => {
      const isbn = result.codeResult.code;
      console.log("Detected ISBN: ", isbn);
      Quagga.stop();
      getBookInfo(isbn); // Fetch book info
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

export default BarcodeScanner;
