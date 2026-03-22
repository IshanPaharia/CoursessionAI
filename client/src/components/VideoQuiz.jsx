import { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { useQuiz, useGenerateQuiz, useSubmitQuiz } from '../hooks/useQuizzes';

export default function VideoQuiz({ videoId }) {
  const { data } = useQuiz(videoId);
  const generateQuiz = useGenerateQuiz();
  const submitQuiz = useSubmitQuiz();
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const quiz = data?.quiz;
  const questions = quiz?.questions || [];

  const handleGenerate = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setResult(null);
    generateQuiz.mutate(videoId);
  };

  const handleSelect = (qIndex, optionIndex) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmit = () => {
    if (!quiz) return;
    const answers = questions.map((_, i) => selectedAnswers[i] ?? -1);
    submitQuiz.mutate(
      { quizId: quiz.id, answers },
      {
        onSuccess: (data) => {
          setResult(data);
          setSubmitted(true);
        },
      }
    );
  };

  if (!quiz) {
    return (
      <div className="rounded-xl border border-white/5 bg-[#111118] p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-300">Quiz</h3>
          <button
            onClick={handleGenerate}
            disabled={generateQuiz.isPending}
            className="flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-400 transition-colors hover:bg-purple-500/20 disabled:opacity-50"
          >
            {generateQuiz.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            Generate Quiz
          </button>
        </div>
        {generateQuiz.isPending && (
          <p className="mt-3 text-xs text-gray-500">Generating quiz questions...</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/5 bg-[#111118] p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">
          Quiz {submitted && result && (
            <span className="ml-2 text-purple-400">
              Score: {result.score}/{result.totalQuestions}
            </span>
          )}
        </h3>
        <button
          onClick={handleGenerate}
          disabled={generateQuiz.isPending}
          className="flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-gray-400 hover:text-white"
        >
          <RotateCcw className="h-3 w-3" />
          New Quiz
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="rounded-lg border border-white/5 bg-[#0d0d14] p-3">
            <p className="mb-2 text-sm font-medium text-white">
              {qIndex + 1}. {q.question}
            </p>
            <div className="space-y-1.5">
              {q.options.map((option, oIndex) => {
                const isSelected = selectedAnswers[qIndex] === oIndex;
                const isCorrect = submitted && oIndex === q.correctAnswer;
                const isWrong = submitted && isSelected && oIndex !== q.correctAnswer;

                let classes = 'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer ';
                if (isCorrect) {
                  classes += 'bg-green-500/10 border border-green-500/30 text-green-400';
                } else if (isWrong) {
                  classes += 'bg-red-500/10 border border-red-500/30 text-red-400';
                } else if (isSelected) {
                  classes += 'bg-purple-500/10 border border-purple-500/30 text-purple-400';
                } else {
                  classes += 'border border-white/5 text-gray-300 hover:border-white/10 hover:bg-white/5';
                }

                return (
                  <button
                    key={oIndex}
                    onClick={() => handleSelect(qIndex, oIndex)}
                    className={classes}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : isWrong ? (
                      <XCircle className="h-4 w-4 shrink-0" />
                    ) : (
                      <div className={`h-4 w-4 shrink-0 rounded-full border ${isSelected ? 'border-purple-400 bg-purple-400' : 'border-gray-600'}`} />
                    )}
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(selectedAnswers).length < questions.length || submitQuiz.isPending}
          className="mt-4 w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitQuiz.isPending ? 'Submitting...' : 'Submit Answers'}
        </button>
      )}
    </div>
  );
}
