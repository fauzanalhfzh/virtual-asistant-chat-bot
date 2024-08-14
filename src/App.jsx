import { requestToGroqAI } from "./utils/groq";
import { useState, useEffect } from "react";
import "./index.css";

const recommendedQuestions = [
  "Apa itu AI?",
  "Bagaimana cara kerja machine learning?",
  "Apa itu neural network?",
  "Apa perbedaan antara supervised dan unsupervised learning?",
  "Bagaimana cara memulai belajar coding?",
];

function App() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [historicalSessions, setHistoricalSessions] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(true);

  useEffect(() => {
    const savedSessions = localStorage.getItem("historicalSessions");
    if (savedSessions) {
      setHistoricalSessions(JSON.parse(savedSessions));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "historicalSessions",
      JSON.stringify(historicalSessions)
    );
  }, [historicalSessions]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (input.trim() === "") return;

    setChat((prevChat) => [...prevChat, { sender: "user", message: input }]);

    const aiResponse = await requestToGroqAI(input);

    const responseMessage =
      typeof aiResponse === "string"
        ? aiResponse
        : aiResponse.content || "Unknown response";

    // Mendeteksi jika responseMessage adalah kode
    const isCode =
      responseMessage.startsWith("```") && responseMessage.endsWith("```");

    setChat((prevChat) => [
      ...prevChat,
      { sender: "ai", message: responseMessage, isCode },
    ]);

    setInput("");
  };

  const handleNewSession = () => {
    const newSession = {
      timestamp: new Date().toISOString(),
      chat: [...chat],
    };

    setHistoricalSessions((prevSessions) => [...prevSessions, newSession]);
    setChat([]);
    setShowRecommendations(true);
  };

  const handleLoadSession = (session) => {
    setChat(session.chat);
  };

  const handleRecommendedQuestion = (question) => {
    setInput(question);
    setShowRecommendations(false);
  };

  return (
    <div className="relative flex h-screen bg-gray-100">
      {showRecommendations && (
        <div className="recommendations-floating">
          <div className="recommendations-panel">
            <h2 className="text-lg font-semibold mb-4">
              Pertanyaan Rekomendasi
            </h2>
            {recommendedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleRecommendedQuestion(question)}
                className="recommendation-button"
              >
                {question}
              </button>
            ))}
            <button
              onClick={() => setShowRecommendations(false)}
              className="recommendation-button-close px-4 py-2 text-white mt-4 rounded-md"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <div className="w-80 bg-gray-100 text-black p-4 overflow-y-auto shadow-2xl">
        <h2 className="text-lg font-semibold text-black">Intern AI Chatbot</h2>
        <button
          onClick={handleNewSession}
          className="bg-blue-500 hover:bg-blue-700 rounded-md px-4 py-2 text-white mt-4 w-full"
        >
          Mulai Sesi Baru
        </button>
        <h3 className="text-md text-center mt-6 font-semibold text-black">
          Histori Sesi Chat
        </h3>
        <div className="mt-4">
          {historicalSessions.map((session, index) => (
            <div key={index} className="mb-2">
              <h3 className="text-sm font-medium">{`Sesi ${index + 1}`}</h3>
              <div className="text-xs text-gray-400">
                {new Date(session.timestamp).toLocaleString()}
              </div>
              <button
                onClick={() => handleLoadSession(session)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mt-2 w-full"
              >
                Muat Sesi
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-scroll p-4">
          {chat.map((entry, index) => (
            <div
              key={index}
              className={`flex ${
                entry.sender === "user" ? "justify-end" : "justify-start"
              } mt-2`}
            >
              <div className="flex flex-col items-start">
                {entry.sender === "ai" && (
                  <div className="bot-name text-gray-600 font-bold">
                    AI Intern Bot 🤖
                  </div>
                )}
                <div
                  className={`bubble ${
                    entry.sender === "user" ? "user" : "ai"
                  } ${entry.isCode ? "code" : ""}`}
                >
                  {entry.message}
                </div>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-end items-center p-4 bg-white shadow-md">
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan kamu.."
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 rounded-md px-4 py-2 text-white ml-2"
            >
              Kirim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
