import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CallPage from './pages/CallPage';

function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/call_and_chat/:roomIdFromParams/:usernameFromParams" element={<CallPage />} />
      </Routes>
    </Router>
  );
}

export default App;
