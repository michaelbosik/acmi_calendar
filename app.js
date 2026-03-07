/**
 *  ACMI Calendar Interface
 *  Created by Michael Bosik - 2026
 */

function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString(
    "en-US",
    { hour: "numeric", minute: "numeric", hour12: true },
  );
}

// Get events from configured calendars
async function fetchEvents() {
  const now = new Date().toISOString();
  let allResults = [];

  for (const [service, calendarID] of Object.entries(CONFIG.CALENDAR_IDS)) {
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarID)}/events?key=${CONFIG.GOOGLE_API_KEY}&timeMin=${now}&singleEvents=true&orderBy=startTime&maxResults=100`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.items) {
      allResults = allResults.concat(data.items);
    }
  }

  buildGrid(allResults);
}

// Use weather.gov API to determine weather, set temp and icon
async function fetchWeather() {
  const url = "https://api.weather.gov/gridpoints/BOX/67,92/forecast/hourly";
  const response = await fetch(url);
  const data = await response.json();

  function getWeatherIcon(current_weather) {
    function parseWindSpeed(speedString) {
      const match = speedString.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    }
    const isDaytime = current_weather.isDaytime;
    const windSpeed = parseWindSpeed(current_weather.windSpeed);
    const text = current_weather.shortForecast.toLowerCase();

    if (windSpeed >= 40) return "hurricane";
    if (text.includes("thunder") || text.includes("storm")) return "cloud-bolt";
    if (text.includes("snow") || text.includes("flurries")) return "snowflake";
    if (text.includes("showers") || text.includes("heavy rain"))
      return "cloud-showers-heavy";
    if (text.includes("rain") || text.includes("drizzle")) {
      if (text.includes("sun") || text.includes("partly"))
        return isDaytime ? "cloud-sun-rain" : "cloud-moon-rain";
      return "cloud-rain";
    }
    if (text.includes("fog") || text.includes("haze") || text.includes("mist"))
      return "smog";
    if (windSpeed >= 20) return "wind";
    if (text.includes("partly")) {
      return isDaytime ? "cloud-sun" : "cloud-moon";
    }
    if (text.includes("cloud")) return "cloud";
    if (
      text.includes("clear") ||
      text.includes("sunny") ||
      text.includes("mostly sunny")
    ) {
      return isDaytime ? "sun" : "moon";
    }
    return isDaytime ? "sun" : "moon";
  }

  let current_weather = data.properties.periods[0];
  let icon = getWeatherIcon(current_weather);

  document.getElementById("weather-temp").textContent =
    `${Math.round(current_weather.temperature)}°F`;

  document.getElementById("weather-icon").innerHTML =
    `<i class="fa-solid fa-${icon}"></i>`;
}

function buildGrid(events) {
  function getEventClass(title) {
    title = title.toLowerCase();

    if (title.includes("public")) return "public";
    if (title.includes("education")) return "education";
    if (title.includes("government")) return "government";
    return "";
  }

  function createDayBox(grid, date, dayEvents) {
    function appendHeader(date) {
      let header = document.createElement("div");
      header.className = "day-header";

      /** TODO - Format dayBox header so date doesnt wrap inconsistently */
      if (isToday) {
        header.textContent += "Today - ";
        box.classList.add("today");
      }
      header.textContent += date.toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      return header;
    }

    function appendEvents(dayEvents) {
      function createEvent(event) {
        let start = new Date(event.start.dateTime || event.start.date);

        let div = document.createElement("div");
        div.className = `event ${getEventClass(event.summary)}`;
        div.innerHTML = !event.start.dateTime
          ? `<span class="event-time">All Day</span>${event.summary}`
          : `<span class="event-time">${start.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}</span>
${event.summary}`;
        return div;
      }

      const eventsContainer = document.createElement("div");
      eventsContainer.className = "events";

      const inner = document.createElement("div");
      inner.className = "events-inner";

      if (dayEvents.length === 0) {
        let none = document.createElement("div");
        none.className = "no-events";
        none.textContent = "No events";

        inner.appendChild(none);
      }

      dayEvents.forEach((event) => {
        inner.appendChild(createEvent(event));
      });

      /** TODO - Scrolling animation for days with a lot of events */
      // const speed = Math.max(dayEvents.length * 4, 12);
      // inner.style.animationDuration = speed + "s";
      // if (dayEvents.length <= 2) {
      //   inner.style.animation = "none";
      // }

      eventsContainer.appendChild(inner);

      return eventsContainer;
    }

    let isToday = date.toDateString() === new Date().toDateString();
    let box = document.createElement("div");
    box.className = "day-box";
    box.appendChild(appendHeader(date));
    box.appendChild(appendEvents(dayEvents));
    grid.appendChild(box);
  }

  const grid = document.getElementById("schedule-grid");
  grid.innerHTML = "";

  let today = new Date();

  const TOTAL_DAYS = 15;
  for (let i = 0; i < TOTAL_DAYS; i++) {
    let date = new Date();
    if (i !== 0) {
      date.setDate(today.getDate() + i);
    }

    let dateKey = date.toISOString().split("T")[0];

    let dayEvents = events.filter((e) => {
      let start = e.start.dateTime || e.start.date;
      return start.startsWith(dateKey);
    });

    createDayBox(grid, date, dayEvents);
  }
}

//Shift page by a few pixels to prevent burn
const shifts = ["shift1", "shift2", "shift3", "shift4"];
function rotateShift() {
  document.body.classList.remove(...shifts);

  const next = shifts[Math.floor(Math.random() * shifts.length)];

  document.body.classList.add(next);
}

updateClock();
fetchEvents();
fetchWeather();

setInterval(updateClock, 1000);
setInterval(fetchEvents, 300000);
setInterval(fetchWeather, 600000);
setInterval(rotateShift, 300000);

//Reload page every hour
window.setTimeout(function () {
  window.location.reload();
}, 60 * 60000);
