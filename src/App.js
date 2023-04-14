import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import './index.css'

const firebaseConfig = {
  apiKey: "AIzaSyBhSnImoTCBTNDlEFKkGmei1yVovgmcdzw",
  authDomain: "button-counter-tracker.firebaseapp.com",
  projectId: "button-counter-tracker",
  storageBucket: "button-counter-tracker.appspot.com",
  messagingSenderId: "414414894276",
  appId: "1:414414894276:web:6892ae88716ec31daa8591",
  measurementId: "G-9KF8M2T2QW"
};

firebase.initializeApp(firebaseConfig);

function App() {
  const [count, setCount] = useState(0);
  const [countryCounts, setCountryCounts] = useState({});

  useEffect(() => {
    // Attach a listener to the Firebase database to keep the count and countryCounts state in sync
    const databaseRef = firebase.database().ref();
    databaseRef.on('value', (snapshot) => {
      const data = snapshot.val() || {};
      setCount(data.count || 0);
      setCountryCounts(data.countryCounts || {});
    });

    // Return a cleanup function to detach the listener when the component is unmounted
    return () => {
      databaseRef.off('value');
    };
  }, []);

  async function fetchGeolocationData() {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();

      const country = data.country_name;
      const newCountryCounts = {
        ...countryCounts,
        [country]: (countryCounts[country] || 0) + 1
      };
      setCountryCounts(newCountryCounts);

      // Update the Firebase database with the new count and countryCounts
      firebase.database().ref().set({
        count: count + 1,
        countryCounts: newCountryCounts
      });
    } catch (error) {
      console.error("Error getting IP geolocation data:", error);
    }
  }

  function handleClick() {
    setCount(count + 1);
    fetchGeolocationData();
  }

  return (
    <div>
      <p>Total Clicks: {count}</p>
      <button onClick={handleClick}>Click me to increase the count</button>
      <table>
        <thead>
          <tr>
            <th>Country  </th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(countryCounts).map(([country, count]) => (
            <tr key={country}>
              <td>{country}</td>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
