function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString(
    "en-US",
    { hour: "numeric", minute: "numeric", hour12: true },
  );
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

  for (let i = 0; i < 15; i++) {
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

      div.innerHTML = `<span class="event-time">${start.toLocaleTimeString(
        "en-US",
        { hour: "numeric", minute: "numeric", hour12: true },
      )}</span>
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

// WEATHER
async function fetchWeather() {
  // const url = `https://api.openweathermap.org/data/2.5/weather?q=${CONFIG.CITY}&units=imperial&appid=${CONFIG.WEATHER_API_KEY}`;
  const url = "https://api.weather.gov/gridpoints/BOX/67,92/forecast/hourly";
  const response = await fetch(url);
  const data = await response.json();

  let current_weather = data.properties.periods[0];

  document.getElementById("weather-temp").textContent =
    `${Math.round(current_weather.temperature)}°F`;

  // document.getElementById("weather-icon").textContent =
  //   current_weather;
}

fetchWeather();
setInterval(fetchWeather, 600000); // refresh every 10 mins

const shifts = ["shift1", "shift2", "shift3", "shift4"];

function rotateShift() {
  document.body.classList.remove(...shifts);

  const next = shifts[Math.floor(Math.random() * shifts.length)];

  document.body.classList.add(next);
}

setInterval(rotateShift, 300000); // every 5 minutes

window.setTimeout(function () {
  window.location.reload();
}, 60 * 60000);
