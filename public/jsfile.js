// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVrdDQNTDE91rNL2B02rYHD7WYPs_cCN4",
  authDomain: "bbq-krust-confirmation.firebaseapp.com",
  databaseURL: "https://bbq-krust-confirmation-default-rtdb.firebaseio.com/",
  projectId: "bbq-krust-confirmation",
  storageBucket: "bbq-krust-confirmation.appspot.com",
  messagingSenderId: "511549210405",
  appId: "1:511549210405:web:b7b7929a4f8d7e3184e4cc",
  measurementId: "G-KPK6KTTDSL"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const fixedRoster = [
  'Jose S', 'Antonio', 'Seth B', 'Nathan F', 'David S', 'Christian P', 
  'Kerby', 'Issa', 'Georges', 'Joey', 'JC', 'Elijah', 'Ana', 'Seb', 'Lucas', 'Eli'
];

// Function to render the table
function renderTable() {
  const table = document.getElementById('availability-table');
  table.innerHTML = ''; // Clear table content before rendering

  // Create header row with dates
  const headerRow = document.createElement('tr');
  const emptyHeaderCell = document.createElement('th');
  headerRow.appendChild(emptyHeaderCell);

  const dates = ['sep-13', 'sep-14', 'sep-19', 'sep-20', 'sep-21'];
  dates.forEach(date => {
    const dateCell = document.createElement('th');
    dateCell.textContent = date;
    headerRow.appendChild(dateCell);
  });

  table.appendChild(headerRow);

  // Render fixed roster and any new players added
  db.ref('availability').once('value', snapshot => {
    const availabilityData = snapshot.val() || {};

    fixedRoster.concat(Object.keys(availabilityData).filter(name => !fixedRoster.includes(name))).forEach(name => {
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      nameCell.textContent = name;
      row.appendChild(nameCell);

      dates.forEach(date => {
        const cell = document.createElement('td');
        const status = availabilityData[name]?.[date] || '';

        if (status === 'yes') {
          cell.style.backgroundColor = 'green';
        } else if (status === 'no') {
          cell.style.backgroundColor = 'red';
        }

        cell.addEventListener('click', () => {
          const newStatus = status === 'yes' ? 'no' : status === 'no' ? '' : 'yes';
          db.ref(`availability/${name}/${date}`).set(newStatus);
          renderTable(); // Re-render table
        });

        row.appendChild(cell);
      });

      table.appendChild(row);
    });
  });
}

// Function to handle adding new players
document.getElementById('add-player-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const newPlayer = document.getElementById('new-player').value.trim();
  
  if (newPlayer && !fixedRoster.includes(newPlayer)) {
    db.ref(`availability/${newPlayer}`).set({
      'sep-13': '',
      'sep-14': '',
      'sep-19': '',
      'sep-20': '',
      'sep-21': ''
    });
    renderTable();
    document.getElementById('new-player').value = ''; // Clear input
  }
});

// Function to reset all answers and remove new players
document.getElementById('reset-answers').addEventListener('click', function () {
  db.ref('availability').once('value', snapshot => {
    const availabilityData = snapshot.val() || {};

    // Reset all players' availability
    Object.keys(availabilityData).forEach(name => {
      if (fixedRoster.includes(name)) {
        db.ref(`availability/${name}`).set({
          'sep-13': '',
          'sep-14': '',
          'sep-19': '',
          'sep-20': '',
          'sep-21': ''
        });
      } else {
        db.ref(`availability/${name}`).remove(); // Remove added players
      }
    });
    renderTable(); // Re-render table
  });
});

// Initial render
renderTable();
