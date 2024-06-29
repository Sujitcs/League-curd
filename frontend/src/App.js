import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [leagues, setLeagues] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [formType, setFormType] = useState(null);

  useEffect(() => {
    fetchLeagues();
  }, []);
 const url="https://league-curd-backendapi.vercel.app";
  const fetchLeagues = () => {
    axios.get(`${url}/leagues`)
      .then(response => setLeagues(response.data))
      .catch(error => console.error(error));
  };

  const openForm = (type, league = null) => {
    setSelectedLeague(league);
    setFormType(type);
    if (league) {
      setTitle(league.league_title);
      setDescription(league.league_description);
      setInviteEmail(league.members || '');
    } else {
      setTitle('');
      setDescription('');
      setInviteEmail('');
    }
  };

  const closeForm = () => {
    setSelectedLeague(null);
    setFormType(null);
  };

  const saveLeague = () => {
    if (!title || !description) {
      alert('Please enter both name and description.');
      return;
    }

    const updatedLeague = {
      league_title: title,
      league_description: description,
      members: inviteEmail,
    };

    if (selectedLeague) {
      axios.put(`${url}/leagues/${selectedLeague._id}`, updatedLeague)
        .then(response => {
          fetchLeagues();
          closeForm();
        })
        .catch(error => console.error(error));
    } else {
      axios.post(`${url}/leagues`, updatedLeague)
        .then(response => {
          fetchLeagues();
          closeForm();
        })
        .catch(error => console.error(error));
    }
  };

  const deleteLeague = (id) => {
    axios.delete(``${url}/leagues/${id}`)
      .then(() => {
        fetchLeagues();
        closeForm();
      })
      .catch(error => console.error(error));
  };

  const inviteFriend = (leagueId) => {
    if (!inviteEmail || !validateEmail(inviteEmail)) {
      alert('Invalid email address');
      return;
    }
    const league = leagues.find(l => l._id === leagueId);
    if (league.members.includes(inviteEmail)) {
      alert('This email is already invited.');
      fetchLeagues();
      closeForm();
      return;
    }
  
    axios.post(`${url}/leagues/invite/${leagueId}`, { email: inviteEmail })
      .then(response => {
        fetchLeagues();
        closeForm();
      })
      .catch(error => console.error(error));
  };
  
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <div className="App">
      <div className="header">
        <h1>My Leagues</h1>
        <button className="create-league-btn" onClick={() => openForm('create')}>Create League</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Members</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {leagues.map(league => (
            <tr key={league._id}>
              <td>{league.league_title}</td>
              <td>{league.league_description}</td>
              <td>{league.members}</td>
              <td>
                <button className="edit-btn" onClick={() => openForm('edit', league)}>Edit</button>
                <button className="delete-btn" onClick={() => deleteLeague(league._id)}>Delete</button>
                <button className="invite-btn" onClick={() => openForm('invite', league)}>Invite Friend</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {(formType === 'create' || formType === 'edit') && (
        <div className="form-container">
          <h2>{selectedLeague ? 'Edit League' : 'Create League'}</h2>
          <form>
            <h4>Name</h4>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Name" />
            <h4>Description</h4>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
             {selectedLeague && (
          <>
            <h4>Members</h4>
            <input
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="Enter Email"
            />
          </>
        )}
            <button type="button" onClick={saveLeague}>{selectedLeague ? 'Save Changes' : 'Create League'}</button>
          </form>
        </div>
      )}

      {formType === 'invite' && selectedLeague && (
        <div className="form-container">
          <h2>Invite Friend</h2>
          <form>
            <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Enter Email" />
            <button type="button" onClick={() => inviteFriend(selectedLeague._id)}>Send Invite</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;
