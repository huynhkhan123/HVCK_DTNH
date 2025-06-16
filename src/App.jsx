import { useState, useEffect } from 'react';
import QuestionCard from './components/QuestionCard';
import './styles/modern.css';
import './styles/animations.css';

const TABS = [
  { id: 'written', label: 'WRITTEN', icon: '✍️' },
  { id: 'reading', label: 'READING', icon: '📖' },
  { id: 'listening', label: 'LISTENING', icon: '🎧' }
];

function App() {
  const [activeTab, setActiveTab] = useState('written');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [viewingIndex, setViewingIndex] = useState(0);
  const [error, setError] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    fetch('/questions.json')
      .then(response => response.json())
      .then(data => {
        setQuestions(data.questions);
        setIsLoading(false);
      })
      .catch(error => {
        setError('Error loading questions: ' + error.message);
        setIsLoading(false);
      });
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.questions && Array.isArray(data.questions)) {
            setQuestions(data.questions);
            setCurrentQuestionIndex(0);
            setViewingIndex(0);
            setAnsweredQuestions([]);
          } else {
            setError('Invalid file format. File must contain a "questions" array.');
          }
        } catch (error) {
          setError('Error parsing JSON file: ' + error.message);
        }
        setIsLoading(false);
      };
      reader.readAsText(file);
    }
  };

  const handleNext = () => {
    if (viewingIndex < questions.length - 1) {
      setViewingIndex(viewingIndex + 1);
      setCurrentQuestionIndex(viewingIndex + 1);
    } else {
      setViewingIndex(0);
      setCurrentQuestionIndex(0);
    }
  };

  const handlePrevious = () => {
    if (viewingIndex > 0) {
      setViewingIndex(viewingIndex - 1);
    }
  };

  const handleReturnToCurrent = () => {
    setViewingIndex(currentQuestionIndex);
  };

  const handleQuestionAnswered = (question, userAnswer, isCorrect, attempts) => {
    const timestamp = new Date();
    setAnsweredQuestions(prev => {
      const existingIndex = prev.findIndex(q => q.question === question.question);
      const updatedAnswer = {
        ...question,
        userAnswer,
        isCorrect,
        attempts,
        answeredAt: timestamp
      };

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = updatedAnswer;
        return updated;
      }
      return [...prev, updatedAnswer];
    });
  };

  const handleHistoryItemClick = (item, index) => {
    setSelectedHistoryItem(item);
    setViewingIndex(index);
  };

  const handleTabChange = (tabId) => {
    if (tabId !== 'written') {
      alert('This feature is coming soon!');
      return;
    }
    setActiveTab(tabId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'written':
        return (
          <div className="main-content">
            <div className={`questions-container ${showHistory ? 'with-history' : ''}`}>
              {questions.length > 0 ? (
                <QuestionCard
                  key={viewingIndex}
                  question={questions[viewingIndex]}
                  onAnswered={handleQuestionAnswered}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  isFirst={viewingIndex === 0}
                  isLast={viewingIndex === questions.length - 1}
                  answeredQuestions={answeredQuestions}
                  className="animate-scale-in delay-200"
                />
              ) : (
                <div className="upload-prompt animate-fade-in">
                  <div className="upload-icon">📚</div>
                  <h2>Ready to Practice?</h2>
                  <p>Upload a JSON file with questions to get started!</p>
                </div>
              )}
            </div>

            {showHistory && answeredQuestions.length > 0 && (
              <div className="history-panel animate-slide-in-right">
                <div className="history-header">
                  <h2>History</h2>
                  <div className="history-actions">
                    <div className="history-stats">
                      <span className="correct-count">
                        {answeredQuestions.filter(q => q.isCorrect).length}
                      </span>
                      <span className="divider">/</span>
                      <span className="total-count">{answeredQuestions.length}</span>
                      <span> Correct</span>
                    </div>
                    <button 
                      className="history-close"
                      onClick={() => setShowHistory(false)}
                      aria-label="Close history"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="history-list">
                  {answeredQuestions.map((item, index) => (
                    <div
                      key={index}
                      className={`history-item ${
                        viewingIndex === questions.findIndex(
                          q => q.question === item.question
                        )
                          ? 'active'
                          : ''
                      }`}
                      onClick={() => handleHistoryItemClick(
                        item,
                        questions.findIndex(q => q.question === item.question)
                      )}
                    >
                      <div className="history-item-content">
                        <div className="history-item-header">
                          <span className={`status-badge ${item.isCorrect ? 'success' : 'error'}`}>
                            {item.isCorrect ? '✓' : '✗'}
                          </span>
                          <span className="attempt-count">
                            {item.attempts} attempt{item.attempts > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="history-question">{item.question}</p>
                        <div className={`history-result ${item.isCorrect ? 'success' : 'error'}`}>
                          <p><strong>Your answer:</strong> {item.userAnswer}</p>
                          {item.isCorrect && (
                            <>
                              {item.translation && (
                                <p className="translation">
                                  <strong>Translation:</strong> {item.translation}
                                </p>
                              )}
                              {item.explanation && (
                                <p className="explanation">
                                  <strong>Explanation:</strong> {item.explanation}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'reading':
      case 'listening':
        return (
          <div className="development-screen animate-fade-in">
            <div className="development-content">
              <div className="development-icon">
                {activeTab === 'reading' ? '📖' : '🎧'}
              </div>
              <h2>{activeTab === 'reading' ? 'Reading Practice' : 'Listening Practice'}</h2>
              <p className="development-message">
                This feature is currently under development. We're working hard to bring you an amazing learning experience!
              </p>
              <div className="development-features">
                <h3>Coming Soon:</h3>
                {activeTab === 'reading' ? (
                  <ul>
                    <li>📝 Comprehensive reading passages</li>
                    <li>❓ Multiple choice questions</li>
                    <li>🎯 Gap filling exercises</li>
                    <li>⏱️ Timed reading challenges</li>
                  </ul>
                ) : (
                  <ul>
                    <li>🔊 Audio comprehension exercises</li>
                    <li>🗣️ Pronunciation practice</li>
                    <li>📝 Dictation challenges</li>
                    <li>🎵 Various English accents</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="container animate-fade-in">
        <div className="error-message animate-slide-up delay-100">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container animate-fade-in">
        <div className="loading-container loading-pulse">
          <div className="loading-spinner loading-spin"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="header animate-fade-in">
        <h1 className="animate-slide-up">Quick Check</h1>
        <div className="tabs-container animate-slide-up delay-100">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'written' && (
          <div className="controls animate-slide-up delay-200">
            <label className="file-upload-label hover-lift">
              <span>📂 {questions.length ? 'Change Questions' : 'Upload Questions'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
            {questions.length > 0 && (
              <>
                <div className="question-counter">
                  <span>📝</span> Question {viewingIndex + 1} of {questions.length}
                </div>
                <button 
                  className={`history-toggle ${showHistory ? 'active' : ''}`}
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <span className="history-toggle-icon">📋</span>
                  {showHistory ? 'Hide History' : 'Show History'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {renderContent()}
    </div>
  );
}

export default App;
