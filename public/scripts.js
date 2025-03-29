document.addEventListener('DOMContentLoaded', function () {
  const leaderboardTable = document.getElementById('leaderboard-table').getElementsByTagName('tbody')[0];
  const attemptsTable = document.getElementById('attempts-table').getElementsByTagName('tbody')[0];
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('close-modal');
  const modalHeader = document.getElementById('modal-header');

  const isAdmin = window.location.pathname.includes('admin.html');

  async function fetchLeaderboard() {
    try {
      const res = await fetch('/api/leaderboard');
      const leaderboard = await res.json();
      leaderboardTable.innerHTML = '';
      leaderboard.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><a href="#" class="name-link" data-name="${entry.name}" data-year="${entry.year}">${entry.name}</a></td>
          <td>${entry.year}</td>
          <td>${entry.wpm !== undefined ? entry.wpm : 'N/A'}</td>
          ${isAdmin ? `<td><button class="delete-btn" data-name="${entry.name}" data-year="${entry.year}">Delete</button></td>` : ''}
        `;
        leaderboardTable.appendChild(row);
      });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  }

  async function fetchAttempts(name, year) {
    try {
      const res = await fetch(`/api/attempts/${name}/${year}`);
      const attempts = await res.json();
      modalHeader.textContent = `${name} - ${year}`;
      attemptsTable.innerHTML = '';
      attempts.forEach(attempt => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${attempt.wpm}</td>
          <td>${new Date(attempt.timestamp).toLocaleString()}</td>
          ${isAdmin ? `<td><button class="delete-btn" data-id="${attempt.id}">Delete</button></td>` : ''}
        `;
        attemptsTable.appendChild(row);
      });
      modal.classList.add('show');
    } catch (error) {
      console.error("Error fetching attempts:", error);
    }
  }

  async function addEntry(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const year = document.getElementById('year').value;
    const wpm = document.getElementById('wpm').value;

    try {
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, year, wpm })
      });
      await fetchLeaderboard();
      // Clear form fields after successful submission
      document.getElementById('name').value = '';
      document.getElementById('wpm').value = '';
      document.getElementById('year').selectedIndex = 0;
    } catch (error) {
      console.error("Error adding entry:", error);
    }
  }

  async function deleteEntry(name, year) {
    try {
      await fetch(`/api/leaderboard/${name}/${year}`, { method: 'DELETE' });
      await fetchLeaderboard();
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  }

  async function deleteAttempt(id) {
    try {
      await fetch(`/api/attempts/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error("Error deleting attempt:", error);
    }
  }

  // Event listener for leaderboard table
  leaderboardTable.addEventListener('click', function (e) {
    e.preventDefault();
    if (e.target.classList.contains('name-link')) {
      const name = e.target.dataset.name;
      const year = e.target.dataset.year;
      fetchAttempts(name, year);
    } else if (e.target.classList.contains('delete-btn') && isAdmin) {
      const name = e.target.dataset.name;
      const year = e.target.dataset.year;
      deleteEntry(name, year);
    }
  });

  // Event listener for attempts table in modal
  if (isAdmin) {
    attemptsTable.addEventListener('click', async function (e) {
      if (e.target.classList.contains('delete-btn')) {
        const id = e.target.dataset.id;
        await deleteAttempt(id);
        e.target.closest('tr').remove();
        await fetchLeaderboard();
      }
    });
    document.getElementById('entry-form').addEventListener('submit', addEntry);
  }

  // Close attempts modal
  closeModal.addEventListener('click', () => {
    modal.classList.remove('show');
  });

  // Close attempts modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.classList.remove('show');
    }
  });

  fetchLeaderboard();
});

// Login/Logout Management
document.addEventListener('DOMContentLoaded', async function () {
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');
  const passwordModal = document.getElementById('password-modal');
  const closePasswordModal = document.getElementById('close-password-modal');
  const passwordInput = document.getElementById('password-input');
  const submitPasswordButton = document.getElementById('submit-password');

  let correctPassword;
  try {
    const res = await fetch('/api/env');
    const data = await res.json();
    correctPassword = data.password;
  } catch (error) {
    console.error('Error fetching password:', error);
  }

  function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isAdmin') === 'true';
    if (isLoggedIn && window.location.pathname.includes('index.html')) {
      window.location.href = '/admin.html';
    } else if (!isLoggedIn && window.location.pathname.includes('admin.html')) {
      window.location.href = '/index.html';
    }
  }

  // Login functionality
  if (loginButton) {
    loginButton.addEventListener('click', () => {
      passwordModal.classList.add('show');
    });

    closePasswordModal.addEventListener('click', () => {
      passwordModal.classList.remove('show');
      passwordInput.value = '';
    });

    submitPasswordButton.addEventListener('click', () => {
      const enteredPassword = passwordInput.value;
      if (enteredPassword === correctPassword) {
        localStorage.setItem('isAdmin', 'true');
        window.location.href = '/admin.html';
      } else {
        console.log(correctPassword);
        alert("Incorrect password.");
      }
      passwordModal.classList.remove('show');
      passwordInput.value = '';
    });

    // Close password modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === passwordModal) {
        passwordModal.classList.remove('show');
        passwordInput.value = '';
      }
    });

    // Allow Enter key to submit password
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        submitPasswordButton.click();
      }
    });
  }

  // Logout functionality
  if (logoutButton) {
    logoutButton.addEventListener('click', function () {
      localStorage.removeItem('isAdmin');
      window.location.href = '/index.html';
    });
  }

  checkLoginStatus();
});