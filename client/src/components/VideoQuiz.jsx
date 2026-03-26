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
      <div className="brutal-card bg-[#ff99e6] p-0 overflow-hidden text-black transition-all">
        <div 
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer group bg-white border-b-[3px] border-black"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 stroke-[2.5px]" />
            <h3 className="text-base font-black uppercase tracking-widest text-black">Video Quiz</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-black bg-[#ff99e6] border-[2px] border-black p-1 brutal-shadow-sm group-hover:-translate-y-0.5 transition-transform">
              {isExpanded ? <ChevronUp className="h-5 w-5 stroke-[3px]" /> : <ChevronDown className="h-5 w-5 stroke-[3px]" />}
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
            {(isLoading || generateQuiz.isPending) ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-black stroke-[3px] mb-3" />
                <p className="text-sm font-bold uppercase text-black">Generating quiz questions focused on this video...</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="brutal-card bg-[#ff99e6] p-0 overflow-hidden text-black transition-all">
      <div 
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer group bg-white border-b-[3px] border-black"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 stroke-[2.5px]" />
          <h3 className="text-base font-black uppercase tracking-widest text-black flex items-center gap-3">
            Video Quiz
            {submitted && result && (
              <span className="bg-[#facc15] px-2 py-0.5 border-[2px] border-black brutal-shadow-sm text-sm">
                SCORE: {result.score}/{result.totalQuestions}
              </span>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={generateQuiz.isPending}
            className="hidden sm:flex items-center gap-1.5 border-[2px] border-black bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-black transition-transform hover:-translate-y-0.5 hover:-translate-x-0.5 brutal-shadow-sm disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
          >
            {generateQuiz.isPending ? (
              <Loader2 className="h-4 w-4 stroke-[3px] animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 stroke-[3px]" />
            )}
            {generateQuiz.isPending ? 'Generating...' : 'New Quiz'}
          </button>
          <div className="text-black bg-[#ff99e6] border-[2px] border-black p-1 brutal-shadow-sm group-hover:-translate-y-0.5 transition-transform">
            {isExpanded ? <ChevronUp className="h-5 w-5 stroke-[3px]" /> : <ChevronDown className="h-5 w-5 stroke-[3px]" />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 sm:px-5 pb-5 pt-0">
          <div className="space-y-4 sm:space-y-5 pt-4 sm:pt-5">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="bg-white border-[3px] border-black p-4 sm:p-5 brutal-shadow-sm">
                <p className="mb-4 text-base font-black uppercase tracking-wide text-black leading-snug">
                  {qIndex + 1}. {q.question}
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {q.options.map((option, oIndex) => {
                    const isSelected = selectedAnswers[qIndex] === oIndex;
                    const isCorrect = submitted && oIndex === q.correctAnswer;
                    const isWrong = submitted && isSelected && oIndex !== q.correctAnswer;

                    let classes = 'flex items-center gap-3 border-[2px] border-black px-4 py-3 text-sm font-bold transition-transform cursor-pointer ';
                    if (isCorrect) {
                      classes += 'bg-emerald-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]';
                    } else if (isWrong) {
                      classes += 'bg-red-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]';
                    } else if (isSelected) {
                      classes += 'bg-[#ff8c00] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]';
                    } else {
                      classes += 'bg-gray-50 text-black hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]';
                    }

                    return (
                      <button
                        key={oIndex}
                        onClick={() => handleSelect(qIndex, oIndex)}
                        className={classes}
                        disabled={submitted}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 stroke-[3px]" />
                        ) : isWrong ? (
                          <XCircle className="h-5 w-5 shrink-0 stroke-[3px]" />
                        ) : (
                          <div className={`h-5 w-5 shrink-0 rounded-none border-[2px] border-black transition-colors ${
                            isSelected ? 'bg-black' : 'bg-white'
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
              className="mt-6 btn-primary w-full py-3.5 justify-center bg-white text-black text-lg disabled:opacity-50"
            >
              {submitQuiz.isPending ? 'SUBMITTING...' : 'SUBMIT ANSWERS'}
            </button>
          )}

          {/* Mobile generated button */}
          <button
            onClick={handleGenerate}
            disabled={generateQuiz.isPending}
            className="mt-4 sm:hidden flex w-full items-center justify-center gap-2 border-[2px] border-black bg-white px-4 py-3 text-sm font-bold uppercase tracking-widest text-black transition-transform hover:-translate-y-0.5 hover:-translate-x-0.5 brutal-shadow-sm disabled:opacity-50"
          >
            {generateQuiz.isPending ? (
              <Loader2 className="h-5 w-5 stroke-[3px] animate-spin" />
            ) : (
              <RotateCcw className="h-5 w-5 stroke-[3px]" />
            )}
            {generateQuiz.isPending ? 'Generating...' : 'New Quiz'}
          </button>
        </div>
      )}
    </div>
  );
}
