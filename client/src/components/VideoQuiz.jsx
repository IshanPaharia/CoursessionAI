import { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, CheckCircle2, XCircle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuiz, useGenerateQuiz, useSubmitQuiz } from '../hooks/useQuizzes';

export default function VideoQuiz({ videoId }) {
  const { data, isLoading } = useQuiz(videoId);
  const generateQuiz = useGenerateQuiz();
  const submitQuiz = useSubmitQuiz();
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const hasGeneratedRef = useRef({});

  const quiz = data?.quiz;
  const questions = quiz?.questions || [];

  useEffect(() => {
    if (!isLoading && !quiz && !generateQuiz.isPending && !hasGeneratedRef.current[videoId]) {
      hasGeneratedRef.current[videoId] = true;
      generateQuiz.mutate(videoId);
    }
  }, [videoId, isLoading, quiz, generateQuiz.isPending]);

  const handleGenerate = (e) => {
    e.stopPropagation();
    setSelectedAnswers({});
    setSubmitted(false);
    setResult(null);
    generateQuiz.mutate(videoId);
    setIsExpanded(true);
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
      <div className="card-warm">
        <div 
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Video Quiz</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-gray-400 group-hover:text-white transition-colors">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 border-t border-white/[0.04]">
            {(isLoading || generateQuiz.isPending) ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500/50 mb-3" />
                <p className="text-xs text-gray-500">Generating quiz questions focused on this video...</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card-warm">
      <div 
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">
            Video Quiz
            {submitted && result && (
              <span className="ml-2 text-amber-400">
                Score: {result.score}/{result.totalQuestions}
              </span>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={generateQuiz.isPending}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/20 disabled:opacity-50"
          >
            {generateQuiz.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            {generateQuiz.isPending ? 'Generating...' : 'New Quiz'}
          </button>
          <div className="text-gray-400 group-hover:text-white transition-colors">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 border-t border-white/[0.04]">
          <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="rounded-xl border border-white/[0.06] p-3 sm:p-4" style={{ backgroundColor: 'rgba(13, 13, 20, 0.5)' }}>
                <p className="mb-2.5 text-sm font-medium text-white">
                  {qIndex + 1}. {q.question}
                </p>
                <div className="space-y-1.5 sm:space-y-2">
                  {q.options.map((option, oIndex) => {
                    const isSelected = selectedAnswers[qIndex] === oIndex;
                    const isCorrect = submitted && oIndex === q.correctAnswer;
                    const isWrong = submitted && isSelected && oIndex !== q.correctAnswer;

                    let classes = 'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all cursor-pointer ';
                    if (isCorrect) {
                      classes += 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400';
                    } else if (isWrong) {
                      classes += 'bg-red-500/10 border border-red-500/30 text-red-400';
                    } else if (isSelected) {
                      classes += 'bg-amber-500/10 border border-amber-500/30 text-amber-400';
                    } else {
                      classes += 'border border-white/[0.06] text-gray-300 hover:border-white/10 hover:bg-white/[0.03]';
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
                          <div className={`h-4 w-4 shrink-0 rounded-full border-2 transition-colors ${
                            isSelected ? 'border-amber-400 bg-amber-400' : 'border-gray-600'
                          }`} />
                        )}
                        <span className="text-left">{option}</span>
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
              className="mt-4 btn-primary w-full py-2.5 justify-center disabled:opacity-50"
            >
              {submitQuiz.isPending ? 'Submitting...' : 'Submit Answers'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
