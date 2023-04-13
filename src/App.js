import './App.css';
import ConventionalPortfolio from './components/conventional/conventional_portfolio';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Conventional_Individual_fund from './components/conventional/individual_fund';
import Proposed_Individual_fund from './components/proposed/individual_fund';
import { funds_urls } from './components/conventional/logic';
import { useState } from 'react';
import Proposed_portfolio from './components/proposed/proposed_portfolio';
import Home from './components/home';


function App() {

  const [data, setData] = useState([]);
  const fullData = [];


  // Define a function that goes to 
  const fetchData = (data) => {
    fullData.push(data);
    setData(fullData);
  }


  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />

        <Route path='/conventional' element={<ConventionalPortfolio data = {data} />} />
        {Object.keys(funds_urls).map((item, i) => (
          <Route key={i} path={`/conventional/${item}`} element={<Conventional_Individual_fund fetchData={fetchData}  fund={`${item}`} />} />
        ))}

        <Route path='/proposed' element={<Proposed_portfolio  />} />
        {Object.keys(funds_urls).map((item, i) => (
          <Route key={i} path={`/proposed/${item}`} element={<Proposed_Individual_fund fetchData={fetchData}  fund={`${item}`} />} />
        ))}

      </Routes>
    </BrowserRouter>
  );
}

export default App;
