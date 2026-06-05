# Milestone 1 Feedback & Fix Plan

The Forensic Auditor returned a verdict of **CLEAN**. However, the Reviewers have identified several functional bugs, validation gaps, and security risks. You must implement the following fixes:

## 1. Registration Input Validation (M1 scope)
- **Frontend (`client/xs-records/src/components/register.js`)**: Add the HTML5 `required` attribute to all input elements (fname, lname, email, username, password).
- **Backend (`server/routes/users.js`)**: In `POST /users/register`, validate that `fname`, `lname`, `email`, `username`, and `password` are present and not empty strings. If any are blank, reject with `400 Bad Request` and a JSON error message `{ success: false, error: "All fields are required" }`. Also check email validity.

## 2. Secure Track Creation & Session Removal (M1/M3 security scope)
- **Backend (`server/routes/tracks.js`)**: Modify `POST /tracks/add` to extract the album reference directly from `req.body.albumId` (or `req.body.album`) rather than falling back to `req.session.lastAlbumId` or `db.getLatestAlbum()`. Secure the route with `withAuth` and assign the track user ownership based on `req.username`.
- **Frontend (`client/xs-records/src/components/add-track.js`)**: Ensure the form sends the selected `albumId` in the request body.

## 3. Form Input Names for File Selectors (M2/M3 preparation)
- **Frontend (`client/xs-records/src/components/add-album.js`)**: Add `name="cover"` to the cover file input component so the state handles it correctly.
- **Frontend (`client/xs-records/src/components/add-track.js`)**: Add `name="audio"` to the audio file input component.

## 4. Clean Redundant Body Parser Middleware
- **Backend (`server/app.js`)**: Remove the duplicate body-parsers (imports and `app.use` lines for `body-parser`), keeping only the native Express JSON and urlencoded middlewares.
