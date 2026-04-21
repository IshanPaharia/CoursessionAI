import { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, CheckCircle2, XCircle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuiz, useGenerateQuiz, useSubmitQuiz } from '../hooks/useQuizzes';

export default function VideoQuiz({ videoId }) {
  const { data, isLoading } = useQuiz(videoId);
  const { mutate: generateQuiz, isPending: isGeneratingQuiz } = useGenerateQuiz();
  const submitQuiz = useSubmitQuiz();
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const hasGeneratedRef = useRef({});

  const quiz = data?.quiz;
  const questions = quiz?.questions || [];

  useEffect(() => {
    if (!isLoading && !quiz && !isGeneratingQuiz && !hasGeneratedRef.current[videoId]) {
      hasGeneratedRef.current[videoId] = true;
      generateQuiz(videoId);
    }
  }, [videoId, isLoading, quiz, isGeneratingQuiz, generateQuiz]);

  const handleGenerate = (e) => {
    e.stopPropagation();
    setSelectedAnswers({});
    setSubmitted(false);
    setResult(null);
    generateQuiz(videoId);
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
      <div className="learning-card p-0 overflow-hidden transition-all bg-surface">
        <div 
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold tracking-tight">Video Quiz</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-on-surface-variant p-1 rounded-sm group-hover:bg-surface-container transition-colors">
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 border-t border-outline-variant">
            {(isLoading || isGeneratingQuiz) ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-on-surface-variant">
                <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
                <p className="text-sm font-medium">Generating quiz questions focused on this video...</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="learning-card p-0 overflow-hidden transition-all bg-surface">
      <div 
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold tracking-tight flex items-center gap-3">
            Video Quiz
            {submitted && result && (
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-sm text-sm font-medium">
                Score: {result.score}/{result.totalQuestions}
              </span>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={isGeneratingQuiz}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-outline-variant hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            {isGeneratingQuiz ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            {isGeneratingQuiz ? 'Generating...' : 'New Quiz'}
          </button>
          <div className="text-on-surface-variant p-1 rounded-sm group-hover:bg-surface-container transition-colors">
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 sm:px-5 pb-5 pt-0 border-t border-outline-variant">
          <div className="space-y-6 sm:space-y-8 pt-4 sm:pt-6">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="bg-surface rounded-md">
                <p className="mb-4 text-base font-medium leading-relaxed">
                  {qIndex + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((option, oIndex) => {
                    const isSelected = selectedAnswers[qIndex] === oIndex;
                    const isCorrect = submitted && oIndex === q.correctAnswer;
                    const isWrong = submitted && isSelected && oIndex !== q.correctAnswer;

                    let classes = 'flex items-center gap-3 border px-4 py-3 text-sm font-medium transition-all rounded-md cursor-pointer ';
                    if (isCorrect) {
                      classes += 'bg-green-50 text-green-700 border-green-500 shadow-sm';
                    } else if (isWrong) {
                      classes += 'bg-red-50 text-red-700 border-red-500 shadow-sm';
                    } else if (isSelected) {
                      classes += 'bg-primary/5 text-primary border-primary shadow-sm';
                    } else {
                      classes += 'bg-surface text-on-surface border-outline-variant hover:border-primary/50 hover:bg-surface-container';
                    }

                    return (
                      <button
                        key={oIndex}
                        onClick={() => handleSelect(qIndex, oIndex)}
                        className={classes}
                        disabled={submitted}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                        ) : isWrong ? (
                          <XCircle className="h-5 w-5 shrink-0 text-red-600" />
                        ) : (
                          <div className={`h-4 w-4 shrink-0 rounded-full border transition-colors ${
                            isSelected ? 'border-primary border-4' : 'border-outline-variant'
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
              className="mt-8 btn-primary w-full py-3.5 justify-center flex text-sm disabled:opacity-50"
            >
              {submitQuiz.isPending ? 'Submitting...' : 'Submit Answers'}
            </button>
          )}

          {/* Mobile generated button */}
          <button
            onClick={handleGenerate}
            disabled={isGeneratingQuiz}
            className="mt-4 sm:hidden flex w-full items-center justify-center gap-2 border border-outline-variant bg-surface px-4 py-3 text-sm font-medium rounded-md hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            {isGeneratingQuiz ? (
              <Loader2 className="h-4 w-4 animate-spin text-on-surface-variant" />
            ) : (
              <RotateCcw className="h-4 w-4 text-on-surface-variant" />
            )}
            {isGeneratingQuiz ? 'Generating...' : 'New Quiz'}
          </button>
        </div>
      )}
    </div>
  );
}
