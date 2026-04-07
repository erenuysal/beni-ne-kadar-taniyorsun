import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import "./App.css";

const QUESTIONS = [
  { id: 1, question: "İlk aracım hangisi?", options: ["Rks azure", "Küba trendy", "Anadol", "R250"], correct: "Küba trendy" },
  { id: 2, question: "İlk araba kazam ne zaman?", options: ["2014", "2015 ", "2016", "2017"], correct: "2016" },
  { id: 3, question: "Hangi ilk okulda okumadım?", options: ["Gülüç vesile dikmen", "Erdemir ilköğretim", "Atatürk ilköğretim", "Cumhuriyet ilköğretim"], correct: "Atatürk ilköğretim" },
  { id: 4, question: "Resmi olarak kaç aracım oldu?", options: ["1", "2", "3", "4"], correct: "4" },
  { id: 5, question: "Köyümün adı ne(Anne tarafı)?", options: ["Göktepe", "Ören", "Kıyıcak", "kılçak"], correct: "Kıyıcak" },
  { id: 6, question: "İlk şirketimizin adı neydi?", options: ["rockter", "Balonsuz hava", "Highigh", "Hemdem"], correct: "Hemdem" },
  { id: 7, question: "İlk kayıt olduğum lise?", options: ["AAL", "AÖL", "GİİAL", "KYAL"], correct: "AÖL" },
  { id: 8, question: "Arabamın plakasının son rakamları ne?", options: ["087", "071", "324", "467"], correct: "071" },
  { id: 9, question: "Hangi mahallede oturmadım ?", options: ["Ömerli", "Gülüç", "Kepez", "Kavaklık"], correct: "Kepez" },
  { id: 10, question: "İlk girdiğim iş?", options: ["Garson", "Kurye", "Elektrikçi", "Komi"], correct: "Elektrikçi" },
  { id: 11, question: "Annemin adı ne?", options: ["Meryem", "Zeliha", "Zeynep", "Melek"], correct: "Zeynep" },
  { id: 12, question: "Hangi ilde kaza yapmadım?", options: ["İzmir", "Ankara", "Zonguldak", "Kocaeli"], correct: "Kocaeli" },
  { id: 13, question: "İlk üniversitem hangisi?", options: ["9Eylül", "Bülent ecevit", "Ege", "Anadolu"], correct: "Ege" },
  { id: 14, question: "İlk bilgisayarımı kim verdi?", options: ["Komşum", "Patronum", "Resim öğretmenim", "Arkadaşım"], correct: "Resim öğretmenim" },
  { id: 15, question: "Hangisine katılmadım?", options: ["Ülkü ocakları", "Ak gençlik", "TKP", "CGK"], correct: "CGK" },
  { id: 16, question: "İlk hayvanımın adı?", options: ["Azat", "Cabbar", "Gölge", "Şase"], correct: "Azat" },
  { id: 17, question: "Hangisi yazdığım kitabın adıdır?", options: ["Delinin delisi", "Aydaki ağaç", "Şarap sorgusu", "Her zaman yalnız"], correct: "Şarap sorgusu" },
  { id: 18, question: "Hangi şekilde kaza yapmadım?", options: ["Uyuya kalarak", "Takla atarak", "Ağaca çarparak", "Dereye düşerek"], correct: "Dereye düşerek" },
  { id: 19, question: "Hangisi ile tokalaşmadım?", options: ["Recep tayip erdoğan", "Kemal kılıçdaroğlu", "Devlet bahçeli", "Muharrem İnce"], correct: "Kemal kılıçdaroğlu" },
  { id: 20, question: "Kan grubum ne?", options: ["A+", "AB+", "AB-", "A-"], correct: "A-" },
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
