import React, { useState, useEffect } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import { useParams } from "react-router-dom";
import QnA from "../../Components/QnA/QnA";
import axios from "axios";
import styles from "./QnAnalysis.module.css";
import { useLocation } from "react-router-dom";

const QnAnalysis = () => {
  const [quizDetails, setQuizDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId, quizId } = useParams();
  const location = useLocation();
  const { quizType } = location.state;

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/quiz/analytics/${userId}/${quizId}`,
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );
        setQuizDetails(response.data.quizDetails);
        setLoading(false);
      } catch (error) {
        console.error(error);

        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [userId, quizId]);

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className={styles.container}>
      <div>
        <Navbar />
      </div>
      <div className={styles.quiz}>
        <QnA quizDetails={quizDetails} quizType={quizType} />
      </div>
    </div>
  );
};

export default QnAnalysis;

