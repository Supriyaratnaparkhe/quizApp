import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./QuizPage.module.css";

const QuizzePage = () => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    // Fetch quiz data from the backend
    axios
      .get("http://localhost:3001/quiz/65b15a2a2f679ef6a3440791")
      .then((response) => setQuizData(response.data.quiz))
      .catch((error) => console.error("Error fetching quiz data", error));
  }, []);

  useEffect(() => {
    const currentQuestion = quizData?.questions[currentQuestionIndex];
    if (currentQuestion?.timer > 0) {
      // Start the countdown for questions with a timer
      setCountdown(currentQuestion.timer);
      const countdownInterval = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown === 1) {
            // Auto-submit on reaching 0 seconds
            handleNextQuestion();
            clearInterval(countdownInterval);
            return 0; // Reset countdown to 0
          } else {
            return prevCountdown - 1;
          }
        });
      }, 1000);

      // Clean up the interval when component unmounts or when moving to the next question
      return () => {
        clearInterval(countdownInterval);
      };
    } else {
      // Reset countdown when moving to a question without a timer
      setCountdown(null);
    }
  }, [currentQuestionIndex, quizData]);

  const handleOptionClick = (option) => {
    setSelectedOptions((prevOptions) => {
      const newOptions = [...prevOptions];
      newOptions[currentQuestionIndex] = option;
      return newOptions;
    });
  };

  const handleNextQuestion = () => {
    // Submit the selected option to the backend (adjust endpoint accordingly)
    const currentQuestion = quizData.questions[currentQuestionIndex];
    axios
      .post("http://localhost:3001/submit-response", {
        questionId: currentQuestion._id,
        selectedOption: selectedOptions[currentQuestionIndex],
      })
      .then((response) => {
        console.log("Response submitted successfully", response.data);
      })
      .catch((error) => {
        console.error("Error submitting response", error);
      });

    // Move to the next question
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubmit = () => {
    // Submit the final set of responses to the backend
    const userResponses = quizData.questions.map((question, index) => {
      return {
        questionId: question._id,
        selectedOption: selectedOptions[index],
      };
    });

    axios
      .post("http://localhost:3001/submit-quiz", { responses: userResponses })
      .then((response) => {
        console.log("Quiz submitted successfully", response.data);
      })
      .catch((error) => {
        console.error("Error submitting quiz", error);
      });
  };

  if (!quizData) {
    return <div>Loading...</div>;
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];

  return (
    <div className={styles.main}>
      <center>
        <div className={styles.quizContainer}>
          <div className={styles.quizeheader}>
            <div className={styles.questionNumber}>
              {currentQuestionIndex + 1}/{quizData.questions.length}
            </div>
            {currentQuestion.timer > 0 && (
              <div className={styles.questionTimer}>
                {formatTime(countdown)}s
              </div>
            )}
          </div>
          <p className={styles.quizTitle}>{currentQuestion.questionText}</p>
          <div className={styles.optionsContainer}>
            {currentQuestion.options.map((option) => (
              <div
                key={option._id}
                className={`${styles.optionButton} ${
                  selectedOptions[currentQuestionIndex] === option.optionText
                    ? styles.selected
                    : ""
                }`}
                onClick={() => handleOptionClick(option.optionText)}
              >
                {option.optionText}
              </div>
            ))}
          </div>
          <div className={styles.nextContainer}>
            {currentQuestionIndex < quizData.questions.length - 1 ? (
              <button
                className={styles.nextButton}
                onClick={handleNextQuestion}
              >
                NEXT
              </button>
            ) : (
              <button className={styles.nextButton} onClick={handleSubmit}>
                SUBMIT
              </button>
            )}
          </div>
        </div>
      </center>
    </div>
  );
};

export default QuizzePage;
