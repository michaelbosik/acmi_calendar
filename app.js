function updateClock() {
  const now = new Date();

  document.getElementById("clock").textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

setInterval(updateClock, 1000);
updateClock();

async function fetchEvents() {
  const now = new Date().toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/${CONFIG.CALENDAR_ID}/events?key=${CONFIG.GOOGLE_API_KEY}&timeMin=${now}&singleEvents=true&orderBy=startTime&maxResults=100`;

  const res = await fetch(url);
  const data = await res.json();

  buildGrid(data.items);
}

function buildGrid(events) {
  const grid = document.getElementById("schedule-grid");
  grid.innerHTML = "";

  let today = new Date();

  for (let i = 0; i < 14; i++) {
    let date = new Date();

    date.setDate(today.getDate() + i);

    let dateKey = date.toISOString().split("T")[0];

    let dayEvents = events.filter((e) => {
      let start = e.start.dateTime || e.start.date;
      return start.startsWith(dateKey);
    });

    let box = document.createElement("div");
    box.className = "day-box";

    let header = document.createElement("div");
    header.className = "day-header";

    header.textContent = date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    box.appendChild(header);

    let eventsContainer = document.createElement("div");
    eventsContainer.className = "events";

    if (dayEvents.length === 0) {
      let none = document.createElement("div");
      none.className = "no-events";
      none.textContent = "No events";

      eventsContainer.appendChild(none);
    }

    dayEvents.forEach((event) => {
      let start = new Date(event.start.dateTime || event.start.date);

      let channelClass = getChannelClass(event.summary);

      let div = document.createElement("div");

      div.className = `event ${channelClass}`;

      div.innerHTML = `<span class="event-time">${start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}</span>
${event.summary}`;

      eventsContainer.appendChild(div);
    });

    box.appendChild(eventsContainer);

    grid.appendChild(box);
  }
}

fetchEvents();

setInterval(fetchEvents, 300000);

function getChannelClass(title) {
  title = title.toLowerCase();

  if (title.includes("public")) return "public";

  if (title.includes("education")) return "education";

  if (title.includes("government")) return "government";

  return "";
}
