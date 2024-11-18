// Wait for the DOM content to be loaded to run the onReady() function.
document.addEventListener("DOMContentLoaded", () => onReady());

// Set initial retries value.
let eventRetries = 0;

// Create a new Event Source connection targeting an endpoint that will send events.
function createEventSource() {
    const eventSource = new EventSource("http://localhost:3000/sse");
    // add a listener to close the connection to the event source on refresh.
    window.addEventListener("beforeunload", () => eventSource.close());

    eventSource.addEventListener("eventWord", (event) => {
        const el = document.getElementById("words");
        const elText = el.innerText;
        el.innerText = elText + " " + event.data;
        console.log("Getting eventWord data...", event.data);
    });
    
    // eventSource.addEventListener("message", (event) => {
    //     // console.log("Getting data...", event.data);
    // });
    
    eventSource.onopen = () => {
        console.log("Connection Open");
        disableButtons(false);
        updateConnectionStatus("Open");
    }
    
    eventSource.onerror = (err) => {
        console.error("Error in EventSource:", err);
        // Ensure connection can only be retried so many times and not infinitely.
        eventRetries++;
        disableButtons(true);
        updateConnectionStatus("Connecting");
        if(eventRetries >= 5) {
            console.log("Max retries exceeded.");
            eventSource.close();
            updateConnectionStatus("Closed");
            const retryBtn = document.getElementById("connect-retry");
            retryBtn.disabled = false;
        }
    }
    return eventSource;
}
// Establish a new event source connection.
let eventSource = createEventSource();

// function to attach listeners and other functionality after the DOM has loaded.
async function onReady() {
    // Get the connect button and attach a listener to it.
    const connectBtn = document.getElementById("connect-btn");
    connectBtn.addEventListener("click", () => requestEvents());

    const resetBtn = document.getElementById("connect-reset");
    resetBtn.addEventListener("click", () => resetWordEvents());

    const retryBtn = document.getElementById("connect-retry");
    retryBtn.addEventListener("click", () => retryConnection());
    retryBtn.disabled = true;

    updateConnectionStatus("Connecting");
}

let eventsResult = undefined;
// Request events to be sent from the server.
async function requestEvents() {
    if(eventsResult) { return }
    try {
        eventsResult = await fetch("http://localhost:3000/message", {method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify({"message": "Lorem ipsum dolor sit amet, consectetur adipiscing elit."})});
        console.log("RESULT:", eventsResult);
    } catch (err) {
        console.error("Error in onReady:", err);
    }
}

function retryConnection() {
    eventRetries = 0;
    // Close previous event source connection.
    eventSource.close();
    // Establish new event source connection.
    eventSource = createEventSource(), eventsResult = undefined;
}

function disableButtons(bool) {
    const connectBtn = document.getElementById("connect-btn");
    const resetBtn = document.getElementById("connect-reset");
    connectBtn.disabled = bool;
    resetBtn.disabled = bool;
}

function resetWordEvents() {
    const el = document.getElementById("words");
    // reset elements text and eventsResult.
    el.innerText = "", eventsResult = undefined;
}

function updateConnectionStatus(status) {
    const el = document.getElementById("connect-info");
    if(el.innerText.includes(status)) { return }
    el.innerText = "Connection Status: " + status;
}
