/* =========================================================
   CASTUS TV SCHEDULE
========================================================= */

const API_URL = "https://api.castus.tv/ccs/v1/schedule/acmi/";
const CHANNELS = [{
        id: "ch1",
        name: "Public",
        icon: "https://acmi.tv/wp-content/uploads/2021/10/tv_icon.png",
        channels: [{
                provider: "Comcast",
                channel: "8",
            },
            {
                provider: "RCN",
                channel: "29",
            },
            {
                provider: "RCN (HD)",
                channel: "629",
            },
            {
                provider: "Verizon",
                channel: "31",
            },
        ],
        embed: `
        <iframe
            src="https://cloud.castus.tv/vod/acmi/embed/672a4a4c4305ae377e9ef892?page=HOME&type=live&embedID=672a4a4c4305ae377e9ef892&autoplay=1&muted=1"
            title="CASTUS Embedded Video Player"
            id="castus-embed"
            allow="autoplay; fullscreen; muted"
            allowtransparency="true"
            frameborder="0"
            sandbox="allow-same-origin allow-forms allow-scripts"
            scrolling="auto"
            allowfullscreen
            style="border:none;border-radius:4px;"
        ></iframe>`
    },
    {
        id: "ch2",
        name: "Education",
        icon: "https://acmi.tv/wp-content/uploads/2021/10/bookicon.png",
        channels: [{
                provider: "Comcast",
                channel: "9",
            },
            {
                provider: "RCN",
                channel: "13",
            },
            {
                provider: "RCN (HD)",
                channel: "613",
            },
            {
                provider: "Verizon",
                channel: "24",
            },
        ],
        embed: `
        <iframe
          src="https://cloud.castus.tv/vod/acmi/embed/672a4a7b4305ae377e9ef89a?page=HOME&type=live&embedID=672a4a7b4305ae377e9ef89a&autoplay=1&muted=1"
          title="CASTUS Embedded Video Player"
          id="castus-embed"
          allow="autoplay; fullscreen"
          allowtransparency="true"
          frameborder="0"
          sandbox="allow-same-origin allow-forms allow-scripts"
          scrolling="auto"
          allowfullscreen
          style="border:none;border-radius:4px;"
        ></iframe>`
    },
    {
        id: "ch3",
        name: "Government",
        icon: "https://acmi.tv/wp-content/uploads/2021/10/icon_government.png",
        channels: [{
                provider: "Comcast",
                channel: "22",
            },
            {
                provider: "RCN",
                channel: "15",
            },
            {
                provider: "RCN (HD)",
                channel: "614",
            },
            {
                provider: "Verizon",
                channel: "26",
            },
        ],
        embed: `
        <iframe
          src="https://cloud.castus.tv/vod/acmi/embed/672a4a9a4305ae377e9ef8a5?page=HOME&type=live&embedID=672a4a9a4305ae377e9ef8a5&autoplay=1&muted=1"
          title="CASTUS Embedded Video Player"
          id="castus-embed"
          allow="autoplay; fullscreen"
          allowtransparency="true"
          frameborder="0"
          sandbox="allow-same-origin allow-forms allow-scripts"
          scrolling="auto"
          allowfullscreen
          style="border:none;border-radius:4px;"
        ></iframe>`
    },
];

const SLOT_WIDTH = 80;
const WINDOW_SECONDS = 12 * 60 * 60; // 6 Hours
const MINUTES_PER_SLOT = 30;
const PIXELS_PER_MINUTE = SLOT_WIDTH / MINUTES_PER_SLOT;

const TV_GRID = document.getElementById("tvScheduleGrid");

let selectedDate = new Date();

function getTimelineWidth() {
    return (WINDOW_SECONDS / 60) * PIXELS_PER_MINUTE;
}

async function loadSchedule(date) {
    try {
        const responses = await Promise.all(
            CHANNELS.map(async (channel) => {
                const response = await fetch(`${API_URL}${channel.id}`);
                const data = await response.json();

                return {
                    channel,
                    items: data.items || [],
                };
            })
        );

        scheduleData = responses;

        renderGrid(responses, date);
        renderEmbed(CHANNELS[0]);
    } catch (error) {
        console.error(error);
    }
}

function renderGrid(CASTUS_DATA, date) {
    TV_GRID.innerHTML = `
      <div class="static-container" id="staticContainer"></div>
      <div class="scroll-container" id="scrollContainer"></div>
    `;

    const now = new Date();
    const timelineStart = new Date(date);

    if (date.toISOString().split("T")[0] === now.toISOString().split("T")[0]) {
        timelineStart.setHours(now.getHours());
        timelineStart.setMinutes(Math.floor(now.getMinutes() / 30) * 30);
    } else {
        timelineStart.setHours(0);
        timelineStart.setMinutes(0);
    }

    const timelineStartUnix = Math.floor(timelineStart.getTime() / 1000);
    const timelineEndUnix = timelineStartUnix + WINDOW_SECONDS;

    const staticContainer = document.getElementById("staticContainer");
    const scrollContainer = document.getElementById("scrollContainer");
    staticContainer.appendChild(createDateSelect(date));
    scrollContainer.appendChild(createTimeline(timelineStart));

    const channelHeaderWrapper = document.createElement("div");
    channelHeaderWrapper.className = "channel-header-wrapper";

    const channelContentWrapper = document.createElement("div");
    channelContentWrapper.className = "channel-content-wrapper";

    CASTUS_DATA.forEach((channel) => {
        channelHeaderWrapper.appendChild(createChannelHeader(channel.channel));

        channelContentWrapper.appendChild(
            createChannelContent(
                channel.channel,
                channel.items,
                timelineStartUnix,
                timelineEndUnix,
            ),
        );
    });

    staticContainer.appendChild(channelHeaderWrapper);
    scrollContainer.appendChild(channelContentWrapper);
}

function createChannelHeader(channelData) {
    const channelHeader = document.createElement("div");
    channelHeader.className = `channel-header ${channelData.name.toLowerCase()}`;

    const icon = document.createElement("span");
    icon.className = `channel-icon ${channelData.name.toLowerCase()}`;
    icon.innerHTML = `<img src=${channelData.icon} alt="${channelData.name} icon" />`;
    channelHeader.appendChild(icon);

    const label = document.createElement("span");
    label.className = `channel-label ${channelData.name.toLowerCase()}`;
    label.textContent = channelData.name.toUpperCase();
    channelHeader.appendChild(label);

    const channelInfo = document.createElement("span");
    channelInfo.className = `channel-info ${channelData.name.toLowerCase()}`;
    channelData.channels.forEach((provider) => {
        channelInfo.innerHTML += `
        <div class="channel-info-item">
          <span class="channel-info-label">${provider.provider}:</span>
          <span class="channel-info-value">CH. ${provider.channel}</span>
        </div>
      `;
    });
    // channelHeader.appendChild(channelInfo);

    const watchButton = document.createElement("div");
    watchButton.className = `watch-button ${channelData.name.toLowerCase()}`;
    watchButton.addEventListener("click", () => {
        renderEmbed(channelData);
    });
    watchButton.textContent = "Watch";
    // channelHeader.appendChild(watchButton);

    return channelHeader;
}

function createChannelContent(
    channelData,
    items,
    timelineStartUnix,
    timelineEndUnix,
) {
    const content = document.createElement("div");

    content.className =
        `channel-content ${channelData.name.toLowerCase()} ${channelData.name.toLowerCase()}-content`;

    content.style.width = `${getTimelineWidth()}px`;

    const segments = [];

    for (const item of items) {

        const start = item.start_unix.unix;
        const end = item.end_unix.unix;

        // Ignore anything outside our timeline
        if (end <= timelineStartUnix || start >= timelineEndUnix) {
            continue;
        }

        // Clip to visible timeline
        const clippedStart = Math.max(start, timelineStartUnix);
        const clippedEnd = Math.min(end, timelineEndUnix);

        if (clippedEnd <= clippedStart) {
            continue;
        }

        const nowUnix = Math.floor(Date.now() / 1000);

        let title = item.announce ?
            item.metadata?.title || item.name || "Community Bulletin Board" :
            "Community Bulletin Board";

        if (title.includes(".mp4")) {
            title = title.split("/").pop().split(".mp4")[0];
        }

        segments.push({
            scheduled: item.announce,
            title,
            description: item.metadata?.description || "",
            program: item.metadata?.program || "",

            start,
            end,

            displayStart: clippedStart,
            displayEnd: clippedEnd,

            isLive: start <= nowUnix && end > nowUnix,
            isToday: end >= timelineStartUnix && start <= timelineEndUnix
        });
    }

    /*
     * Merge very short segments BEFORE calculating their
     * pixel positions.
     */
    for (let i = segments.length - 1; i > 0; i--) {

        const current = segments[i];

        if (
            current.end - current.start <= 5 * 60
        ) {
            segments[i - 1].end = current.end;
            segments.splice(i, 1);
        }
    }

    /*
     * Now calculate positions from the final segment times.
     */
    segments.forEach((seg) => {

        const clippedStart =
            Math.max(seg.start, timelineStartUnix);

        const clippedEnd =
            Math.min(seg.end, timelineEndUnix);

        if (clippedEnd <= clippedStart) {
            return;
        }

        const left =
            ((clippedStart - timelineStartUnix) / 60) *
            PIXELS_PER_MINUTE;

        const width =
            ((clippedEnd - clippedStart) / 60) *
            PIXELS_PER_MINUTE;

        const block = document.createElement("div");

        block.className =
            `program-block ${seg.isLive && seg.scheduled ? "live" : ""}`;

        block.style.left = `${left}px`;
        block.style.width = `${width}px`;

        const startDate = new Date(seg.start * 1000);

        block.innerHTML = `
            <div class="program-title">
                ${seg.title}
            </div>

            <div class="program-time">
                ${startDate.toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true
                })}
            </div>
        `;

        content.appendChild(block);
    });

    return content;
}

function createDateSelect(selectedDate) {
    const dateSelect = document.createElement("select");

    dateSelect.id = "dateSelect";
    dateSelect.className = "date-select date top-row";

    const today = new Date();

    // Normalize today to midnight
    today.setHours(0, 0, 0, 0);

    // Use the supplied date, or today
    const currentSelectedDate = selectedDate ?
        new Date(selectedDate) :
        new Date(today);

    currentSelectedDate.setHours(0, 0, 0, 0);

    // Sunday = 0, Monday = 1, ..., Saturday = 6
    const daysUntilSaturday = 6 - today.getDay();

    // Create options from today through Saturday
    for (let i = 0; i <= daysUntilSaturday; i++) {

        const date = new Date(today);

        date.setDate(today.getDate() + i);

        // YYYY-MM-DD
        const value = date.toISOString().split("T")[0];

        const option = document.createElement("option");

        option.value = value;

        option.textContent = date.toLocaleDateString([], {
            weekday: "long",
            month: "long",
            day: "numeric",
        });

        dateSelect.appendChild(option);
    }

    // Set the currently selected date
    const selectedValue =
        currentSelectedDate.toISOString().split("T")[0];

    dateSelect.value = selectedValue;

    dateSelect.addEventListener("change", () => {

        const [year, month, day] =
        dateSelect.value.split("-").map(Number);

        const newSelectedDate =
            new Date(year, month - 1, day);

        selectedDate = newSelectedDate;

        loadSchedule(newSelectedDate);
    });

    return dateSelect;
}

function createTimeline(timelineStart) {
    const totalSlots = WINDOW_SECONDS / (MINUTES_PER_SLOT * 60);
    const airTimes = document.createElement("div");
    airTimes.className = "air-times top-row";
    airTimes.style.width = `${getTimelineWidth()}px`;
    airTimes.innerHTML = "";

    for (let hour = 0; hour < totalSlots; hour++) {
        const time = new Date(timelineStart);
        time.setMinutes(timelineStart.getMinutes() + hour * MINUTES_PER_SLOT);

        const timeDiv = document.createElement("div");
        timeDiv.className = "time-slot";
        timeDiv.style.left = `${hour * SLOT_WIDTH}px`;
        timeDiv.style.width = `${SLOT_WIDTH}px`;

        timeDiv.innerHTML = `
      <div class="time-label">
        ${time.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        })}
      </div>
    `;
        airTimes.appendChild(timeDiv);
    }

    return airTimes;
}

const FIVE_MINUTES = 5 * 60;

function roundToNearest5(unixTime) {
    return Math.round(unixTime / FIVE_MINUTES) * FIVE_MINUTES;
}

function floorTo5(unixTime) {
    return Math.floor(unixTime / FIVE_MINUTES) * FIVE_MINUTES;
}

function ceilTo5(unixTime) {
    return Math.ceil(unixTime / FIVE_MINUTES) * FIVE_MINUTES;
}

function renderEmbed(channelData) {

    const embedContainer =
        document.getElementById("embedContainer");

    embedContainer.innerHTML = channelData.embed;

    updateCurrentlyWatching(channelData);
}

function updateCurrentlyWatching(channelData) {

    const nowUnix = Math.floor(Date.now() / 1000);

    // Find the currently airing item
    const currentItem = scheduleData
        ?.find(channel => channel.channel.id === channelData.id)
        ?.items
        ?.find(item =>
            item.start_unix.unix <= nowUnix &&
            item.end_unix.unix > nowUnix
        );

    // document.getElementById("currentlyChannel").textContent =
    //     channelData.name.toUpperCase();

    if (!currentItem) {

        document.getElementById("currentlyTitle").textContent =
            "No program currently airing";

        // document.getElementById("currentlyDescription").textContent =
        //     "";

        // document.getElementById("currentlyTime").textContent =
        //     "";

        return;
    }

    const title = currentItem.announce ?
        currentItem.metadata?.title ||
        currentItem.name ||
        "Community Bulletin Board" :
        "Community Bulletin Board";

    document.getElementById("currentlyTitle").textContent =
        title;

    // document.getElementById("currentlyDescription").textContent =
    //     currentItem.metadata?.description || "";

    const start = new Date(currentItem.start_unix.unix * 1000);
    const end = new Date(currentItem.end_unix.unix * 1000);

    // document.getElementById("currentlyTime").textContent =
    //     `${start.toLocaleTimeString([], {
    //         hour: "numeric",
    //         minute: "2-digit"
    //     })} – ${end.toLocaleTimeString([], {
    //         hour: "numeric",
    //         minute: "2-digit"
    //     })}`;
}

/* =========================================================
   ACMI COMMUNITY CALENDAR
========================================================= */

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

function getLastSunday(now) {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay() - 7);
    d.setHours(0, 0, 0, 0);
    return d;
}

function updateClock() {
    const now = new Date();
    document.getElementById("clock").textContent = now.toLocaleTimeString(
        "en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true
        },
    );
}

// Get events from configured calendars
async function fetchEvents() {
    const now = new Date();
    const sunday = getLastSunday(now).toISOString();
    let events = [];

    for (const [service, calendarID] of Object.entries(CONFIG.CALENDAR_IDS)) {
        const url =
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarID)}/events?key=${CONFIG.GOOGLE_API_KEY}&timeMin=${sunday}&singleEvents=true&orderBy=startTime&maxResults=100`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.items) {
            events = events.concat(data.items);
        }
    }

    return events;
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

async function buildGrid(events) {
    function createDayBox(events_info) {
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
            function applyScrollAnimation(inner, overflow) {
                const duration = Math.max(overflow * 0.5, 10); // tweak multiplier

                inner.style.setProperty("--scroll-distance", `-${overflow}px`);
                inner.style.setProperty("--scroll-duration", `${duration}s`);

                inner.classList.add("events-bounce-scroll");
            }

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

                summary.innerHTML = !event.start.dateTime ?
                    `<span class="event-time">All Day</span>` :
                    `<span class="event-time">${start.toLocaleTimeString("en-US", {
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

            const eventsContainer = document.createElement("div");
            eventsContainer.className = "events";

            const inner = document.createElement("div");
            inner.className = "events-inner";

            if (events_info.length === 0) {
                let none = document.createElement("div");
                none.className = "no-events";
                // none.textContent = "No events";
                none.textContent = "";

                inner.appendChild(none);
            } else {
                events_info.forEach((event) => {
                    inner.appendChild(createEvent(event));
                });
            }

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
        box.id = `box-${dateKey}`;
        box.appendChild(appendHeader());
        box.appendChild(appendEvents());
        grid.appendChild(box);
    }

    function handleTags(event, dateKey) {
        const div = document.createElement("div");
        const desc = event.description || "";

        if (dateKey >= date.toISOString().split("T")[0]) {
            CONFIG.EVENT_TAG_KEYWORDS.MEMBERS_NEEDED.forEach((keyword) => {
                if (div.innerHTML) return;
                if (desc.toLowerCase().includes(keyword)) {
                    // const div = document.createElement("div");
                    div.className = `upcoming-item`;

                    div.innerHTML = `
      <div class="title">${event.summary}</div> 
      <span class="event-date">${dateKey}</span>
    `;
                }
            });
        }

        return div;
    }

    const upcoming_events = document.getElementById("upcoming");
    upcoming_events.innerHTML = `<h3>Member Opportunities</h3>`;

    const inner = document.createElement("div");
    inner.className = "events-inner";

    const events_info = {};
    let date = new Date();

    events.forEach((e) => {
        const dateKey = (e.start.dateTime || e.start.date).split("T")[0];

        const tagElement = handleTags(e, dateKey);
        if (tagElement) {
            inner.appendChild(tagElement);
        }

        events_info[dateKey] = events_info[dateKey] || [];
        events_info[dateKey].push(e);
    });

    const grid = document.getElementById("calendar-grid");
    grid.innerHTML = "";

    for (let i = 0; i < TOTAL_DAYS; i++) {
        date = new Date(getLastSunday(new Date()));
        date.setDate(date.getDate() + i);

        dateKey = toISOLocal(date).split("T")[0];

        createDayBox(events_info[dateKey] || []);
    }

    const qr = document.createElement("div");
    qr.classList.add("sign-up");
    qr.innerHTML = `<h3>Sign up Here</h3>
            <img src="assets/crewcalls_qr.png" class="qr-code">`;

    upcoming_events.appendChild(inner);
    // upcoming_events.appendChild(qr);
}

function buildTicker() {
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

    const ticker_content = document.getElementById("ticker-content");
    if (ticker_content.parentElement.childNodes.length > 3) {
        ticker_content.parentElement.lastElementChild.remove();
    }
    didYouKnow();
    ticker_content.parentElement.appendChild(ticker_content.cloneNode(true));
    setTickerSpeed();
}

async function buildPage() {
    try {
        const events = await fetchEvents();
        buildHeader();
        buildGrid(events);
        buildTicker();
    } catch (err) {
        console.log("Failed to fetch events", err);
        const events = [];
        sleep(1000);
        buildPage();
    }
}

const TOTAL_DAYS = 28;

buildPage();
setInterval(buildPage, 60000 * 30);

updateClock();
setInterval(updateClock, 1000);

setInterval(rotateShift, 10 * 60000);

loadSchedule(selectedDate);
setInterval(() => loadSchedule(selectedDate), 30 * 60000);

// Update the currently-watching information,
// but don't recreate the iframe.
setInterval(() => {
    updateCurrentlyWatching(CHANNELS[0]);
}, 10000);

//Reload page every hour
// window.setTimeout(function () {
//   window.location.reload();
// }, 60 * 60000);