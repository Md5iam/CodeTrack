# CodeTrack

A personal competitive programming contest tracker built for athletes who compete on **Codeforces**, **AtCoder**, and **LeetCode**.

## What It Does

CodeTrack helps you stay on top of your competitive programming journey by letting you:

- **View your profile and rating history** across all three major CP platforms
- **Browse past and upcoming contests** in one unified interface
- **Manually track your contest progress** — mark contests as Completed, Revisit, or Not Tried
- **Add notes** to any contest for future reference
- **Star favourite contests** you want to revisit
- **Track individual problem statuses** (AC / Attempted) per contest
- **Sync all your tracking data to the cloud** so it is accessible from any computer

## Platforms Supported

| Platform | Login Mode | Notes |
|---|---|---|
| Codeforces | By username | Full profile, rating, submissions |
| AtCoder | Manual tracking | No login needed — track contests yourself |
| LeetCode | By username | Profile, contest history, submissions |

## Tech Stack

- **React** + **Vite** — frontend framework
- **Supabase** (PostgreSQL) — cloud database for cross-device sync
- **GitHub Pages** — deployment
- **CORS proxy failover** — multi-proxy parallel racing to fetch AtCoder data in production
- **localStorage** — local caching and fallback

## Getting Started

1. Open the app — you will be prompted to enter your **Supabase Project URL** and **Anon Key**
2. Once connected, pick your platform and connect your handle (or use AtCoder manual mode)
3. Start tracking

> Your Supabase credentials are stored locally in your browser. Data syncs automatically across devices as long as you use the same Supabase project.

## Live App

[https://md5iam.github.io/CodeTrack/](https://md5iam.github.io/CodeTrack/)
