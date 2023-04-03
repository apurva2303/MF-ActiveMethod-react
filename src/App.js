import './App.css';
import ConventionalPortfolio from './components/conventional/conventional_portfolio';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Individual_fund from './components/conventional/individual_fund';
import { funds_urls } from './components/conventional/logic';


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<ConventionalPortfolio />} />

        {Object.keys(funds_urls).map((item, i) => (
          <Route key={i} path={`/${item}`} element={<Individual_fund fund={`${item}`} />} />
        ))}
{/* 
        <Route path='/gold' element={<Individual_fund fund="gold" />} />
        <Route path='/nifty_jr' element={<Individual_fund fund="nifty_jr" />} />
        <Route path='/sensex' element={<Individual_fund fund="sensex" />} />
        <Route path='/international' element={<Individual_fund fund="international" />} /> */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;
