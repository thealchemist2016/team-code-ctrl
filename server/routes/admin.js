const express = require('express');
const router = express.Router();
const db = require('../db');
const withAuth = require('../middleware');
const { adminOnly } = require('../middleware');

// GET /users — list all users (exclude passwords)
router.get('/users', withAuth, adminOnly, function(req, res) {
  try {
    const users = db.getUsers().map(function(u) {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });
    res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error fetching users' });
  }
});

// GET /albums — list all albums with user info
router.get('/albums', withAuth, adminOnly, function(req, res) {
  try {
    const albums = db.getAlbums();
    res.json({ success: true, albums });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error fetching albums' });
  }
});

// GET /stats — counts of users, albums, singles (tracks), tickets, notifications
router.get('/stats', withAuth, adminOnly, function(req, res) {
  try {
    const users = db.getUsers();
    const albums = db.getAlbums();
    const tickets = db.getTickets();
    const notifications = db.getNotifications();
    res.json({
      success: true,
      stats: {
        users: users.length,
        albums: albums.length,
        singles: albums.reduce(function(sum, a) { return sum + (a.tracks ? a.tracks.length : 0); }, 0),
        tickets: tickets.length,
        notifications: notifications.length
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error fetching stats' });
  }
});

// GET /export/users — CSV export of all users
router.get('/export/users', withAuth, adminOnly, function(req, res) {
  try {
    const users = db.getUsers();
    const headers = ['_id', 'fname', 'lname', 'email', 'username', 'role', 'balance', 'tosAccepted'];
    let csv = headers.join(',') + '\n';
    users.forEach(function(u) {
      const row = headers.map(function(h) {
        const val = u[h] !== undefined ? String(u[h]) : '';
        // Escape commas and quotes in CSV
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return '"' + val.replace(/"/g, '""') + '"';
        }
        return val;
      });
      csv += row.join(',') + '\n';
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error exporting users' });
  }
});

// GET /export/albums — CSV export of all albums
router.get('/export/albums', withAuth, adminOnly, function(req, res) {
  try {
    const albums = db.getAlbums();
    const headers = ['_id', 'albumName', 'artist', 'numberOfTracks', 'status', 'cover', 'user'];
    let csv = headers.join(',') + '\n';
    albums.forEach(function(a) {
      const row = headers.map(function(h) {
        let val;
        if (h === 'user' && typeof a.user === 'object') {
          val = a.user.username || '';
        } else {
          val = a[h] !== undefined ? String(a[h]) : '';
        }
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return '"' + val.replace(/"/g, '""') + '"';
        }
        return val;
      });
      csv += row.join(',') + '\n';
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=albums.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error exporting albums' });
  }
});

module.exports = router;
