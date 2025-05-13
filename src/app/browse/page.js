"use client";

import { useEffect, useState } from "react";
import { Grid, GridColumn as Column } from "@progress/kendo-react-grid";
import { orderBy } from "@progress/kendo-data-query";

import { getMedia } from "../../../lib/firestore";
import Header from "../header/header";

export default function MediaGrid() {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState([]);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const data = await getMedia(); 
        setMediaItems(data);
      } catch (error) {
        console.error("Error fetching media:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  const handleSortChange = (e) => {
    setSort(e.sort);
  };

  const sortedData = orderBy(mediaItems, sort);

  return (
    <>
     <Header/> 
    <main>
       
      <h2>Browse Media Library</h2>
      <br/>
      <Grid
        data={sortedData}
        style={{ maxHeight: "100vh" }}
        sortable={true}
        sort={sort}
        onSortChange={handleSortChange}
        loading={loading}
      >
        <Column field="title" title="Title"/>
        <Column field="author" title="Author(s)" />
        <Column field="isbn" title="ISBN" sortable={false} />
        <Column field="published" title="Published"  />

      </Grid>
    </main>
    </>
  );
};

