
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Tutor from "./pages/Tutor";
import Materials from "./pages/Materials";
import Quizzes from "./pages/Quizzes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/tutor" element={<Tutor />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
