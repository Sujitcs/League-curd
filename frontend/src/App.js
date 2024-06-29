import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [leagues, setLeagues] = useState([]);
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    members: '',
    inviteEmail: '',
  });
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [formType, setFormType] = useState(null);
  const [emailError, setEmailError] = useState('');

  // const url = "http://localhost:5000";
  const url="https://league-curd-backendapi.vercel.app";

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      const response = await axios.get(`${url}/leagues`);
      setLeagues(response.data);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    }
  };

  const openForm = (type, league = null) => {
    setSelectedLeague(league);
    setFormType(type);

    if (league) {
      setFormState({
        title: league.league_title,
        description: league.league_description,
        members: league.members,
        inviteEmail: '',
      });
    } else {
      setFormState({
        title: '',
        description: '',
        members: '',
        inviteEmail: '',
      });
    }
  };

  const closeForm = () => {
    setSelectedLeague(null);
    setFormType(null);
    setFormState({
      title: '',
      description: '',
      members: '',
      inviteEmail: '',
    });
  };

  const saveLeague = async () => {
   const { title, description, members } = formState;

  if (!title || !description) {
    alert('Please enter league name and description.');
    return;
  }

  const newLeague = {
    league_title: title,
    league_description: description,
  };

  if (formType === 'edit') {
    if (!members) {
      alert('Please enter at least one member.');
      return;
    }
    newLeague.members = members;
  }

  try {
    if (selectedLeague) {
      await axios.put(`${url}/leagues/${selectedLeague._id}`, newLeague);
    } else {
      await axios.post(`${url}/leagues`, newLeague);
    }
    fetchLeagues();
    closeForm();
  } catch (error) {
    console.error('Error saving league:', error);
  }
};

  const deleteLeague = async (id) => {
    try {
      await axios.delete(`${url}/leagues/${id}`);
      fetchLeagues();
      closeForm();
    } catch (error) {
      console.error('Error deleting league:', error);
    }
  };

  const inviteFriend = async (leagueId) => {
    const { inviteEmail } = formState;
  
    if (!inviteEmail || !validateEmail(inviteEmail)) {
      alert('Invalid email address');
      return;
    }
  
    const league = leagues.find(l => l._id === leagueId);
  
    if (!league) {
      console.error('League not found');
      return;
    }
  
    if (!league.members || !league.members.includes(inviteEmail)) {
      try {
        await axios.post(`${url}/leagues/invite/${leagueId}`, { email: inviteEmail });
        fetchLeagues();
        closeForm();
      } catch (error) {
        console.error('Error inviting friend:', error);
      }
    } else {
      alert('This email is already invited.');
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e) => {
    setFormState({
      ...formState,
      inviteEmail: e.target.value,
    });

    if (validateEmail(e.target.value)) {
      setEmailError('');
    } else {
      setEmailError('Invalid email address');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value,
    });
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
            <th>Member</th>
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

      {formType && (
        <div className="form-container">
          <h2>{formType === 'create' ? 'Create League' : formType === 'edit' ? 'Edit League' : 'Invite Friend'}</h2>
          <form>
            {formType !== 'invite' && (
              <>
                <h4>Name</h4>
                <input
                  type="text"
                  name="title"
                  value={formState.title}
                  onChange={handleInputChange}
                  placeholder="Enter League Name"
                />
                <h4>Description</h4>
                <input
                  type="text"
                  name="description"
                  value={formState.description}
                  onChange={handleInputChange}
                  placeholder="Enter League Description"
                />
              
                {formType === 'edit' && (
                  <>
                    <h4>Member</h4>
                    <input
                      type="text"
                      name="members"
                      value={formState.members}
                      onChange={handleInputChange}
                      placeholder="Enter Member Email"
                    />
                  </>
                )}
                <button type="button" onClick={saveLeague}>Save</button>
              </>
            )}
            {formType === 'invite' && (
              <>
                <input
                  type="text"
                  value={formState.inviteEmail}
                  onChange={handleEmailChange}
                  placeholder="Enter Email"
                />
                {emailError && <span className="error">{emailError}</span>}
                <button type="button" onClick={() => inviteFriend(selectedLeague._id)}>Send Invite</button>
              </>
            )}
            <button type="button" onClick={closeForm}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;
