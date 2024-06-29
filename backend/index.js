const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const DBHOST = process.env.DBHOST;

mongoose.connect(DBHOST)
    .then(() => {
        console.log('MongoDB Connnected...')
    }).catch((err) => {
        console.log('Error while Mongo Conn..', err);
    })

const PORT =process.env.PORT || 5000;

const leagueSchema = new mongoose.Schema({
  league_title: String,
  league_description: String,
  members: String,
  // owner: String,
});

const League = mongoose.model('League', leagueSchema);

// Get all leagues
app.get('/leagues', async (req, res) => {
  try {
    const leagues = await League.find();
    res.status(200).json(leagues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Create a new league
app.post('/leagues', async (req, res) => {
  const newLeague = new League(req.body);
  try {
    const savedLeague = await newLeague.save();
    res.status(200).json(savedLeague);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update an existing league
app.put('/leagues/:id', async (req, res) => {
  try {
    const updatedLeague = await League.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedLeague);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a league
app.delete('/leagues/:id', async (req, res) => {
  try {
    await League.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'League deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Invite a friend to a league
app.post('/leagues/invite/:id', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  try {
    const league = await League.findById(id);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    league.members = email;
    await league.save();
    res.status(200).json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get one leagues
app.get('/leagues/:id', async (req, res) => {
  try {
    const leagues = await League.find(req.params.id);
    res.status(200).json(leagues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get('/',(req, res)=>{
  res.send("<h1>Welcome to Web Server</h1>");
});
app.listen(PORT, () => {
  console.log(`Server running ${PORT}`)
})
