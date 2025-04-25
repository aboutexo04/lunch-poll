import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js";

// ✅ Firebase configuration
const firebaseConfig = {
  databaseURL: "https://scrimba-aed68-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const placesRef = ref(database, "places");

// ✅ Page Elements
const placeForm = document.getElementById('placeForm');
const placesList = document.getElementById('placesList');
const placeInput = document.getElementById('placeInput');
const leadingPlaceDisplay = document.getElementById('leadingPlace');
const deletePollButton = document.getElementById('deletePollButton'); // ✅ new button
const deleteSuccessMessage = document.getElementById('deleteSuccessMessage'); // ✅ New success message element

// ✅ Add a new lunch place
placeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const placeName = placeInput.value.trim();

  if (placeName !== '') {
    push(placesRef, {
      name: placeName,
      votes: 1 // ✅ Start with 1 vote
    });
    placeInput.value = '';
  }
});

// ✅ Real-time listener for places
onValue(placesRef, (snapshot) => {
  placesList.innerHTML = '';
  let maxVotes = -1;
  let leadingPlace = '';
  let placesExist = false; // ✅ track if there are any places

  snapshot.forEach((childSnapshot) => {
    placesExist = true; // ✅ If there’s at least one child

    const placeId = childSnapshot.key;
    const placeData = childSnapshot.val();

    const listItem = document.createElement('li');
    listItem.textContent = `${placeData.name} 🍴 (${placeData.votes} votes)`;
    listItem.style.cursor = 'pointer';

    listItem.addEventListener('click', () => {
      const updatedVotes = placeData.votes + 1;
      const placeVoteRef = ref(database, `places/${placeId}`);
      update(placeVoteRef, { votes: updatedVotes });
    });

    placesList.appendChild(listItem);

    if (placeData.votes > maxVotes) {
      maxVotes = placeData.votes;
      leadingPlace = placeData.name;
    }
  });

  // ✅ Update the leading place display
  leadingPlaceDisplay.textContent = leadingPlace
    ? `🏆 Current winner: ${leadingPlace} (${maxVotes} votes)`
    : 'No votes yet';

  // ✅ Show or hide delete poll button
  if (placesExist) {
    deletePollButton.classList.remove('hidden'); // Show if any places exist
  } else {
    deletePollButton.classList.add('hidden');    // Hide if empty
  }
});

// ✅ Handle Delete Poll button
deletePollButton.addEventListener('click', () => {
    if (confirm("Are you sure you want to delete the poll? This cannot be undone.")) {
      remove(placesRef)
        .then(() => {
          console.log("✅ Poll deleted");
          placesList.innerHTML = '';
          leadingPlaceDisplay.textContent = 'No votes yet';
          deletePollButton.classList.add('hidden'); 
  
          // ✅ Show success message
          deleteSuccessMessage.classList.remove('hidden');
  
          // ✅ Hide it after 3 seconds
          setTimeout(() => {
            deleteSuccessMessage.classList.add('hidden');
          }, 3000);
        })
        .catch((error) => {
          console.error("❌ Error deleting poll:", error);
        });
    }
  });
  
