// lib/greetings.js
// The canonical list of greetings used by both the API routes and the page.
// Ordered roughly by number of speakers. 63 entries so /api/hello?all=1 can
// return a "hello" in every one of them.

export const GREETINGS = [
  { code: "en", language: "English", text: "Hello", flag: "🇬🇧" },
  { code: "zh", language: "Chinese", text: "你好", flag: "🇨🇳" },
  { code: "hi", language: "Hindi", text: "नमस्ते", flag: "🇮🇳" },
  { code: "es", language: "Spanish", text: "Hola", flag: "🇪🇸" },
  { code: "fr", language: "French", text: "Bonjour", flag: "🇫🇷" },
  { code: "ar", language: "Arabic", text: "مرحبا", flag: "🇸🇦" },
  { code: "bn", language: "Bengali", text: "নমস্কার", flag: "🇧🇩" },
  { code: "ru", language: "Russian", text: "Привет", flag: "🇷🇺" },
  { code: "pt", language: "Portuguese", text: "Olá", flag: "🇵🇹" },
  { code: "id", language: "Indonesian", text: "Halo", flag: "🇮🇩" },
  { code: "ur", language: "Urdu", text: "ہیلو", flag: "🇵🇰" },
  { code: "de", language: "German", text: "Hallo", flag: "🇩🇪" },
  { code: "ja", language: "Japanese", text: "こんにちは", flag: "🇯🇵" },
  { code: "sw", language: "Swahili", text: "Habari", flag: "🇰🇪" },
  { code: "mr", language: "Marathi", text: "नमस्कार", flag: "🇮🇳" },
  { code: "te", language: "Telugu", text: "నమస్తే", flag: "🇮🇳" },
  { code: "tr", language: "Turkish", text: "Merhaba", flag: "🇹🇷" },
  { code: "ta", language: "Tamil", text: "வணக்கம்", flag: "🇮🇳" },
  { code: "vi", language: "Vietnamese", text: "Xin chào", flag: "🇻🇳" },
  { code: "ko", language: "Korean", text: "안녕하세요", flag: "🇰🇷" },
  { code: "it", language: "Italian", text: "Ciao", flag: "🇮🇹" },
  { code: "gu", language: "Gujarati", text: "નમસ્તે", flag: "🇮🇳" },
  { code: "pl", language: "Polish", text: "Cześć", flag: "🇵🇱" },
  { code: "uk", language: "Ukrainian", text: "Привіт", flag: "🇺🇦" },
  { code: "fa", language: "Persian", text: "سلام", flag: "🇮🇷" },
  { code: "ml", language: "Malayalam", text: "ഹലോ", flag: "🇮🇳" },
  { code: "kn", language: "Kannada", text: "ನಮಸ್ಕಾರ", flag: "🇮🇳" },
  { code: "th", language: "Thai", text: "สวัสดี", flag: "🇹🇭" },
  { code: "nl", language: "Dutch", text: "Hallo", flag: "🇳🇱" },
  { code: "my", language: "Burmese", text: "ဟယ်လို", flag: "🇲🇲" },
  { code: "pa", language: "Punjabi", text: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", flag: "🇮🇳" },
  { code: "ro", language: "Romanian", text: "Salut", flag: "🇷🇴" },
  { code: "el", language: "Greek", text: "Γεια σου", flag: "🇬🇷" },
  { code: "hu", language: "Hungarian", text: "Szia", flag: "🇭🇺" },
  { code: "cs", language: "Czech", text: "Ahoj", flag: "🇨🇿" },
  { code: "sv", language: "Swedish", text: "Hej", flag: "🇸🇪" },
  { code: "he", language: "Hebrew", text: "שלום", flag: "🇮🇱" },
  { code: "da", language: "Danish", text: "Hej", flag: "🇩🇰" },
  { code: "no", language: "Norwegian", text: "Hei", flag: "🇳🇴" },
  { code: "fi", language: "Finnish", text: "Hei", flag: "🇫🇮" },
  { code: "sk", language: "Slovak", text: "Ahoj", flag: "🇸🇰" },
  { code: "bg", language: "Bulgarian", text: "Здравей", flag: "🇧🇬" },
  { code: "sr", language: "Serbian", text: "Здраво", flag: "🇷🇸" },
  { code: "hr", language: "Croatian", text: "Bok", flag: "🇭🇷" },
  { code: "sl", language: "Slovenian", text: "Živjo", flag: "🇸🇮" },
  { code: "lt", language: "Lithuanian", text: "Sveiki", flag: "🇱🇹" },
  { code: "et", language: "Estonian", text: "Tere", flag: "🇪🇪" },
  { code: "is", language: "Icelandic", text: "Halló", flag: "🇮🇸" },
  { code: "sq", language: "Albanian", text: "Përshëndetje", flag: "🇦🇱" },
  { code: "hy", language: "Armenian", text: "Բարեւ", flag: "🇦🇲" },
  { code: "ka", language: "Georgian", text: "გამარჯობა", flag: "🇬🇪" },
  { code: "az", language: "Azerbaijani", text: "Salam", flag: "🇦🇿" },
  { code: "kk", language: "Kazakh", text: "Сәлем", flag: "🇰🇿" },
  { code: "mn", language: "Mongolian", text: "Сайн уу", flag: "🇲🇳" },
  { code: "ne", language: "Nepali", text: "नमस्ते", flag: "🇳🇵" },
  { code: "si", language: "Sinhala", text: "හෙලෝ", flag: "🇱🇰" },
  { code: "km", language: "Khmer", text: "សួស្តី", flag: "🇰🇭" },
  { code: "tl", language: "Filipino", text: "Kumusta", flag: "🇵🇭" },
  { code: "ms", language: "Malay", text: "Helo", flag: "🇲🇾" },
  { code: "am", language: "Amharic", text: "ሰላም", flag: "🇪🇹" },
  { code: "yo", language: "Yoruba", text: "Báwo", flag: "🇳🇬" },
  { code: "zu", language: "Zulu", text: "Sawubona", flag: "🇿🇦" },
  { code: "mi", language: "Māori", text: "Kia ora", flag: "🇳🇿" },
];

// Small helpers so callers do not have to worry about casing.
export function findGreeting(code) {
  if (!code) return null;
  const wanted = String(code).toLowerCase();
  return GREETINGS.find((g) => g.code === wanted) || null;
}

// The public shape required by /api/languages.
export function publicGreetings() {
  return GREETINGS.map(({ code, language, text }) => ({ code, language, text }));
}
