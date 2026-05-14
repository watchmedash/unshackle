# Art Real Estate — Feature Batch Design

**Date:** 2026-05-14  
**Scope:** 12 features + module refactor of `server.js`

---

## 1. Module Refactor

Split the current monolithic `server.js` (~1,400 lines) into focused modules. `server.js` becomes a thin entry point that creates the HTTP server and dispatches to route handlers.

### New file layout

```
server.js
lib/
  data.js          — readData/writeData (with write queue), readSessions/writeSessions
  auth.js          — hashPassword, verifySession, requireAdmin
  upload.js        — parseMultipart, saveUploadedFile (moved from server.js)
  rateLimit.js     — createLimiter(maxRequests, windowMs) factory
routes/
  public.js        — handles: /, /properties, /property/:id, /contact GET+POST
  admin.js         — handles: all /admin/* routes
templates/
  layout.js        — layout(title, body, options) wrapper
  propertyCard.js  — propertyCard(p, settings) — settings needed for WhatsApp number
  helpers.js       — imgSrc(img), formatPrice(p), and other shared template utils
.env               — PORT, ADMIN_USER, ADMIN_PASS (gitignored)
.env.example       — committed template showing required keys
```

`server.js` dispatch logic stays the same pattern (`new URL()` + `pathname` matching) — no framework change.

---

## 2. Infrastructure Features

### 2a. Environment variables (.env)

- Install `dotenv` package.
- `require('dotenv').config()` at top of `server.js`.
- Keys: `PORT` (default 3000), `ADMIN_USER` (default `admin`), `ADMIN_PASS` (plaintext; hashed on startup with SHA-256 as today).
- `.env.example` committed with placeholder values; `.env` added to `.gitignore`.
- `lib/auth.js` reads `process.env.ADMIN_USER` and computes hash from `process.env.ADMIN_PASS` at module load.

### 2b. Write queue (`lib/data.js`)

All `writeData()` calls serialize through a promise chain to prevent concurrent writes corrupting `properties.json`:

```js
let writeChain = Promise.resolve();
function writeData(data) {
  writeChain = writeChain.then(() =>
    fs.promises.writeFile(DATA_FILE, JSON.stringify(data, null, 2))
  );
  return writeChain;
}
```

`readData()` stays synchronous (reads are safe to overlap).  
`writeSessions()` gets the same treatment with its own chain.

### 2c. Rate limiter (`lib/rateLimit.js`)

```js
// createLimiter(max, windowMs) → middleware-style function(ip) → boolean
```

In-memory `Map<ip, { count, resetAt }>`. Returns `false` when limit exceeded.  
Applied to `POST /contact`: max 3 per IP per 15 minutes. Returns HTTP 429 with a user-visible message in the existing contact form error style.  
Map entries are cleaned up lazily on access (expired entries reset).

---

## 3. Search & Browse Features

### 3a. Price range filter

Two number inputs added to the filter bar on `/properties`: `minPrice` and `maxPrice`.  
Server-side filter applied after type/status/keyword: `p.price >= minPrice && p.price <= maxPrice`. All property prices are stored as numbers regardless of currency label, so this is always numeric. Skip the bound if the query param is blank or `NaN`.  
Inputs preserve their values across page loads via query params.

### 3b. Sort order

Dropdown added to filter bar: **Newest** (default, createdAt desc), **Price: Low → High**, **Price: High → Low**.  
Sort applied server-side after all filters, before pagination.  
Query param: `sort=newest|price_asc|price_desc`.

### 3c. Pagination

- 9 properties per page.
- Query param: `?page=N` (1-indexed, defaults to 1).
- Pagination UI below grid: Prev button, page numbers (show max 5 with ellipsis), Next button.
- Results count updated to show e.g. "Showing 1–9 of 23 properties".
- All existing filter/sort params preserved in pagination links.

---

## 4. Property UX Features

### 4a. WhatsApp button on cards

`propertyCard(p, settings)` gains a second argument. A WhatsApp icon button appears in the bottom-right of the card media area (same area as the image count badge). Links to:  
`https://wa.me/{settings.whatsapp}?text=I'm interested in {encodeURIComponent(p.title)}`  
Stops click propagation so the card's `onclick` (navigate to detail) doesn't fire.

### 4b. Similar properties

New section in the detail page sidebar, below the contact card.  
Query: all properties where `type === prop.type`, excluding `prop.id`, limited to 3. If fewer than 3 found, fill from same first word of `prop.location`.  
Each result shown as a compact mini-card (thumbnail + title + price). Pure server-side — no new endpoints.

### 4c. Mortgage calculator

Shown only on **For Sale** properties. Renders below the Features section in the main column.

**Inputs (with defaults):**
- Down payment: % slider + number input (default 20%)
- Annual interest rate: % input (default 4%)
- Loan term: years input (default 25)

**Output:** Monthly payment (AED), computed client-side on input change.  
Formula: `M = P·[r(1+r)^n] / [(1+r)^n − 1]` where P = price × (1 − down%), r = annual rate / 12 / 100, n = term × 12.  
No server call needed.

---

## 5. Admin Features

### 5a. Image reorder (up/down arrows)

In the admin edit form, each existing image thumbnail gains ↑ and ↓ buttons.  
Each thumbnail is backed by a `<input type="hidden" name="existingImages[]" value="{filename}">` inside its container div.  
JS swaps adjacent container divs (including their hidden inputs) on click. The first thumbnail has ↑ disabled; the last has ↓ disabled.  
On form submit, the server reads `existingImages[]` in submitted order (replacing the current `removedImages`-only tracking). Images not in `existingImages[]` are treated as removed.  
The "Main" badge stays on whichever thumbnail is first.

### 5b. Status toggle

New icon button in the admin properties table row (beside Edit):
- `For Sale` → clicking marks as **Sold**
- `Sold` → clicking marks as **For Sale**
- `For Rent` → clicking marks as **Rented**
- `Rented` → clicking marks as **For Rent**

New endpoint: `POST /admin/properties/status/:id` — reads body `{ status }`, validates it is one of the four allowed values, writes via queue, returns 200 JSON.  
Button updates in-place via `fetch()` without page reload.

### 5c. Enquiry reply button

Each enquiry row in the admin enquiry list gets a **Reply** button.  
Generates: `mailto:{email}?subject=Re: Your Property Enquiry&body=Dear {name},%0A%0A`  
Clicking the button also fires `fetch('POST /admin/enquiries/{id}/read')` to mark it read, mirroring the existing read-on-open behavior.  
New endpoint: `POST /admin/enquiries/:id/read` — marks enquiry read and returns 200.

---

## 6. Data Model Changes

No schema migrations needed. Two additions to `properties.json` property objects:
- `status` gains two new valid values: `"Sold"` and `"Rented"` (existing code treats any non-"For Sale" as "For Rent" badge — update badge logic to handle all four values).

Badge color mapping:
- `For Sale` → blue (existing `badge-sale`)
- `For Rent` → teal (existing `badge-rent`)
- `Sold` → grey (`badge-sold`, new)
- `Rented` → grey (`badge-sold`, reuse same style)

---

## 7. Out of Scope

- No database migration (stays JSON file).
- No Express router adoption (stays `http` + manual dispatch).
- No test suite (no existing tests to follow).
- No drag-and-drop image reorder (up/down arrows chosen).
- No full amortization table in calculator (monthly payment only).
