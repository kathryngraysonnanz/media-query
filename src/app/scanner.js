"use client";

import { useEffect, useRef } from "react";
import Quagga from "quagga";

import { checkMediaExists } from "../../lib/firestore";

export const getBookInfo = async (isbn) => {
  console.log("isbn:", isbn);
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data[`ISBN:${isbn}`]) {
      const book = data[`ISBN:${isbn}`];
      const searchedISBN =
        book.identifiers?.isbn_10?.[0] ||
        book.identifiers?.isbn_13?.[0] ||
        isbn;
      const isDuplicate = await checkMediaExists(searchedISBN);
      let tags = book.subjects ? book.subjects.map(item => item.name) : [];

      return {
        isbn: searchedISBN,
        title: book.title,
        authors: book.authors ? book.authors.map(a => a.name).join(", ") : "Unknown",
        publish_date: book.publish_date || "Unknown",
        cover: book.cover ? book.cover.large : null,
        description: book.notes || "No description available",
        duplicate: isDuplicate,
        tags: tags
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
  const readersSequence = ["ean_reader", "upc_reader"];
  const currentReaderIndex = useRef(0);
  const fallbackTimeout = useRef(null);

  const startScanner = (reader) => {
    Quagga.init(
      {
        inputStream: {
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            facingMode: "environment",
            width: { min: 640, ideal: 1280 },
            height: { min: 480, ideal: 720 },
            aspectRatio: { ideal: 1.777 }
          }
        },
        locator: {
          patchSize: "medium",
          halfSample: true,
        },
        decoder: {
          readers: [reader],
        },
        locate: true,
        debug: {
          drawBoundingBox: true,
          showFrequency: true,
          drawScanline: true,
        },
      },
      (err) => {
        if (err) {
          console.error("Quagga init error:", err);
          return;
        }
        Quagga.start();
      }
    );
  };

  const tryNextReader = () => {
    Quagga.stop();
    currentReaderIndex.current =
      (currentReaderIndex.current + 1) % readersSequence.length;
    startScanner(readersSequence[currentReaderIndex.current]);
  };

  useEffect(() => {
    if (!scannerRef.current) return;

    startScanner(readersSequence[currentReaderIndex.current]);

    Quagga.onDetected(async (result) => {
      clearTimeout(fallbackTimeout.current);
      const isbn = result.codeResult.code;
      Quagga.stop();

      const bookDetails = await getBookInfo(isbn);
      onScan(bookDetails);
    });

    // fallback: switch reader if nothing detected in 5 seconds
    fallbackTimeout.current = setTimeout(tryNextReader, 5000);

    return () => {
      clearTimeout(fallbackTimeout.current);
      Quagga.stop();
      Quagga.offDetected(); // remove listeners
    };
  }, [onScan]);

  return (
    <div>
      <div ref={scannerRef} style={{ width: "100%", height: "300px" }} />
    </div>
  );
};
