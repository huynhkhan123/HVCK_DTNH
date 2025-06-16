import { useState } from 'react';

const QuestionCard = ({ 
  question, 
  onNext, 
  onPrevious,
  onAnswered,
  isFirst,
  isLast,
  className = ''
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = () => {
    if (!userAnswer.trim()) return;

    setIsChecking(true);
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = question.answer.trim().toLowerCase();
    
    const isAnswerCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    setAttempts(prev => prev + 1);

    if (onAnswered) {
      onAnswered(question, userAnswer, isAnswerCorrect, attempts + 1);
    }

    setTimeout(() => setIsChecking(false), 300);
  };

  const handleNext = () => {
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setAttempts(0);
    onNext();
  };

  const handlePrevious = () => {
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setAttempts(0);
    onPrevious();
  };

  const handleTryAgain = () => {
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
  };

  return (
    <div className={`question-card ${className} ${isChecking ? 'checking' : ''}`}>
      <div className="question-header">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Sentence Transformation</h2>
          {attempts > 0 && (
            <span className={`attempts-badge ${isCorrect ? 'success' : ''}`}>
              {attempts} attempt{attempts > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: isCorrect ? '100%' : '0%' }}
            />
          </div>
          <div className="progress-label">
            <span>Progress</span>
            <span>{isCorrect ? 'Completed' : 'In Progress'}</span>
          </div>
        </div>

        <p className="question-text">{question.question}</p>
        {question.hint && <div className="hint">{question.hint}</div>}
      </div>

      <div className="answer-section">
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className={`answer-input ${isCorrect ? 'success' : ''}`}
          placeholder="Type your answer here..."
          disabled={isCorrect}
        />

        <div className="button-group">
          {!showResult && (
            <button
              onClick={handleCheck}
              className="button button-primary"
              disabled={!userAnswer.trim() || isChecking}
            >
              Check Answer
            </button>
          )}

          {showResult && isCorrect && (
            <div className="success-container animate-success">
              <div className="success-header">
                <span className="success-icon">✓</span>
                <h3>Excellent!</h3>
              </div>
              <div className="success-content">
                <p><strong>Your answer is correct!</strong></p>
                {question.translation && (
                  <div className="translation-box">
                    <strong>Translation:</strong>
                    <p>{question.translation}</p>
                  </div>
                )}
                {question.explanation && (
                  <div className="explanation-box">
                    <strong>Explanation:</strong>
                    <p>{question.explanation}</p>
                  </div>
                )}
              </div>
              {!isLast && (
                <button
                  onClick={handleNext}
                  className="button button-success"
                >
                  Continue →
                </button>
              )}
            </div>
          )}

          {showResult && !isCorrect && (
            <div className="error-container animate-error">
              <h3>Not quite right</h3>
              <p>Try again!</p>
              <button
                onClick={handleTryAgain}
                className="button button-retry"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        <div className="navigation-controls">
          <button
            onClick={handlePrevious}
            className={`nav-button ${isFirst ? 'disabled' : ''}`}
            disabled={isFirst}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className={`nav-button ${isLast ? 'disabled' : ''}`}
            disabled={isLast}
          >
            <span>Next</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
