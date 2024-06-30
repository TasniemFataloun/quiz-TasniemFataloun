import { QuizSettings, quizSettings } from "./types";

function setSettings(settings: QuizSettings) {
  localStorage.setItem("Quiz_Setting", JSON.stringify(settings));
}
function loadSettings(): QuizSettings {
  const savedSettings = localStorage.getItem("Quiz_Setting");
  return savedSettings ? JSON.parse(savedSettings) : quizSettings;
}

function saveUserSettings(name:any){
  const userSettingsJSON = localStorage.getItem('UserSettings');
  const userSettings = userSettingsJSON ? JSON.parse(userSettingsJSON) : [];
  const existingUserIndex = userSettings.findIndex((user: any) => user.name === name);
  if (existingUserIndex === -1) {
      userSettings.push({ name: name, score: [] });
      localStorage.setItem('UserSettings', JSON.stringify(userSettings));
    }
}
function saveScore(score:any,name:any){
  const userSettingsJSON = localStorage.getItem('UserSettings');
  const userSettings = userSettingsJSON ? JSON.parse(userSettingsJSON) : [];
  const existingUserIndex = userSettings.findIndex((user: any) => user.name === name);
  if (existingUserIndex !== -1) {
      userSettings[existingUserIndex].score.push(score);
      localStorage.setItem('UserSettings', JSON.stringify(userSettings));  
    }
}

export { setSettings, loadSettings, saveUserSettings,saveScore };
