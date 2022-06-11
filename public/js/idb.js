// offline DB
let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;

  db.createObjectStore("offline-transactions", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    uploadBudget();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["offline-transactions"], "readwrite");

  const budgetObjectStore = transaction.objectStore("offline-transactions");

  budgetObjectStore.add(record);
}

function uploadBudget() {
  const transaction = db.transaction(["offline-transactions"], "readwrite");

  const budgetObjectStore = transaction.objectStore("offline-transactions");

  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          const transaction = db.transaction(
            ["offline-transactions"],
            "readwrite"
          );

          const budgetObjectStore = transaction.objectStore(
            "offline-transactions"
          );

          budgetObjectStore.clear();

          alert("All saved budget has been submitted!");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

window.addEventListener("online", uploadBudget);
