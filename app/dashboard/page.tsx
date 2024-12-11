"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faBars, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const TefillinTracker = () => {
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [wrappedToday, setWrappedToday] = useState(false);
  const [weekData, setWeekData] = useState(Array(7).fill(false));

  useEffect(() => {
    const savedStreak = parseInt(localStorage.getItem('streak') || '0', 10);
    const savedXp = parseInt(localStorage.getItem('xp') || '0', 10);
    const savedWeekData = JSON.parse(localStorage.getItem('weekData') || '[]');

    setStreak(savedStreak);
    setXp(savedXp);
    setWeekData(savedWeekData.length ? savedWeekData : Array(7).fill(false));

    const today = new Date().getDay();
    setWrappedToday(savedWeekData[today]);
  }, []);

  const handleWrapTefillin = () => {
    if (wrappedToday) return;

    const today = new Date().getDay();
    const newWeekData = [...weekData];
    newWeekData[today] = true;

    const newStreak = streak + 1;
    let newXp = xp + 5;

    if (newStreak % 7 === 0) {
      newXp += 20; // Milestone bonus
    }

    setStreak(newStreak);
    setXp(newXp);
    setWrappedToday(true);
    setWeekData(newWeekData);

    localStorage.setItem('streak', newStreak.toString());
    localStorage.setItem('xp', newXp.toString());
    localStorage.setItem('weekData', JSON.stringify(newWeekData));

    alert(`🎉 You earned 5 XP! Total XP: ${newXp}`);
  };

  const data = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Tefillin Wrapped',
        data: weekData.map(day => (day ? 1 : 0)),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-full max-w-md bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-center pb-4">Tefillin Tracker</h2>
      <div className="text-center mb-4">
        <p>Streak: {streak} days</p>
        <p>XP: {xp}</p>
      </div>
      <motion.div >
        <button
          className={`bg-blue-500 text-white p-2  rounded ${wrappedToday ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleWrapTefillin}
          disabled={wrappedToday}
        >
          {wrappedToday ? 'Wrapped Today' : 'Wrap Tefillin'}

        </button>
      </motion.div>
      <div className="mt-6">
        <Bar data={data} />
      </div>
    </motion.div>
  );
};

const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResults([]);
    try {
      const response = await fetch(`https://web-production-aae7.up.railway.app/api/mitzvot/search?q=${query}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-full max-w-md bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-center pb-4">Search for a Miztvot:</h2>
      <form onSubmit={handleSearch} className="flex gap-4 items-center mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search mitzvot..."
          className="flex-1 border p-2 rounded"
        />
        <motion.div whileHover={{ scale: 1.2 }} onHoverStart={event => {}} onHoverEnd={event => {}}>
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Search
          </button>
        </motion.div>
      </form>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
        <ul className="list-disc pl-5">
          {results.map((mitzvah) => (
            <li key={mitzvah.number} className="mb-2 flex items-start">
              <div className="flex-1">
                <strong>{mitzvah.number})</strong> {mitzvah.description} -- <em>{mitzvah.source}</em>
              </div>
              <motion.div whileHover={{ scale: 1.2 }} onHoverStart={event => {}} onHoverEnd={event => {}}>
                <button className="bg-gray-500 text-white p-1 rounded ml-4 w-6 h-6 flex items-center justify-center">
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </motion.div>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState('search');
  const [randomMitzvah, setRandomMitzvah] = useState(null);
  const [error, setError] = useState('');

  const fetchRandomMitzvah = async () => {
    setError('');
    try {
      const response = await fetch('https://web-production-aae7.up.railway.app/api/mitzvot/random');
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setRandomMitzvah(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case 'search':
        return <SearchComponent />;
      case 'tefillin':
        return <TefillinTracker />;
      default:
        return <SearchComponent />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-gray-100 relative">
      <button
        className="absolute top-4 left-4 bg-blue-500 text-white p-2 rounded w-10 h-10 flex items-center justify-center"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <FontAwesomeIcon icon={faBars} />
      </button>
      {menuOpen && (
        <div className="absolute top-14 left-4 bg-white shadow-md rounded p-4 w-48">
          <ul>
            <li className="py-2 border-b cursor-pointer" onClick={() => setActiveComponent('search')}>Search Mitzvot</li>
            <li className="py-2 border-b cursor-pointer" onClick={() => setActiveComponent('tefillin')}>Tefillin Tracker</li>
            <li className="py-2 border-b cursor-pointer" onClick={fetchRandomMitzvah}>Random Mitzvah</li>
          </ul>
        </div>
      )}
      {randomMitzvah && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md">
            <h3 className="text-lg font-bold mb-4">Random Mitzvah</h3>
            <p>{randomMitzvah.description} <br /> <em>--{randomMitzvah.source}</em></p>
            <button className="mt-4 bg-blue-500 text-white p-2 rounded" onClick={() => setRandomMitzvah(null)}>Close</button>
          </div>
        </div>
      )}
      {renderComponent()}
    </div>
  );
};

export default Dashboard;