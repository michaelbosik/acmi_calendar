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

function getTagsForEvent(event) {
  const tags = [];
  if (event.organizer && event.organizer.displayName) {
    tags.push(event.organizer.displayName);
  }

  CONFIG.EVENT_TAG_KEYWORDS &&
    Object.entries(CONFIG.EVENT_TAG_KEYWORDS).forEach(([tag, keywords]) => {
      const text =
        `${event.summary || ""} ${event.description || ""}`.toLowerCase();
      if (keywords.some((kw) => text.includes(kw))) {
        tags.push(tag);
      }
    });

  return tags;
}
