// import logo from './logo.svg';
import './App.css';
import ScanBusinessCard  from './components/pages/scanBusinessCard-phone/ScanBusinessCard';
import Questionnaire from './components/pages/questionnaire/Questionnaire';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';

function App() {
  return (
    <>
      <BrowserRouter>
        <ScanBusinessCard/>
      </BrowserRouter>
      
    </>
  );
}

export default App;
