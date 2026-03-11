import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { ChevronLeft, CheckCircle2, XCircle } from "lucide-react";
import {
  getAvailableAsmaNumbers,
  generateQuiz,
  saveQuizResult,
  type QuizQuestion,
  type QuizResult,
} from "../services/quizService";

const BG_STYLE = {
  backgroundImage: "url('/masjid1.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
};

const glass = {
  background: "rgba(255,255,255,0.1)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.18)",
};

const glassDark = {
  background: "rgba(0,0,0,0.3)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.1)",
};

export default function Quiz() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const initQuiz = async () => {
      try {
        const asmaNumbers = await getAvailableAsmaNumbers();
        if (asmaNumbers.length === 0) {
          setLoading(false);
          return;
        }
        const generatedQuestions = generateQuiz(asmaNumbers);
        setQuestions(generatedQuestions);
      } catch (error) {
        console.error("Қате пайда болды:", error);
      } finally {
        setLoading(false);
      }
    };

    initQuiz();
  }, [user, navigate]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectAnswer = (answer: string) => {
    if (!showResults) {
      setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: answer });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishQuiz = async () => {
    let correctCount = 0;
    const answers = questions.map((q) => {
      const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
      if (isCorrect) correctCount++;
      return { questionId: q.id, selected: selectedAnswers[q.id] || "", correct: q.correctAnswer, isCorrect };
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    setScore(correctCount);

    const result: QuizResult = {
      date: new Date().toISOString().split("T")[0],
      score: correctCount,
      total: questions.length,
      percentage,
      answers,
    };

    try {
      await saveQuizResult(result);
    } catch (error) {
      console.error("Нәтижені сақтау кезінде қате:", error);
    }

    setShowResults(true);
  };

  // Back button component
  const BackButton = () => (
    <button
      onClick={() => navigate("/dashboard")}
      className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
    >
      <ChevronLeft size={20} />
      Артқа
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen relative" style={BG_STYLE}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 px-4 pt-12">
          <div className="h-5 w-16 bg-white/20 rounded animate-pulse mb-6" />
          <div className="flex justify-between mb-2">
            <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
            <div className="h-4 w-10 bg-white/20 rounded animate-pulse" />
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mb-6 animate-pulse" />
          <div className="rounded-2xl p-6" style={glass}>
            <div className="h-8 w-8 bg-white/20 rounded animate-pulse mb-4" />
            <div className="h-6 w-full bg-white/20 rounded animate-pulse mb-2" />
            <div className="h-6 w-3/4 bg-white/15 rounded animate-pulse mb-6" />
            <div className="space-y-3 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 w-full bg-white/10 rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-white/10 rounded-xl animate-pulse" />
              <div className="flex-1 h-12 bg-white/15 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen relative" style={BG_STYLE}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 px-4 pt-12">
          <BackButton />
        </div>
        <div className="relative z-10 px-4 text-center mt-20">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-2xl font-bold text-white mb-2">Есімдер әлі жоқ</h2>
          <p className="text-white/60 mb-6">Куизге өту үшін алдымен Алланың 99 есімін үйрену қажет</p>
          <button
            onClick={() => navigate("/asma")}
            className="px-6 py-3 rounded-xl font-semibold text-white transition-all active:scale-95"
            style={glass}
          >
            Есімдерді үйрену →
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen relative pb-10" style={BG_STYLE}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 px-4 pt-12">
          <BackButton />
          <div className="rounded-3xl p-6" style={glass}>
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">
                {score === questions.length ? "🎉" : score >= 7 ? "👏" : "💪"}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Куиз аяқталды!</h2>
              <div className="text-5xl font-bold text-white my-3">{score}/{questions.length}</div>
              <p className="text-white/60 text-lg">{Math.round((score / questions.length) * 100)}%</p>
              <button
                onClick={() => navigate("/community", { state: { tab: "quiz" } })}
                className="mt-4 w-full py-3 rounded-xl font-semibold text-white transition-all active:scale-95"
                style={{ background: "rgba(99,60,200,0.35)", border: "1px solid rgba(139,92,246,0.5)" }}
              >
                🏆 Рейтингті көру
              </button>
            </div>

            <div className="space-y-2 mb-6">
              {questions.map((q, idx) => {
                const answer = selectedAnswers[q.id];
                const isCorrect = answer === q.correctAnswer;
                return (
                  <div
                    key={q.id}
                    className="p-3 rounded-xl text-left"
                    style={isCorrect
                      ? { background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.3)" }
                      : { background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)" }
                    }
                  >
                    <div className="flex items-start gap-3">
                      {isCorrect
                        ? <CheckCircle2 size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                        : <XCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                      }
                      <div className="flex-1 text-sm">
                        <p className="font-semibold text-white">
                          {idx + 1}. {q.type === "name-to-meaning" ? q.kazakhName : q.meaning}
                        </p>
                        <p className="text-white/60">
                          Таңдаған:{" "}
                          <span className={isCorrect ? "text-green-400 font-semibold" : "text-red-400"}>
                            {answer}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-white/60">
                            Дұрыс: <span className="text-green-400 font-semibold">{q.correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all active:scale-95"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              Қайта бастау
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={BG_STYLE}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 px-4 pt-12">
        <BackButton />

        {/* Progress */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-white/80">
              Сұрақ {currentQuestionIndex + 1}/{questions.length}
            </span>
            <span className="text-sm text-white/50">
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="rounded-2xl p-5" style={glass}>
          <div className="text-2xl mb-3">
            {currentQuestion.type === "name-to-meaning" ? "📖" : "✨"}
          </div>
          <h3 className="text-lg font-bold text-white mb-5">
            {currentQuestion.type === "name-to-meaning"
              ? `"${currentQuestion.kazakhName}" дегеннің мағынасы қандай?`
              : `"${currentQuestion.meaning}" дегеннің есімі қандай?`}
          </h3>

          {/* Options */}
          <div className="space-y-2 mb-5">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswers[currentQuestion.id] === option;
              const isCorrect = option === currentQuestion.correctAnswer;

              let optionStyle: React.CSSProperties;
              if (isSelected && isCorrect) {
                optionStyle = { background: "rgba(34,197,94,0.35)", border: "1px solid rgba(34,197,94,0.6)" };
              } else if (isSelected && !isCorrect) {
                optionStyle = { background: "rgba(239,68,68,0.35)", border: "1px solid rgba(239,68,68,0.6)" };
              } else if (!isSelected && isCorrect && showResults) {
                optionStyle = { background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)" };
              } else {
                optionStyle = glassDark;
              }

              return (
                <button
                  key={option}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={!!selectedAnswers[currentQuestion.id]}
                  className="w-full p-3.5 rounded-xl text-left font-medium text-white transition-all active:scale-98 disabled:cursor-default"
                  style={optionStyle}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex-1 py-3 rounded-xl font-semibold text-white/70 disabled:opacity-30 transition-all"
              style={glassDark}
            >
              ← Артқа
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={!selectedAnswers[currentQuestion.id]}
              className="flex-1 py-3 rounded-xl font-semibold text-white disabled:opacity-30 transition-all"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
            >
              {currentQuestionIndex === questions.length - 1 ? "Бітір" : "Алға →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
