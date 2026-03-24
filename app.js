/**
 *  ACMI Calendar Interface
 *  Created by Michael Bosik - 2026
 */

//Shift page by a few pixels to prevent burn
const shifts = ["shift1", "shift2", "shift3", "shift4"];
function rotateShift() {
  document.body.classList.remove(...shifts);

  const next = shifts[Math.floor(Math.random() * shifts.length)];

  document.body.classList.add(next);
}

function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString(
    "en-US",
    { hour: "numeric", minute: "numeric", hour12: true },
  );
}

async function buildHeader() {
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
      if (text.includes("thunder") || text.includes("storm"))
        return "cloud-bolt";
      if (text.includes("snow") || text.includes("flurries"))
        return "snowflake";
      if (text.includes("showers") || text.includes("heavy rain"))
        return "cloud-showers-heavy";
      if (text.includes("rain") || text.includes("drizzle")) {
        if (text.includes("sun") || text.includes("partly"))
          return isDaytime ? "cloud-sun-rain" : "cloud-moon-rain";
        return "cloud-rain";
      }
      if (
        text.includes("fog") ||
        text.includes("haze") ||
        text.includes("mist")
      )
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

  fetchWeather();
}

async function buildGrid() {
  // Get events from configured calendars
  async function fetchEvents() {
    const now = new Date();
    const sunday = getLastSunday(now).toISOString();
    let events = [];

    for (const [service, calendarID] of Object.entries(CONFIG.CALENDAR_IDS)) {
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarID)}/events?key=${CONFIG.GOOGLE_API_KEY}&timeMin=${sunday}&singleEvents=true&orderBy=startTime&maxResults=100`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.items) {
        events = events.concat(data.items);
      }
    }

    return events;
  }

  function getLastSunday(now) {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay() - 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function toISOLocal(d) {
    var z = (n) => ("0" + n).slice(-2);
    var zz = (n) => ("00" + n).slice(-3);
    var off = d.getTimezoneOffset();
    var sign = off > 0 ? "-" : "+";
    off = Math.abs(off);

    return (
      d.getFullYear() +
      "-" +
      z(d.getMonth() + 1) +
      "-" +
      z(d.getDate()) +
      "T" +
      z(d.getHours()) +
      ":" +
      z(d.getMinutes()) +
      ":" +
      z(d.getSeconds()) +
      "." +
      zz(d.getMilliseconds()) +
      sign +
      z((off / 60) | 0) +
      ":" +
      z(off % 60)
    );
  }

  // function getEventClass(title) {
  //   title = title.toLowerCase();
  //   if (title.includes("public")) return "public";
  //   if (title.includes("education")) return "education";
  //   if (title.includes("government")) return "government";
  //   return "";
  // }

  function createDayBox() {
    function appendHeader() {
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const isPast = date < new Date(now.setHours(0, 0, 0, 0));
      let header = document.createElement("div");
      header.className = "day-header";
      header.textContent += date.toLocaleDateString([], {
        // weekday: "short",
        day: "numeric",
        month: "long",
      });

      if (isToday) {
        header.textContent += "\n- Today";
        box.classList.add("today");
      }
      if (isPast) {
        box.classList.add("past");
      }

      return header;
    }

    function appendEvents() {
      function createEvent(event) {
        function getColor(calendar) {
          switch (calendar) {
            case "ACMi Members Calendar":
              return CONFIG.COLORS.green;
            case "Holidays in United States":
              return CONFIG.COLORS.purple;
            case "":
              return CONFIG.COLORS.blue;
            case "Sports":
              return CONFIG.COLORS.red;
            case "":
              return CONFIG.COLORS.yellow;
            default:
              return CONFIG.COLORS.white;
          }
        }

        let summary = document.createElement("div");
        let start = new Date(event.start.dateTime || event.start.date);

        summary.innerHTML = !event.start.dateTime
          ? `<span class="event-time">All Day</span>`
          : `<span class="event-time">${start.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}</span>`;

        if (!event.organizer || !event.summary) {
          summary.className = "event hidden";
          summary.innerHTML += "No Event Details";
          summary.style = `border-left: 6px solid gray`;
        } else {
          summary.className = `event ${event.organizer.displayName}`;
          summary.innerHTML += `${event.summary}`;
          summary.style = `border-left: 6px solid ${getColor(event.organizer.displayName)};`;
        }
        return summary;
      }

      function applyScrollAnimation(inner, overflow) {
        const duration = Math.max(overflow * 0.5, 10); // tweak multiplier

        inner.style.setProperty("--scroll-distance", `-${overflow}px`);
        inner.style.setProperty("--scroll-duration", `${duration}s`);

        inner.classList.add("events-bounce-scroll");
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

      eventsContainer.appendChild(inner);

      requestAnimationFrame(() => {
        const containerHeight = eventsContainer.clientHeight;
        const contentHeight = inner.scrollHeight;

        if (contentHeight > containerHeight) {
          const overflow = contentHeight - containerHeight;
          applyScrollAnimation(inner, overflow);
        }
      });

      return eventsContainer;
    }

    let box = document.createElement("div");
    box.className = "day-box";
    box.appendChild(appendHeader());
    box.appendChild(appendEvents());
    grid.appendChild(box);
  }

  const events = await fetchEvents();

  const grid = document.getElementById("schedule-grid");
  grid.innerHTML = "";

  let date = new Date();
  let dateKey = toISOLocal(date).split("T")[0];
  let dayEvents = events.filter((e) => {
    let start = e.start.dateTime || e.start.date;
    return start.startsWith(dateKey);
  });
  const sunday = getLastSunday(date);

  for (let i = 0; i < TOTAL_DAYS; i++) {
    date = new Date(sunday);
    date.setDate(sunday.getDate() + i);

    dateKey = toISOLocal(date).split("T")[0];

    dayEvents = events.filter((e) => {
      let start = e.start.dateTime || e.start.date;
      return start.startsWith(dateKey);
    });

    createDayBox();
  }
}

function buildWidget() {
  async function fetchUpcoming() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.EVENTS_SHEET_ID}/values/${CONFIG.EVENTS_SHEET_RANGE}?key=${CONFIG.GOOGLE_API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    return data.values.map((row) => ({
      title: row[0],
      date: row[1],
      description: row[2],
      roles: row[3],
      show: row[4],
    }));
  }

  function renderUpcoming(items) {
    const container = document.getElementById("upcoming");
    container.innerHTML = "<h3>Member Opportunities</h3>";

    const crewCallsContainer = document.createElement("div");
    crewCallsContainer.className = "events";

    const inner = document.createElement("div");
    inner.className = "events-inner";

    items.forEach((item) => {
      const div = document.createElement("div");
      div.className = `upcoming-item`;

      if (item.show == "Yes") {
        div.innerHTML = `
      <div class="title">${item.title} • ${item.date}</div>
      <div class="desc">${item.description}</div>
      <div class="meta">${item.roles}</div>
    `;

        inner.appendChild(div);
      }
    });

    if (inner.children.length > 5) {
      inner.classList += " events-scroll";
    }

    crewCallsContainer.appendChild(inner);

    const signUp = document.createElement("div");
    signUp.className = "sign-up";

    signUp.innerHTML += `<h3>Sign up Here</h3>
    <img src="assets/crewcalls_qr.png" class="qr-code">`;

    container.appendChild(crewCallsContainer);
    container.appendChild(signUp);
  }

  fetchUpcoming().then((upcoming) => {
    renderUpcoming(upcoming);
  });
}

function buildTicker() {
  async function fetchWordOfDaySheets() {
    function pickWord(words) {
      const valid = words.filter((w) => w.show === "Yes");
      return valid[Math.floor(Math.random() * valid.length)].word;
      // valid.sort((a, b) => {
      //   return new Date(a.last_used || 0) - new Date(b.last_used || 0);
      // });

      // return valid[0];
    }

    // function markWordUsed(word) {
    //   const sheet =
    //     SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Words");
    //   const data = sheet.getDataRange().getValues();

    //   for (let i = 1; i < data.length; i++) {
    //     if (data[i][0] === word) {
    //       sheet.getRange(i + 1, 4).setValue(new Date()); // LastUsed column
    //       break;
    //     }
    //   }
    // }

    async function suggestNewWords(baseWord) {
      const res = await fetch(
        `https://api.wordnik.com/v4/word.json/${baseWord}/relatedWords?api_key=${CONFIG.WORDNIK}`,
      );
      const data = await res.json();

      return data.flatMap((d) => d.words).filter((w) => w.length < 20); // basic filter
    }

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.EVENTS_SHEET_ID}/values/${CONFIG.WORDS_SHEET_RANGE}?key=${CONFIG.GOOGLE_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      const words = data.values.map((row) => ({
        word: row[0],
        show: row[1],
        last_used: row[2],
      }));

      // const word = pickWord(words);
      // try {
      //   markWordUsed(word);
      //   suggestNewWords(word);
      // } catch (err) {
      //   console.log("Google Sheets API failed", err);
      // }

      try {
        const response = await fetch(
          `https://api.wordnik.com/v4/word.json/${pickWord(words)}/definitions?limit=50&includeRelated=false&useCanonical=false&includeTags=false&api_key=${CONFIG.WORDNIK}`,
        );
        const data = await response.json();
        const word = data[Math.floor(Math.random() * data.length)];
        const definition = word.text || "";

        document.getElementById("wordoftheday").textContent =
          `Word of the Day -- ${word.word} - ${definition} --`;
      } catch (err) {
        console.log("Wordnik API failed", err);
      }
    } catch (err) {
      console.log("Google Sheets API failed", err);
    }
  }

  async function fetchWordOfDayWordnik() {
    try {
      const response = await fetch(
        `https://api.wordnik.com/v4/words.json/wordOfTheDay?api_key=${CONFIG.WORDNIK}`,
      );

      const data = await response.json();

      const word = data.word;
      const definition = data.definitions?.[0]?.text || "";

      document.getElementById("wordoftheday").textContent =
        `Word of the Day -- ${word} - ${definition} --`;
    } catch (err) {
      console.log("Word API failed", err);
    }
  }

  async function didYouKnow() {
    const icons = {
      tip: "🎬 ",
      fact: "📺 ",
      history: "🎥 ",
    };
    const today = new Date();
    // const index = today.getDate() % CONTENT.length;
    const index = Math.floor(Math.random() * CONTENT.length);

    document.getElementById("did-you-know").textContent =
      `${icons[CONTENT[index].type]} Did you know? -- ${CONTENT[index].text} --`;
  }

  function setTickerSpeed() {
    const ticker = document.getElementById("ticker-track");
    const speed =
      (window.innerWidth / (ticker.children.item(0).children.length * 40)) * 10;
    ticker.style.animation = `tickerScroll ${speed}s linear infinite`;
  }

  didYouKnow();
  const ticker_content = document.getElementById("ticker-content");
  ticker_content.parentElement.appendChild(ticker_content.cloneNode(true));

  setTickerSpeed();
}

function buildPage() {
  buildHeader();
  buildGrid();
  buildWidget();
  buildTicker();
}

const TOTAL_DAYS = 28;

buildPage();
setInterval(buildPage, 60000 * 30);

updateClock();
setInterval(updateClock, 1000);

setInterval(rotateShift, 10 * 60000);

//Reload page every hour
// window.setTimeout(function () {
//   window.location.reload();
// }, 60 * 60000);
