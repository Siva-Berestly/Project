import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Layout from './pages/Layout';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Heading from './pages/Heading';
import CourseContent from './pages/CourseContent';
import Quiz from './pages/Quiz';
import Help from './pages/Help';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="courses" element={<Courses />} />
          <Route path="heading/:courseName" element={<Heading />} />
          <Route path="coursecontent/:courseId/:headingId" element={<CourseContent />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/help" element={<Help />} />
        </Route>
      </Routes>
    </Router>
  )
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

export default App;