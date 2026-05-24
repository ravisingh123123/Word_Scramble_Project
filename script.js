const wordText = document.querySelector(".word"),
    hintText = document.querySelector(".hint span"),
    timeText = document.querySelector(".time b"),
    inputField = document.querySelector("input"),
    refreshBtn = document.querySelector(".refresh-word"),
    checkBtn = document.querySelector(".check-word");

let correctWord, timer;

// --- TMDB API KEY (will be public in frontend) ---
const TMDB_API_KEY = "a2689269eb9a72623b7e6125d8030700";

// Get a random page number (TMDB has 50 pages of popular movies)
const getRandomPage = () => Math.floor(Math.random() * 50) + 1;

// Fetch a random single-word movie from TMDB
const fetchRandomMovie = async () => {
    const page = getRandomPage();
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const movies = data.results;

    // Filter single-word alphabetic titles only
    const singleWordTitles = movies.filter(movie => {
        const title = movie.title.trim();
        return title.split(" ").length === 1 && /^[a-zA-Z]+$/.test(title);
    });

    if (singleWordTitles.length === 0) return null;

    const randomMovie = singleWordTitles[Math.floor(Math.random() * singleWordTitles.length)];
    return {
        word: randomMovie.title,
        hint: `Released in ${randomMovie.release_date?.split("-")[0] || "unknown"}`
    };
};

const initTimer = maxTime => {
    clearInterval(timer);
    timer = setInterval(() => {
        if (maxTime > 0) {
            maxTime--;
            timeText.innerText = maxTime;
        } else {
            clearInterval(timer);
            alert(`⏰ Time's up! The correct word was: ${correctWord.toUpperCase()}`);
            initGame();
        }
    }, 1000);
};

const initGame = async () => {
    try {
        const data = await fetchRandomMovie();
        if (!data || !data.word) {
            alert("❌ Failed to fetch word from TMDB.");
            return;
        }

        initTimer(30);

        let wordArray = data.word.toLowerCase().split("");
        for (let i = wordArray.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
        }

        wordText.innerText = wordArray.join("");
        hintText.innerText = data.hint;
        correctWord = data.word.toLowerCase();
        inputField.value = "";
        inputField.setAttribute("maxlength", correctWord.length);
    } catch (error) {
        console.error(error);
        alert("⚠️ Could not connect to TMDB API.");
    }
};

const checkWord = () => {
    let userWord = inputField.value.toLowerCase();
    if (!userWord) return alert("Please enter a word!");
    if (userWord !== correctWord) return alert(`❌ ${userWord} is incorrect!`);
    alert(`✅ Congratulations! ${correctWord.toUpperCase()} is correct!`);
    initGame();
};

refreshBtn.addEventListener("click", initGame);
checkBtn.addEventListener("click", checkWord);

// Start the game on page load
initGame();