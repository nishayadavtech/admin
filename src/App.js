import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Main from "./Main";

function App() {
  return (
    <Routes>
     
      <Route path="/" element={<Login />} />

    
      <Route path="/*" element={<Main />} />
    </Routes>
  );
}

export default App;

