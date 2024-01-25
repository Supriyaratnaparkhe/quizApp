import React from "react";
import styles from "./SubmitQuiz.module.css";

const SubmitQuiz = () => {
  return (
    <center>
      <div className={styles.doneContainer}>
        <div className={styles.title}> Congrats Quiz is completed </div>
        <div className={styles.doneImage}></div>
        <p className={styles.scoreText}>Your Score is 03/04</p>
      </div>
    </center>
  );
};

export default SubmitQuiz;
