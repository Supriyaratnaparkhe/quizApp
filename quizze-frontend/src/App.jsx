import React  from 'react'
import './App.module.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Register from './Pages/Register/Register';
import Login from './Pages/Login/Login'
import Dashboard from './Pages/Dashboard/Dashboard';
import Analytics from './Pages/Analytics/Analytics';
import QnAnalysis from './Pages/QnAnalysis/QnAnalysis';
import QuizPages from './LivePages/QuizPage';
import SubmitQuiz from './Submit Quiz/SubmitQuiz';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='/dashboard/:userId' element={<Dashboard />}/>
          <Route path='/analytics/:userId' element={<Analytics />}/>
          <Route path='/analytics/:userId/:quizId' element={<QnAnalysis />}/>
          <Route path='/quizLive' element={<QuizPages />}/>
          <Route path='/submitquiz' element={<SubmitQuiz />}/>
        </Routes>
      </BrowserRouter>
      
    </>
  );
}

export default App;
