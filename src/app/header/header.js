'use client'

import { AppBar, AppBarSection } from "@progress/kendo-react-layout"

import styles from './header.module.scss'

export default function Header() {
    return (
    <AppBar className={styles.header}>
        <AppBarSection>
            <h1>Media Library</h1>
        </AppBarSection>
        <AppBarSection>
            <a href="/">Add</a>
            <a href="/library">Search</a>
            <a href="/browse">Browse</a>
        </AppBarSection>
    </AppBar>
    )
}