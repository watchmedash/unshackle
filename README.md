# Art Real Estate - Node.js Website

A full-featured real estate website for Art Real Estate, Sharjah, UAE.
Built with pure Node.js (no external dependencies required).

## Setup & Run

```bash
node server.js
```

Then open: http://localhost:3000

## Admin Panel

URL: http://localhost:3000/admin
Username: admin
Password: admin123

Change credentials in server.js (ADMIN_USER and ADMIN_PASS_HASH).

## Features
- Homepage with hero, search, featured properties
- Properties listing with filter by type/status/keyword  
- Individual property pages with image gallery, lightbox, video player
- Contact page
- Admin dashboard with stats
- Add/Edit/Delete properties
- Upload multiple images and videos per property
- Responsive for mobile (burger menu, stacked layout)
- Blue/white theme with FontAwesome icons

## Folder Structure
- server.js - Main server (all routes + templating)
- public/css/ - Stylesheets
- public/js/ - Client JS
- public/images/ - Logo, placeholder
- public/uploads/properties/ - Uploaded property media
- data/properties.json - Property data storage
- data/sessions.json - Admin sessions
