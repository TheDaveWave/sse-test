document.addEventListener("DOMContentLoaded", () => onReady());
const eventSource = new EventSource("http://localhost:3000/sse");

async function onReady() {
    window.addEventListener("beforeunload", () => {eventSource.close();});
    try {
        const result = await fetch("http://localhost:3000/events", {method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify({"number": 10})});
        console.log("RESULT:", result);
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
}

