// Wait for the DOM content to be loaded to run the onReady() function.
document.addEventListener("DOMContentLoaded", () => onReady());

// Create a new Event Source connection targeting an endpoint that will send events.
const eventSource = new EventSource("http://localhost:3000/sse");
// Set initial retries value.
let eventRetries = 0;

// function to attach listeners and other functionality after the DOM has loaded.
async function onReady() {
    // add a listener to close the connection to the event source on refresh.
    window.addEventListener("beforeunload", () => eventSource.close());

    // Get the connect button and attach a listener to it.
    const connectBtn = document.getElementById("connect-btn");
    connectBtn.addEventListener("click", () => requestEvents());
}

let eventsResult = undefined;
// Request events to be sent from the server.
async function requestEvents() {
    if(eventRetries >= 5) { eventRetries = 0; }
    if(eventsResult) { return }
    try {
        eventsResult = await fetch("http://localhost:3000/events", {method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify({"number": 10})});
        console.log("RESULT:", eventsResult);
    } catch (err) {
        console.error("Error in onReady:", err);
    }
}

eventSource.addEventListener("message", (event) => {
    const el = document.getElementById("numbers");
    const elText = el.innerText;
    el.innerText = elText + " " + event.data;
    console.log("Getting data...", event.data);
});

eventSource.onerror = (err) => {
    console.error("Error in EventSource:", err);
    // Ensure connection can only be retried so many times and not infinitely.
    eventRetries++;
    if(eventRetries >= 5) {
        console.log("Max retries exceeded.");
        eventSource.close();
    }
}
