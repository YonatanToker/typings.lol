import '../styles/index.css';
import keyboardIcon from '../keyboard.icon.png';
import resetArrows from '../arrows-small.svg';
import lightThemeIcon2 from "../light-theme-icon2.png"; //for dark, these are white icons
import darkThemeIcon2 from "../dark-theme-icon2.png";
import lightThemeIcon from "../light-theme-icon.png"; //for light, these are black icons
import darkThemeIcon from "../dark-theme-icon.png";
//Yonatan Toker's Project
let link = document.querySelector("link[rel*='icon']");
if (!link) {
    link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    document.getElementsByTagName('head')[0].appendChild(link);
}
link.href = keyboardIcon;
link.rel = 'icon shortcut';

const barEl = document.querySelector(".bar");
const topContainer = document.querySelector(".command-container__top");
const typingArea = document.querySelector(".command-container__typing-area");
const lightThemeIconEl = document.querySelector(".light-theme-icon");
const darkThemeIconEl = document.querySelector(".dark-theme-icon");
barEl.querySelector('.reset-img').src = resetArrows;
document.querySelector('.icon-img').src = keyboardIcon;
document.querySelector(".below-header-icon").src = keyboardIcon;
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("input-field").focus();
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        lightThemeIconEl.src = lightThemeIcon;
        darkThemeIconEl.src = darkThemeIcon;
    } else {
        document.body.classList.remove('light-theme');
        lightThemeIconEl.src = lightThemeIcon2;
        darkThemeIconEl.src = darkThemeIcon2;
    }
});
lightThemeIconEl.addEventListener('click', function() {
    document.body.classList.add('light-theme');
    localStorage.setItem('theme', 'light');
    
    // Update the icons' src attributes
    lightThemeIconEl.src = lightThemeIcon; 
    darkThemeIconEl.src = darkThemeIcon; 
});

// Event listener for the dark theme icon
darkThemeIconEl.addEventListener('click', function() {
    document.body.classList.remove('light-theme');
    localStorage.setItem('theme', 'dark');
    
    // Update the icons' src attributes
    lightThemeIconEl.src = lightThemeIcon2; 
    darkThemeIconEl.src = darkThemeIcon2; 
});
//inputField & typingText
const typingText = typingArea.querySelector(".text-display"); 
const inputFieldEl = barEl.querySelector("#input-field");
const difficultyContainerEl = topContainer.querySelector(".difficulty-container");
const wordsCountEl = topContainer.querySelector(".word-count");

const focusOnInputField = () => {
    inputFieldEl.focus();
}
//A function which will return me an array of random words, with the amount of words being passed as an argument
const wordList = require('./data.json');
let wordsArray = [];

const getRandomWordsArrayFromJSON = (nameOfArrayInJSON, wordCount) => {
    let words = wordList[nameOfArrayInJSON];
    if (!words || wordCount===0) {
        return [];
    }
    let wordsCopy = [...words]; //so it won't be with passing by reference and mutate the array
    let finalArr = [];
    for (let i = 0; i < wordCount; i++) {
        let randomIndex = Math.floor(Math.random() * wordsCopy.length);
        finalArr.push(wordsCopy[randomIndex]);
        wordsCopy.splice(randomIndex, 1);//preventing duplicates
        if (wordsCopy.length === 0) {
            break; //making sure the code won't break
        }
    }
    wordsArray = finalArr;
    console.log(wordsArray);
    return finalArr;
};
let currentDifficulty;
const displayingRandomWordsInTypingText = () => {
    currentDifficulty = difficultyContainerEl.querySelector(".current-difficulty").textContent;
    let currentWordsCount = wordsCountEl.querySelector(".current-test").textContent;
    if (!currentDifficulty || !currentWordsCount) {
        return; //in case there is no value in difficulty or wordsCount or wordsCnt is 0
    }
    typingText.innerHTML = '';
    let arr = getRandomWordsArrayFromJSON(currentDifficulty, parseInt(currentWordsCount));
    for (let i=0; i < arr.length; i++) {
        let span = document.createElement("span");
        span.textContent = arr[i];
        typingText.appendChild(span); 
    }
    typingText.firstElementChild.classList.add('highlight');
    currentWordEl = typingText.firstElementChild;
    startTime = null;
    wordsTypedSoFar = 0;
    correctWordsCount = 0;
    wrongWordsCount = 0;
    inputFieldEl.value = "";
    focusOnInputField();
};
displayingRandomWordsInTypingText();

//event listeners to all of the word counts spans 25 / 35 / 50 / 100:
wordsCountEl.addEventListener("click", e =>{
    const targetSpan = e.target.closest("span"); // return me the clicked span
    if (targetSpan && targetSpan.classList.contains('current-test') || targetSpan === null) {
        return;
    }
    //if we are here the element we clicked is not current-test
    const currentTestElement = wordsCountEl.querySelector('.current-test');
    if (currentTestElement) {
        currentTestElement.classList.remove('current-test');
    }
    if (targetSpan) {
        targetSpan.classList.add("current-test");
    }
    displayingRandomWordsInTypingText();
});
difficultyContainerEl.addEventListener("click", e=>{
    const targetDifficulty = e.target.closest("span");
    if (targetDifficulty && targetDifficulty.classList.contains("current-difficulty") || targetDifficulty === null) {
        return;
    }
    //if we are here the element we clicked is not current-difficulty
    const currentDifficultyEl = difficultyContainerEl.querySelector(".current-difficulty");
    if (currentDifficultyEl) {
        currentDifficultyEl.classList.remove("current-difficulty");
    }
    if (targetDifficulty) {
        targetDifficulty.classList.add("current-difficulty");
    }
    displayingRandomWordsInTypingText();
});
const resetButton = barEl.querySelector(".reset-button");
resetButton.addEventListener("click", () => {
    displayingRandomWordsInTypingText();
}); 

//query selectors for the current stats and save button:
const resultsSaveContainer = document.querySelector(".results-save-container");
const wpmSpan = resultsSaveContainer.querySelector(".wpm");
const accuracySpan = resultsSaveContainer.querySelector(".accuracy");
const correctWordsSpan = resultsSaveContainer.querySelector(".correct-words");
const wrongsWordsSpan = resultsSaveContainer.querySelector(".wrong-words");
const saveButton = resultsSaveContainer.querySelector(".save-button");
const savedDisableBtn = resultsSaveContainer.querySelector("#savedButton");
//taking care of timer, saving wpm and accuracy, correct and wrong words amount
// remember about wordsArray
let currentWordEl;
let allStatsOfEasyTests = JSON.parse(localStorage.getItem('easyTestsStats') || '[]');
let allStatsOfHardTests = JSON.parse(localStorage.getItem('hardTestsStats') || '[]');
let wordsTypedSoFar = 0;
let correctWordsCount = 0;
let wrongWordsCount = 0;
let startTime = null;
let accuracy;
let wpm;
let currCorrectWordsCount;
let currWrongWordsCount;
inputFieldEl.addEventListener('input', (e) => {
    if (!startTime) {
        startTime = Date.now();
    }
    
    // Trim the space or newline character from the end for comparison
    const typedWord = e.target.value.trim();

    if (e.target.value.endsWith(' ') || e.target.value.endsWith('\n')) {
        if (!currentWordEl) {
            return;  // Return early if there's no current word element
        }
        // Check if the word is correct
        const correctWord = wordsArray[wordsTypedSoFar];
        if (typedWord === correctWord) {
            // Word is correct
            correctWordsCount++;
            // Remove highlight class and mark word as correct
            currentWordEl.classList.remove('highlight');
            currentWordEl.classList.add("correct");
        } else {
            // Word is incorrect
            wrongWordsCount++;
            // Remove highlight class and mark word as incorrect
            currentWordEl.classList.remove('highlight');
            currentWordEl.classList.add("wrong");
        }
        currentWordEl = currentWordEl.nextElementSibling;
        if (currentWordEl) {
            currentWordEl.classList.add('highlight');
        }


        wordsTypedSoFar++;
        e.target.value = ''; // Clear the input for the next word
        // Check if the test is over
        let totalWordsToType = parseInt(wordsCountEl.querySelector(".current-test").textContent);
        if (wordsTypedSoFar === totalWordsToType) {
            let endTime = Date.now();
            let scopedWPM = calculateWPM(endTime, startTime);
            // Calculate accuracy
            let scopedAccuracy = Math.round((correctWordsCount / totalWordsToType) * 100); // in percentage
            // You can also show results to the user using the variables: wpm, accuracy, correctWordsCount, wrongWordsCount, etc.
            saveButton.style.display = "block";
            savedDisableBtn.style.display = "none";
            wpm = scopedWPM;
            accuracy = scopedAccuracy;
            wpmSpan.textContent = "wpm: " + scopedWPM;
            accuracySpan.textContent = "accuracy: " + scopedAccuracy + "%";
            correctWordsSpan.textContent = "correct words: " + correctWordsCount;
            wrongsWordsSpan.textContent = "wrong words: " + wrongWordsCount;
            //you can apend them to an array, then reassining the value of the array at localStorage
            currCorrectWordsCount = correctWordsCount;
            currWrongWordsCount = wrongWordsCount;
            
            // Reset for next test
            startTime = null;
            wordsTypedSoFar = 0;
            correctWordsCount = 0;
            wrongWordsCount = 0;
        }
    }
});


const calculateWPM = (endTime, startTime) => { //need to endTime after the last word
    const timeDifference = endTime - startTime;
    const minutes = timeDifference / 60000;
    const wpm = Math.round(correctWordsCount / minutes);
    return wpm;
};

const allStatsContainerEl = document.querySelector(".stats-cards-container");
//easy
const easyWPMEl = allStatsContainerEl.querySelector(".easy-stats-container__wpm");
const easyAccuracyEl = allStatsContainerEl.querySelector(".easy-stats-container__accuracy");
const recentEasyTestsEl = allStatsContainerEl.querySelector(".easy-stats-container__recent-tests-display");
//hard
const hardWPMEl = allStatsContainerEl.querySelector(".hard-stats-container__wpm");
const hardAccuracyEl = allStatsContainerEl.querySelector(".hard-stats-container__accuracy");
const recentHardTestsEl = allStatsContainerEl.querySelector(".hard-stats-container__recent-tests-display");

let easyWPMAverage;
let hardWPMAverage;

let easyAccAverage;
let hardAccAverage;
saveButton.addEventListener("click", ()=>{
    if (currentDifficulty === 'easy') {
        allStatsOfEasyTests = JSON.parse(localStorage.getItem('easyTestsStats') || '[]');
        allStatsOfEasyTests.push([wpm, accuracy, currCorrectWordsCount, currWrongWordsCount]);
        localStorage.setItem('easyTestsStats', JSON.stringify(allStatsOfEasyTests));
        easyWPMAverage = getAverageWPMFromStats('easyTestsStats');
        easyAccAverage = getAverageAccuracyFromStats('easyTestsStats');
        displayEasyAvgWPM(easyWPMAverage);
        displayEasyAccuracy(easyAccAverage);
        displayArrayOfEasyWPM();

    } else if (currentDifficulty === "hard") {
        allStatsOfHardTests = JSON.parse(localStorage.getItem('hardTestsStats') || '[]');
        allStatsOfHardTests.push([wpm, accuracy, currCorrectWordsCount, currWrongWordsCount]);
        localStorage.setItem('hardTestsStats', JSON.stringify(allStatsOfHardTests));
        hardWPMAverage = getAverageWPMFromStats('hardTestsStats');
        hardAccAverage = getAverageAccuracyFromStats('hardTestsStats');
        displayHardAvgWPM(hardWPMAverage);
        displayHardAccuracy(hardAccAverage);
        displayArrayOfHardWPM();
    } else {
        return;
    }
    saveButton.style.display = 'none';
    savedDisableBtn.style.display = 'block';
    //reset results

    //at the end cause it to be hidden (turn into saved) - change in the input event listener that it will be visible
});
const displayEasyAccuracy = (easyAccuracyAvg) => {
    if (!easyAccuracyAvg) {
        return;
    }
    let avgAccSpan = `Avg Accuracy: ${easyAccuracyAvg}%`;
    easyAccuracyEl.textContent = avgAccSpan;
};
const displayHardAccuracy = (hardAccuracyAvg) => {
    if (!hardAccuracyAvg) {
        return;
    }
    let avgAccSpan = `Avg Accuracy: ${hardAccuracyAvg}%`;
    hardAccuracyEl.textContent = avgAccSpan;
};
const displayEasyAvgWPM = (avgWPM) => {
    if (!avgWPM) {
        return;
    }
    let avgWPMStr = "Avg WPM: " + avgWPM;
    easyWPMEl.textContent = avgWPMStr;
};
const displayHardAvgWPM = (avgWPM) => {
    if (!avgWPM) {
        return;
    }
    let avgWPMStr = "Avg WPM: " + avgWPM;
    hardWPMEl.textContent = avgWPMStr;
};
const getAverageWPMFromStats = (itemName) => {
    const jsonString = localStorage.getItem(itemName);
    if (!jsonString) {
        return null;  // No data found in localStorage for this item
    }
    const arr = JSON.parse(jsonString);  // Parse the JSON string to get the array
    if (arr.length === 0) {
        return null;  // The array is empty
    }
    let i = 0;
    let sum = 0;  
    for (i = 0; i < arr.length; i++) {
        sum += arr[i][0];
    }
    const avg = Math.round(sum/i);
    return avg;
};
const getAverageAccuracyFromStats = (itemName) => {
    const jsonString = localStorage.getItem(itemName);
    if (!jsonString) {
        return null;  // No data found in localStorage for this item
    }
    const arr = JSON.parse(jsonString);
    if (arr.length === 0) {
        return null;
    }
    let i = 0;
    let sum = 0;
    for (i = 0; i < arr.length; i++) {
        sum += arr[i][1];
    }
    let avgAccuracy = Math.round(sum/i);
    return avgAccuracy;
};
// const getArrayOfWPM = (itemName) => {
//     const jsonString = localStorage.getItem(itemName);
//     if (!jsonString) {
//         return null;  // No data found in localStorage for this item
//     }
//     const arr = JSON.parse(jsonString);
//     if (arr.length === 0) {
//         return null;
//     }
//     let wpmArr = [];
//     for (let i=0; i < arr.length; i++) {
//         wpmArr.push(arr[i][0]);
//     }
//     return wpmArr;
// };
const displayArrayOfEasyWPM = () => {
    recentEasyTestsEl.innerHTML = '';
    const jsonString = localStorage.getItem('easyTestsStats');
    if (!jsonString) {
        return;  // No data found in localStorage for this item
    }
    const arr = JSON.parse(jsonString);
    if (arr.length === 0) {
        return;
    }
    for (let i = 0; i < arr.length; i++) {
        let wpmSpan = document.createElement("span");
        wpmSpan.textContent = arr[i][0] + ", "; // WPM value
        wpmSpan.title = `WPM: ${arr[i][0]} Accuracy: ${arr[i][1]}%, Correct Words: ${arr[i][2]}, Wrong Words: ${arr[i][3]}`;
        wpmSpan.style.cursor = "pointer";
        recentEasyTestsEl.appendChild(wpmSpan);
    }
};
const displayArrayOfHardWPM = () => {
    recentHardTestsEl.innerHTML = '';
    const jsonString = localStorage.getItem('hardTestsStats');
    if (!jsonString) {
        return;  // No data found in localStorage for this item
    }
    const arr = JSON.parse(jsonString);
    if (arr.length === 0) {
        return;
    }
    for (let i = 0; i < arr.length; i++) {
        let wpmSpan = document.createElement("span");
        wpmSpan.textContent = arr[i][0] + ", "; // WPM value
        wpmSpan.title = `WPM: ${arr[i][0]} Accuracy: ${arr[i][1]}%, Correct Words: ${arr[i][2]}, Wrong Words: ${arr[i][3]}`;
        wpmSpan.style.cursor = "pointer";
        recentHardTestsEl.appendChild(wpmSpan);
    }
};
function displayEasyStatsOnLoad() {
    const avgWPM = getAverageWPMFromStats('easyTestsStats');
    displayEasyAvgWPM(avgWPM);
    
    const avgAccuracy = getAverageAccuracyFromStats('easyTestsStats');
    displayEasyAccuracy(avgAccuracy);

    displayArrayOfEasyWPM();
}

function displayHardStatsOnLoad() {
    const avgWPM = getAverageWPMFromStats('hardTestsStats');
    displayHardAvgWPM(avgWPM);

    const avgAccuracy = getAverageAccuracyFromStats('hardTestsStats');
    displayHardAccuracy(avgAccuracy);

    displayArrayOfHardWPM();
}

// Call the above functions to load data immediately when the script runs:
displayEasyStatsOnLoad();
displayHardStatsOnLoad();

//clearing the data from localStorage and changing display to nothing
const clearEasyStatsEl = allStatsContainerEl.querySelector(".easy-stats-container__clear");
const clearHardStatsEl = allStatsContainerEl.querySelector(".hard-stats-container__clear");
clearEasyStatsEl.title = "Click twice to clear";
clearHardStatsEl.title = "Click twice to clear";
function clearEasyStatsFunc() {
    localStorage.removeItem('easyTestsStats');
    easyWPMEl.textContent = "Avg WPM:";
    easyAccuracyEl.textContent = "Avg Accuracy:";
    recentEasyTestsEl.textContent = "";
}
function clearHardStatsFunc() {
    localStorage.removeItem('hardTestsStats');
    hardWPMEl.textContent = "Avg WPM:";
    hardAccuracyEl.textContent = "Avg Accuracy:";
    recentHardTestsEl.textContent = "";
}
clearEasyStatsEl.addEventListener("dblclick", () => {
    clearEasyStatsFunc();
});
clearHardStatsEl.addEventListener("dblclick", ()=> {
    clearHardStatsFunc();
});
// create a clearStatsForEasyTests function and clearStatsForHardTests
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        displayingRandomWordsInTypingText();
    }
    if (event.key === "Enter") {
        if (window.getComputedStyle(saveButton).display !== "none") {
            saveButton.click();
        }
    }
});