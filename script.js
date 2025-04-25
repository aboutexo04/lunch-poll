import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getDatabase, ref, push, onValue,update } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  databaseURL: "https://scrimba-aed68-default-rtdb.asia-southeast1.firebasedatabase.app/",
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const placesRef = ref(database, "places");

// Page Elements
const placeForm = document.getElementById('placeForm');
const placesList = document.getElementById('placesList');
const placeInput = document.getElementById('placeInput');
const leadingPlaceDisplay = document.getElementById('leadingPlace');

placeForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent page reload
  
    const placeName = placeInput.value.trim();
  
    if (placeName !== '') {
      // ✅ Push new place object to Firebase with initial vote count of 0
      push(placesRef, {
        name: placeName,
        votes: 1
      });
  
      placeInput.value = ''; // Clear the input field
    }
  });
  
  // ✅ 4. Real-time listener to keep places list updated
  onValue(placesRef, (snapshot) => {
    placesList.innerHTML = ''; // Clear current list
    let maxVotes = -1;
    let leadingPlace = '';
  
    snapshot.forEach((childSnapshot) => {
      const placeId = childSnapshot.key;
      const placeData = childSnapshot.val();
  
      // ✅ Create a new list item for each place
      const listItem = document.createElement('li');
      listItem.textContent = `${placeData.name} 🍴 (${placeData.votes} votes)`;
      listItem.style.cursor = 'pointer';
  
      // ✅ When user clicks the item, increment the vote
      listItem.addEventListener('click', () => {
        const updatedVotes = placeData.votes + 1;
        const placeVoteRef = ref(database, `places/${placeId}`);
        update(placeVoteRef, { votes: updatedVotes });
      });
  
      placesList.appendChild(listItem);
  
      // ✅ Track the leading place while looping
      if (placeData.votes > maxVotes) {
        maxVotes = placeData.votes;
        leadingPlace = placeData.name;
      }
    });
  
    // ✅ Update the leading place display
    leadingPlaceDisplay.textContent = leadingPlace
      ? `🏆 Current winner: ${leadingPlace} (${maxVotes} votes)`
      : 'No votes yet';
  });