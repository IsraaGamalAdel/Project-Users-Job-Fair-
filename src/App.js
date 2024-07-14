import './App.css';
import React, { useEffect, useState } from 'react';
import Home from './Components/Home/Home';
import { BrowserRouter, Route, Routes  } from 'react-router-dom';
import Edit from './Components/Edit/Edit';
import Create from './Components/Create/Create';


function App() {
    return <>
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/Create' element={<Create />} />
                <Route path='/edit/:id' element={<Edit />} />
            </Routes>
        </BrowserRouter>
    </>
}

export default App;