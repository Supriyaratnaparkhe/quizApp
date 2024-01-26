import styles from "./EditQuiz.module.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import del from "../assets/delete.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { handleShareClick } from "../../utils/share";

const EditQuizForm = ({ onClose, userId, quizId }) => {
  //   const [firstPage, setFirstPage] = useState(true);
  const [secondPage, setSecondPage] = useState(true);
  const [thirdPage, setThirdPage] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  //   const [selectedQuizType, setSelectedQuizType] = useState(null);

  const [selectedTimer, setSelectedTimer] = useState(0);

  const [quizData, setQuizData] = useState({
    quizName: "",
    questions: [
      {
        questionText: "",
        options: [
          { optionText: "", optionImgURL: "" },
          { optionText: "", optionImgURL: "" },
        ],
        correctAnswer: "",
        timer: 0,
        optionType: "",
        optionVotes: {},
      },
    ],
    quizType: "",
  });

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/quiz/${quizId}`
        );
        const quizDetails = response.data.quiz;
        setQuizData(response.data.quiz);
        // setSelectedQuizType(quizDetails.quizType);
        setSelectedTimer(quizDetails.questions[0]?.timer || 0);
      } catch (error) {
        console.error("Error fetching quiz details:", error.message);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

  const handleChange = (e, questionIndex, optionIndex = null) => {
    const { name, value } = e.target;

    if (optionIndex !== null) {
      // Handle changes in options
      setQuizData((prevData) => ({
        ...prevData,
        questions: prevData.questions.map((question, i) =>
          i === questionIndex
            ? {
                ...question,
                ...(optionIndex !== null
                  ? {
                      options: question.options.map((option, j) =>
                        j === optionIndex ? { ...option, [name]: value } : option
                      ),
                      optionVotes: {
                        ...question.optionVotes,
                        [optionIndex]: 0,
                      },
                    }
                  : { [name]: value }),
              }
            : question
        ),
      }));
    } else if (questionIndex !== null) {
      // Handle changes in questions
      setQuizData((prevData) => ({
        ...prevData,
        questions: prevData.questions.map((question, i) =>
          i === questionIndex ? { ...question, [name]: value } : question
        ),
      }));
    } else {
      setQuizData((prevData) => ({ ...prevData, [name]: value }));
    }

    setQuizData((prevData) => ({ ...prevData, [name]: value }));
  };
  const handleSubmit = async () => {
    try {
      const response = await axios.put(
        `http://localhost:3001/quiz/editQuiz/${userId}/${quizId}`,
        quizData,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      // const quizId = response.data.quizId;

      setSecondPage(false);
      setThirdPage(true);

      console.log(response.data);
    } catch (error) {
      console.error("Error creating quiz:", error);
    }
  };
  const handleAddQuestion = () => {
    if (quizData.questions.length < 5) {
      setQuizData((prevData) => ({
        ...prevData,
        questions: [
          ...prevData.questions,
          {
            questionText: "",
            options: [
              { optionText: "", optionImgURL: "" },
              { optionText: "", optionImgURL: "" },
            ],
            correctAnswer: "",
            timer: 10,
            optionType: "",
            optionVotes: {},
          },
        ],
      }));
    }
  };

//   const handleDeleteQuestion = (questionIndex) => {
//     setQuizData((prevData) => {
//       const updatedQuestions = prevData.questions.filter(
//         (_, i) => i !== questionIndex
//       );

//       return {
//         ...prevData,
//         questions: updatedQuestions,
//       };
//     });
//   };
const handleDeleteQuestion = (questionIndex) => {
    console.log("function called");
    setQuizData((prevData) => {
      const updatedQuestions = prevData.questions.filter(
        (_, i) => i !== questionIndex
      );

      // If the active question index is greater than or equal to the deleted question index,
      // decrease the active question index by 1 to maintain proper alignment.
      const updatedActiveQuestionIndex =
        activeQuestionIndex >= questionIndex
          ? activeQuestionIndex - 1
          : activeQuestionIndex;

      return {
        ...prevData,
        questions: updatedQuestions,
        // Update the active question index in the state
        activeQuestionIndex: updatedActiveQuestionIndex,
      };
    });
  };
  const handleAddOption = (questionIndex) => {
    const targetQuestion = quizData.questions[questionIndex];
    if (targetQuestion && targetQuestion.options.length < 4) {
      setQuizData((prevData) => ({
        ...prevData,
        questions: prevData.questions.map((question, i) =>
          i === questionIndex
            ? {
                ...question,
                options: [
                  ...question.options,
                  { optionText: "", optionImgURL: "" },
                ],
              }
            : question
        ),
      }));
    }
  };
  const handleDeleteOption = (questionIndex, optionIndex) => {
    setQuizData((prevData) => ({
      ...prevData,
      questions: prevData.questions.map((question, i) =>
        i === questionIndex
          ? {
              ...question,
              options: question.options.filter(
                (option, j) => j !== optionIndex
              ),
            }
          : question
      ),
    }));
  };

  //   const handlePage = () => {
  //     setFirstPage(false);
  //     setSecondPage(true);
  //   };

  const handleQuestionClick = (questionIndex) => {
    setActiveQuestionIndex(questionIndex);
  };
  //   const setQuizTypePoll = () => {
  //     setQuizData((prevData) => ({ ...prevData, quizType: "poll" }));
  //     setSelectedQuizType("poll");
  //   };

  //   const setQuizTypeQA = () => {
  //     setQuizData((prevData) => ({ ...prevData, quizType: "q&a" }));
  //     setSelectedQuizType("q&a");
  //   };
  const handleSetCorrectAnswer = (questionIndex, optionIndex) => {
    setQuizData((prevData) => ({
      ...prevData,
      questions: prevData.questions.map((question, i) =>
        i === questionIndex
          ? {
              ...question,
              options: question.options.map((option, j) =>
                j === optionIndex
                  ? { ...option, isSelected: true }
                  : { ...option, isSelected: false }
              ),
              correctAnswer: generateCorrectAnswer(
                question.options[optionIndex]
              ),
            }
          : question
      ),
    }));
  };
  const generateCorrectAnswer = (option) => {
    const optionText = option.optionText;
    const optionImgURL = option.optionImgURL;

    if (!optionText || !optionImgURL) {
      return optionText || optionImgURL;
    } else {
      return `${optionText},${optionImgURL}`;
    }
  };

  const handleSetTimer = (value) => {
    setQuizData((prevData) => ({
      ...prevData,
      questions: prevData.questions.map((question) => ({
        ...question,
        timer: value,
      })),
    }));
    setSelectedTimer(value);
  };
  const handleShareClick = () => {
    const quizLink = `http://localhost:3000/quiz/${quizId}`;

    navigator.clipboard.writeText(quizLink).then(
      () => {
        toast.success("Link copied successfully!");
      },
      (err) => {
        console.error("Unable to copy link to clipboard", err);
        toast.error("Error copying link to clipboard");
      }
    );
  };
  return (
    <div className={styles.container}>
      <div className={styles.create}>
        {/* {firstPage ? (
          <div className={styles.page1}>
            <div className={styles.quizname}>
              <input
                type="text"
                name="quizName"
                value={quizData.quizName}
                onChange={(e) => handleChange(e)}
                placeholder="Quiz name"
              />
            </div>
            <div className={styles.quiztype}>
              <div id={styles.quizType}>Quiz Type</div>
              <div
                onClick={setQuizTypePoll}
                className={
                  selectedQuizType === "poll"
                    ? styles.selectedButton
                    : styles.qztypebutton
                }
              >
                <button>Poll</button>
              </div>
              <div
                onClick={setQuizTypeQA}
                className={
                  selectedQuizType === "q&a"
                    ? styles.selectedButton
                    : styles.qztypebutton
                }
              >
                <button>Q&A</button>
              </div>
            </div>
            <div className={styles.but}>
              <div className={styles.cancel}>
                <button onClick={onClose}>cancel</button>
              </div>
              <div className={styles.continue}>
                <button onClick={handlePage}>Continue</button>
              </div>
            </div>
          </div>
        ) : (
          ""
        )} */}
        {secondPage ? (
          <div className={styles.page2}>
            <div className={styles.main}>
              <div className={styles.questionList}>
                <div className={styles.qnbutton}>
                  {quizData.questions.map((question, questionIndex) => (
                    <div
                      key={questionIndex}
                      className={`${styles.questionItem} ${
                        activeQuestionIndex === questionIndex
                          ? styles.activeQn
                          : ""
                      }`}
                      onClick={() => handleQuestionClick(questionIndex)}
                    >
                      <div id={styles.qnNumber}>{questionIndex + 1}</div>
                      {questionIndex > 0 && (
                        <div
                          className={styles.deleteQn}
                          onClick={() => handleDeleteQuestion(questionIndex)}
                        >
                          X
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {quizData.questions.length < 5 ? (
                  <div
                    className={styles.addqnbutton}
                    onClick={handleAddQuestion}
                  >
                    <div>+</div>
                  </div>
                ) : (
                  ""
                )}

                <div id={styles.max}>Max 5 questions</div>
              </div>

              <div className={styles.qnText}>
                {/* <span>Q. {activeQuestionIndex + 1}:</span> */}
                <input
                  type="text"
                  name="questionText"
                  value={
                    quizData.questions[activeQuestionIndex] &&
                    quizData.questions[activeQuestionIndex].questionText
                      ? quizData.questions[activeQuestionIndex].questionText
                      : ""
                  }
                  onChange={(e) => handleChange(e, activeQuestionIndex)}
                  placeholder="Question Text"
                />
              </div>

              <div className={styles.optionType}>
                <div>Option Type:</div>
                <div id={styles.options}>
                  <div className={styles.radio1}>
                    <input
                      type="radio"
                      name="optionType"
                      value="text"
                      checked={
                        quizData.questions[activeQuestionIndex] &&
                        quizData.questions[activeQuestionIndex].optionType ===
                          "text"
                      }
                      onChange={(e) => handleChange(e, activeQuestionIndex)}
                    />
                    Text
                  </div>
                  <div className={styles.radio1}>
                    <input
                      type="radio"
                      name="optionType"
                      value="image"
                      checked={
                        quizData.questions[activeQuestionIndex] &&
                        quizData.questions[activeQuestionIndex].optionType ===
                          "image"
                      }
                      onChange={(e) => handleChange(e, activeQuestionIndex)}
                    />
                    Image
                  </div>
                  <div className={styles.radio1}>
                    <input
                      type="radio"
                      name="optionType"
                      value="text-and-image"
                      checked={
                        quizData.questions[activeQuestionIndex] &&
                        quizData.questions[activeQuestionIndex].optionType ===
                          "text-and-image"
                      }
                      onChange={(e) => handleChange(e, activeQuestionIndex)}
                    />
                    Text and Image
                  </div>
                </div>
              </div>
              {quizData.quizType === "q&a" && (
                <div className={styles.timer}>
                  <div>Timer</div>
                  <div
                    onClick={() => handleSetTimer(0)}
                    className={
                      selectedTimer === 0
                        ? styles.selectedTimerButton
                        : styles.qnTimerbutton
                    }
                  >
                    <button>OFF</button>
                  </div>
                  <div
                    onClick={() => handleSetTimer(5)}
                    className={
                      selectedTimer === 5
                        ? styles.selectedTimerButton
                        : styles.qnTimerbutton
                    }
                  >
                    <button>5</button>
                  </div>
                  <div
                    onClick={() => handleSetTimer(10)}
                    className={
                      selectedTimer === 10
                        ? styles.selectedTimerButton
                        : styles.qnTimerbutton
                    }
                  >
                    <button>10</button>
                  </div>
                </div>
              )}
              <div className={styles.optionContainer}>
              {quizData.questions &&
                  quizData.questions[activeQuestionIndex] &&
                  quizData.questions[activeQuestionIndex].options &&
                  quizData.questions[activeQuestionIndex].options.map(
                    (option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`${styles.optioninput} ${
                        option.isSelected ? styles.selectedOption : ""
                      } ${
                        option.optionText ===
                          quizData.questions[activeQuestionIndex]
                            .correctAnswer ||
                        option.optionImgURL ===
                          quizData.questions[activeQuestionIndex]
                            .correctAnswer ||
                        `${option.optionText},${option.optionImgURL}` ===
                          quizData.questions[activeQuestionIndex].correctAnswer
                          ? styles.selectedOption
                          : ""
                      }`}
                    >
                      {quizData.quizType === "q&a" &&
                        quizData.questions[activeQuestionIndex].optionType !==
                          "" && (
                          <div id={styles.radio2}>
                            <input
                              type="radio"
                              name={`correctAnswer-${activeQuestionIndex}`}
                              onChange={() =>
                                handleSetCorrectAnswer(
                                  activeQuestionIndex,
                                  optionIndex
                                )
                              }
                            />
                          </div>
                        )}

                      {quizData.questions[activeQuestionIndex].optionType ===
                        "text" && (
                        <>
                          <div className={styles.optionText}>
                            <input
                              type="text"
                              name="optionText"
                              value={option.optionText}
                              onChange={(e) =>
                                handleChange(
                                  e,
                                  activeQuestionIndex,
                                  optionIndex
                                )
                              }
                              placeholder="Option Text"
                            />
                          </div>
                          <div>
                            {optionIndex > 1 && (
                              <img
                                onClick={() =>
                                  handleDeleteOption(
                                    activeQuestionIndex,
                                    optionIndex
                                  )
                                }
                                src={del}
                                alt="del"
                              />
                            )}
                          </div>
                        </>
                      )}
                      {quizData.questions[activeQuestionIndex].optionType ===
                        "image" && (
                        <>
                          <div className={styles.optionText}>
                            <input
                              type="text"
                              name="optionImgURL"
                              value={option.optionImgURL}
                              onChange={(e) =>
                                handleChange(
                                  e,
                                  activeQuestionIndex,
                                  optionIndex
                                )
                              }
                              placeholder="Option Image URL"
                            />
                          </div>
                          <div>
                            {optionIndex > 1 && (
                              <img
                                onClick={() =>
                                  handleDeleteOption(
                                    activeQuestionIndex,
                                    optionIndex
                                  )
                                }
                                src={del}
                                alt="del"
                              />
                            )}
                          </div>
                        </>
                      )}
                      {quizData.questions[activeQuestionIndex].optionType ===
                        "text-and-image" && (
                        <>
                          <div className={styles.optionText}>
                            <input
                              type="text"
                              name="optionText"
                              value={option.optionText}
                              onChange={(e) =>
                                handleChange(
                                  e,
                                  activeQuestionIndex,
                                  optionIndex
                                )
                              }
                              placeholder="Option Text"
                            />
                            <input
                              type="text"
                              name="optionImgURL"
                              value={option.optionImgURL}
                              onChange={(e) =>
                                handleChange(
                                  e,
                                  activeQuestionIndex,
                                  optionIndex
                                )
                              }
                              placeholder="Option Image URL"
                            />
                          </div>
                          <div>
                            {optionIndex > 1 && (
                              <img
                                onClick={() =>
                                  handleDeleteOption(
                                    activeQuestionIndex,
                                    optionIndex
                                  )
                                }
                                src={del}
                                alt="del"
                              />
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                )}
                {/* {quizData.questions &&
                  quizData.questions.length < activeQuestionIndex < 4  ?(
                    <div id={styles.addOption}>
                      <button
                        onClick={() => handleAddOption(activeQuestionIndex)}
                      >
                        Add Option
                      </button>
                    </div>
                     ) : (
                      " "
                    )} */}
                    <div id={styles.addOption}>
                      <button
                        onClick={() => handleAddOption(activeQuestionIndex)}
                      >
                        Add Option
                      </button>
                    </div>
              </div>

              <div className={styles.submitbuttons}>
                <div id={styles.cancel}>
                  <button onClick={onClose}>cancel</button>
                </div>
                <div id={styles.submit}>
                  <button onClick={handleSubmit}>Update Quiz</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
        {thirdPage ? (
          <div className={styles.page3}>
            <div id={styles.close}>
              <button onClick={onClose}>X</button>
            </div>
            <div className={styles.shareContainer}>
              <div className={styles.congrats}>
                Congrats your Quiz is Updated!
              </div>
              <div className={styles.link}>
                http://localhost:3000/quiz/{quizId}
              </div>
              <div className={styles.share}>
                <button onClick={handleShareClick}>share</button>
              </div>
              <ToastContainer />
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default EditQuizForm;
