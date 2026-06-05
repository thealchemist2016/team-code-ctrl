const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'db.json');

const readData = () => {
  let initialExisted = fs.existsSync(dbPath);
  let data;
  if (!initialExisted) {
    data = { users: [], albums: [], tracks: [] };
  } else {
    try {
      data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (e) {
      data = { users: [], albums: [], tracks: [] };
    }
  }

  // Ensure all collections exist
  let changed = false;
  if (!data.users) data.users = [];
  if (!data.albums) { data.albums = []; changed = true; }
  if (!data.tracks) { data.tracks = []; changed = true; }
  if (!data.notifications) { data.notifications = []; changed = true; }
  if (!data.tickets) { data.tickets = []; changed = true; }
  if (!data.withdrawals) { data.withdrawals = []; changed = true; }

  // 1. Seed standard user if not exists
  let standardUser = data.users.find(u => u.username === 'michaelbyrd7741@gmail.com');
  if (!standardUser) {
    const salt = bcrypt.genSaltSync(10);
    standardUser = {
      fname: 'Michael',
      lname: 'Byrd',
      email: 'michaelbyrd7741@gmail.com',
      username: 'michaelbyrd7741@gmail.com',
      password: bcrypt.hashSync('michael123', salt),
      role: 'user',
      balance: 197,
      tosAccepted: true,
      _id: 'u-1780631162676'
    };
    data.users.push(standardUser);
    changed = true;
  } else {
    if (standardUser.role === undefined) {
      standardUser.role = 'user';
      changed = true;
    }
    if (standardUser.balance === undefined) {
      standardUser.balance = 197;
      changed = true;
    }
    if (standardUser.tosAccepted === undefined) {
      standardUser.tosAccepted = true;
      changed = true;
    }
  }

  // 2. Seed admin user if not exists
  let adminUser = data.users.find(u => u.username === 'admin@xsrecords.com');
  if (!adminUser) {
    const salt = bcrypt.genSaltSync(10);
    adminUser = {
      fname: 'Admin',
      lname: 'User',
      email: 'admin@xsrecords.com',
      username: 'admin@xsrecords.com',
      password: bcrypt.hashSync('admin123', salt),
      role: 'admin',
      balance: 0,
      tosAccepted: true,
      _id: 'u-admin-seed'
    };
    data.users.push(adminUser);
    changed = true;
  } else {
    if (adminUser.role === undefined) {
      adminUser.role = 'admin';
      changed = true;
    }
    if (adminUser.balance === undefined) {
      adminUser.balance = 0;
      changed = true;
    }
    if (adminUser.tosAccepted === undefined) {
      adminUser.tosAccepted = true;
      changed = true;
    }
  }

  if (changed || !initialExisted) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  }

  return data;
};

const writeData = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

module.exports = {
  getUsers: () => readData().users,
  saveUser: (user) => {
    const data = readData();
    // hash password
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    user.password = bcrypt.hashSync(user.password, salt);
    user._id = 'u-' + Date.now();
    user.role = user.role || 'user';
    user.balance = user.balance !== undefined ? user.balance : 0;
    user.tosAccepted = user.tosAccepted !== undefined ? user.tosAccepted : false;
    data.users.push(user);
    writeData(data);
    return user;
  },
  findUserByUsername: (username) => {
    return readData().users.find(u => u.username === username);
  },
  findUserByEmail: (email) => {
    return readData().users.find(u => u.email === email);
  },
  findUserById: (id) => {
    return readData().users.find(u => u._id === id);
  },
  updateUser: (username, updates) => {
    const data = readData();
    const userIndex = data.users.findIndex(u => u.username === username);
    if (userIndex !== -1) {
      data.users[userIndex] = { ...data.users[userIndex], ...updates };
      writeData(data);
      return data.users[userIndex];
    }
    return null;
  },
  comparePassword: (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
  },
  getAlbums: () => {
    const data = readData();
    // Emulate populate
    return data.albums.map(album => {
      const userObj = data.users.find(u => u._id === album.user) || { username: 'Guest' };
      const tracksList = (album.tracks || []).map(trackId => data.tracks.find(t => t._id === trackId)).filter(Boolean);
      return {
        ...album,
        user: { username: userObj.username },
        tracks: tracksList
      };
    });
  },
  saveAlbum: (album) => {
    const data = readData();
    album._id = 'a-' + Date.now();
    album.tracks = [];
    data.albums.push(album);
    writeData(data);
    return album;
  },
  getLatestAlbum: () => {
    const albums = readData().albums;
    if (albums.length === 0) return null;
    return albums[albums.length - 1];
  },
  saveTrack: (title, albumId, userId) => {
    const data = readData();
    const track = {
      _id: 't-' + Date.now(),
      title,
      album: albumId,
      user: userId
    };
    data.tracks.push(track);
    
    // Update album reference
    const album = data.albums.find(a => a._id === albumId);
    if (album) {
      if (!album.tracks) album.tracks = [];
      album.tracks.push(track._id);
    }
    writeData(data);
    return track;
  },

  // Album queries
  getAlbumsByUser: (userId) => {
    return readData().albums.filter(a => a.user === userId);
  },
  getAlbumsByStatus: (status) => {
    return readData().albums.filter(a => a.status === status);
  },
  getAlbumsByUserAndStatus: (userId, status) => {
    return readData().albums.filter(a => a.user === userId && a.status === status);
  },
  updateAlbumStatus: (albumId, status) => {
    const data = readData();
    const album = data.albums.find(a => a._id === albumId);
    if (album) {
      album.status = status;
      writeData(data);
      return album;
    }
    return null;
  },

  // Notifications
  getNotifications: () => readData().notifications,
  getNotificationsByUser: (userId) => {
    return readData().notifications.filter(n => n.userId === userId);
  },
  saveNotification: (notification) => {
    const data = readData();
    notification._id = 'n-' + Date.now();
    data.notifications.push(notification);
    writeData(data);
    return notification;
  },

  // Tickets
  getTickets: () => readData().tickets,
  getTicketsByUser: (userId) => {
    return readData().tickets.filter(t => t.userId === userId);
  },
  saveTicket: (ticket) => {
    const data = readData();
    ticket._id = 'tk-' + Date.now();
    data.tickets.push(ticket);
    writeData(data);
    return ticket;
  },
  addTicketReply: (ticketId, reply) => {
    const data = readData();
    const ticket = data.tickets.find(t => t._id === ticketId);
    if (ticket) {
      if (!ticket.replies) ticket.replies = [];
      ticket.replies.push(reply);
      writeData(data);
      return ticket;
    }
    return null;
  },

  // Withdrawals
  getWithdrawals: () => readData().withdrawals,
  getWithdrawalsByUser: (userId) => {
    return readData().withdrawals.filter(w => w.userId === userId);
  },
  saveWithdrawal: (withdrawal) => {
    const data = readData();
    withdrawal._id = 'w-' + Date.now();
    data.withdrawals.push(withdrawal);
    writeData(data);
    return withdrawal;
  }
};
