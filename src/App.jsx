import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import "./App.css";

const QUESTIONS = [
  { id: 1, question: "En sevdiğim içecek hangisi?", options: ["Kahve", "Çay", "Ayran", "Limonata"], correct: "Kahve" },
  { id: 2, question: "Boş zamanımda en çok ne yaparım?", options: ["Kitap okurum", "Oyun ", "Spor yaparım", "Uyurum"], correct: "Oyun " },
  { id: 3, question: "En sevdiğim mevsim hangisi?", options: ["Yaz", "Kış", "İlkbahar", "Sonbahar"], correct: "Sonbahar" },
  { id: 4, question: "En sevdiğim renk hangisi?", options: ["Siyah", "Mavi", "Kırmızı", "Yeşil"], correct: "Mavi" },
  { id: 5, question: "En sevdiğim sayı?", options: ["1", "5", "7", "3"], correct: "3" },
  { id: 6, question: "En sevdiğim müzik türü hangisi?", options: ["Pop", "Rock", "Rap", "Türkü"], correct: "Rap" },
  { id: 7, question: "Tatilde en çok neyi tercih ederim?", options: ["Deniz", "Dağ evi", "Şehir gezisi", "Kamp"], correct: "Deniz" },
  { id: 8, question: "En sevdiğim yemek türü hangisi?", options: ["Hamburger", "Pizza", "Makarna", "Et"], correct: "Et" },
  { id: 9, question: "Benim için ideal cuma akşamı hangisi?", options: ["Evde film", "Dışarıda yemek", "Arkadaşlarla oyun", "Uzun yürüyüş"], correct: "Arkadaşlarla oyun" },
  { id: 10, question: "En çok hangi uygulamayı kullanırım?", options: ["YouTube", "Instagram", "Discord", "X"], correct: "Discord" },
  { id: 11, question: "Sabah insanı mıyım gece insanı mı?", options: ["Tam sabah insanı", "Gece insanı", "İkisi de", "Hiçbiri"], correct: "Gece insanı" },
  { id: 12, question: "En sevdiğim film türü hangisi?", options: ["Korku", "Bilim kurgu", "Komedi", "Romantik"], correct: "Bilim kurgu" },
  { id: 13, question: "En sevdiğim hava nasıl olur?", options: ["Güneşli", "Yağmurlu", "Sisli", "Karlı"], correct: "Güneşli" },
  { id: 14, question: "Türkiye'de en sevdiğim yer?", options: ["Ölüdeniz", "Alaçatı", "Marmaris", "Alanya"], correct: "Ölüdeniz" },
  { id: 15, question: "En çok hangi tatlıyı severim?", options: ["Cheesecake", "Sütlaç", "Baklava", "Sufle"], correct: "Sütlaç" },
  { id: 16, question: "En sevdiğim sosyal ortam hangisi?", options: ["Kalabalık parti", "Yakın arkadaş ortamı", "Tek başıma vakit", "Aile buluşması"], correct: "Yakın arkadaş ortamı" },
  { id: 17, question: "En sevdiğim araba?", options: ["Mustang", "Hayabusa", "M5", "SS"], correct: "SS" },
  { id: 18, question: "En sevdiğim Film?", options: ["Harry Potter", "Yüzüklerin efendisi", "Esaretin bedeli", "Korku sokağı"], correct: "Harry Potter" },
  { id: 19, question: "En çok hangi hayvanı severim?", options: ["Kedi", "Köpek", "Kuş", "Balık"], correct: "Köpek" },
  { id: 20, question: "Beni en sevdiğim ünlü?", options: ["Sabri sarıoğlu", "Emma watson", "Recep tayyip erdoğan", "Adolf hitler"], correct: "Emma watson" },
];

function App() {
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [saving, setSaving] = useState(false);

  const question = QUESTIONS[index];

  const normalizedName = name.trim().toLocaleLowerCase("tr-TR");
  const isSule = normalizedName === "şule" || normalizedName === "sule";

  const score = useMemo(() => {
    return QUESTIONS.reduce((acc, q) => {
      return acc + (answers[q.id] === q.correct ? 1 : 0);
    }, 0);
  }, [answers]);

  function getResultMessage(currentScore, currentName) {
    const normalized = currentName.trim().toLocaleLowerCase("tr-TR");

    if (normalized === "şule" || normalized === "sule") {
      return "Kalbimin sahibi beni tanımaz olur mu hiç 💖";
    }

    if (currentScore <= 5) {
      return "Aga sen beni tanımıyomuşun ki";
    }

    if (currentScore <= 10) {
      return "Bi zahmet bu kadarını da bil keke";
    }

    if (currentScore <= 15) {
      return "Tanımışsın diye yorumladım";
    }

    if (currentScore === 20) {
      return "İşte bağırsağımdaki boku bile görebilen biri";
    }

    return "Baya iyi tanıyorsun ha";
  }

  async function fetchScores() {
    const { data, error } = await supabase
      .from("quiz_results")
      .select("*")
      .limit(50);

    if (error) {
      console.error(error);
      return;
    }

    const sortedData = (data || []).sort((a, b) => {
      const aName = (a.player_name || "").trim().toLocaleLowerCase("tr-TR");
      const bName = (b.player_name || "").trim().toLocaleLowerCase("tr-TR");

      const aIsSule = aName === "şule" || aName === "sule";
      const bIsSule = bName === "şule" || bName === "sule";

      if (aIsSule && !bIsSule) return -1;
      if (!aIsSule && bIsSule) return 1;

      if (b.score !== a.score) return b.score - a.score;

      return new Date(a.created_at) - new Date(b.created_at);
    });

    setLeaderboard(sortedData.slice(0, 10));
  }

  useEffect(() => {
    fetchScores();
  }, []);

  function startQuiz() {
    if (!name.trim()) {
      alert("Önce ismini yaz.");
      return;
    }
    setStarted(true);
  }

  function select(option) {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: option,
    }));
  }

  async function next() {
    if (!answers[question.id]) {
      alert("Bir seçenek işaretle.");
      return;
    }

    if (index === QUESTIONS.length - 1) {
      setSaving(true);

      const finalScore = score;

      const { error } = await supabase.from("quiz_results").insert([
        {
          player_name: name.trim(),
          score: isSule ? 0 : finalScore,
          total_questions: QUESTIONS.length,
        },
      ]);

      setSaving(false);

      if (error) {
        console.error(error);
        alert("Sonuç kaydedilirken hata oluştu.");
        return;
      }

      await fetchScores();
      setFinished(true);
      return;
    }

    setIndex((prev) => prev + 1);
  }

  return (
    <div className="page">
      <div className="container">
        <div className="quiz-card">
          {!started && !finished && (
            <>
              <h1>Beni Ne Kadar Tanıyorsun?</h1>
              <p className="subtitle">20 soruluk testi çöz ve skor tablosuna gir.</p>

              <div className="start-box">
                <input
                  className="name-input"
                  type="text"
                  placeholder="İsmini yaz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <button className="main-button" onClick={startQuiz}>
                  Teste Başla
                </button>
              </div>
            </>
          )}

          {started && !finished && (
            <>
              <div className="question-info">
                <span>Soru {index + 1} / {QUESTIONS.length}</span>
                <span>{name}</span>
              </div>

              <h2>{question.question}</h2>

              <div className="options-grid">
                {question.options.map((o) => {
                  const isSelected = answers[question.id] === o;

                  return (
                    <button
                      key={o}
                      className={isSelected ? "option selected" : "option"}
                      onClick={() => select(o)}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>

              <button className="main-button" onClick={next} disabled={saving}>
                {index === QUESTIONS.length - 1
                  ? saving
                    ? "Kaydediliyor..."
                    : "Bitir"
                  : "Sonraki"}
              </button>
            </>
          )}

          {finished && (
            <div className="result-box">
              <h2>Test Bitti</h2>
              <p className="score-text">
                {name}, skorun: <strong>{score} / {QUESTIONS.length}</strong>
              </p>
              <p className="result-message">{getResultMessage(score, name)}</p>
            </div>
          )}
        </div>

        <div className="leaderboard-card">
          <h2>Top 10 Skor Tablosu</h2>

          {leaderboard.length === 0 ? (
            <p>Henüz kayıt yok.</p>
          ) : (
            <div className="leaderboard-list">
              {leaderboard.map((player, i) => {
                const playerNameNormalized = (player.player_name || "")
                  .trim()
                  .toLocaleLowerCase("tr-TR");
                const playerIsSule =
                  playerNameNormalized === "şule" || playerNameNormalized === "sule";

                return (
                  <div className="leaderboard-item" key={player.id}>
                    <div>
                      <span className="rank">#{i + 1}</span>
                      <span className="player-name">{player.player_name}</span>
                    </div>
                    <div className="player-score">
                      {playerIsSule ? "💖" : `${player.score}/${player.total_questions}`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
