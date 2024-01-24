const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose')
const router = express.Router();
const Quiz = require('../models/quize');
const Quizeuser = require('../models/user');
const authenticate = require('../middleware/authenticate');



router.get('/dashboard/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Find quizzes created by the user
    const quizzes = await Quiz.find({ userId });

    // Calculate total number of questions in all quizzes
    const totalQuestions = quizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0);

    const totalImpressions = quizzes.reduce((sum, quiz) => sum + quiz.impression, 0);
    // Prepare data for each quiz with quiz name, createdOn, and impression
    const quizDetails = quizzes.map(quiz => ({
      quizName: quiz.quizName,
      quizType: quiz.quizType,
      createdOn: quiz.createdOn,
      impression: quiz.impression,
      quizId: quiz._id,
    }));

    // Send the response
    res.status(200).json({
      numberOfQuizzes: quizzes.length,
      totalNumberOfQuestions: totalQuestions,
      totalImpressions,
      quizDetails: quizDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/createQuiz/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { quizName, questions, quizType } = req.body;

    const newQuiz = new Quiz({
      userId,
      quizName,
      questions,
      quizType,
    });
    await newQuiz.save();


    res.status(201).json({ quizId: newQuiz._id, message: 'Quiz created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// edit question details of quiz
router.put('/editQuiz/:userId/:quizId', authenticate, async (req, res) => {
  try {
    const { userId, quizId } = req.params;
    const {quizName,quizType,questions } = req.body;

    // Find the quiz by quizId and userId to ensure the user has the right to edit
    const quiz = await Quiz.findOne({ _id: quizId, userId });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Update only the questions array in the quiz
    quiz.questions = quiz.questions || questions;
    quiz.quizName = quiz.quizName || quizName;
    quiz.quizType = quiz.quizType || quizType;

    // Save the updated quiz
    await quiz.save();

    res.status(200).json({ message: 'Quiz updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Retrieve a quiz using the public link
router.get('/:publicLink', async (req, res) => {
  try {
    const { publicLink } = req.params;

    const quiz = await Quiz.findById(publicLink);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.status(200).json({ quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/analytics/:userId/:quizId', authenticate, async (req, res) => {
  try {
    const { userId, quizId } = req.params;

    // Validate user and quiz IDs
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ error: 'Invalid user or quiz ID' });
    }

    // Find the quiz by user and quiz ID
    const quiz = await Quiz.findOne({ userId, _id: quizId });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Process quiz details based on quizType
    let quizDetails;
    quizDetails = quiz.questions.map((question) => {
      const { questionText, correctAnswer, answerCount, correctCount, incorrectCount, optionVotes } = question;
      return {
        questionText,
        correctAnswer,
        answerCount,
        correctCount,
        incorrectCount,
        optionVotes,
      };
    });

    res.status(200).json({ quizDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//   router.get('/:quizId', async (req, res) => {
//     try {
//       const { quizId } = req.params;
//       console.log("Received quizId:", quizId);

//       // Assuming you want to find a quiz based on the quizId
//       const quiz = await Quiz.findById(quizId);


//       if (!quiz) {
//         return res.status(404).json({ error: `Quiz not found of id ${quizId}` });
//       }

//       res.status(200).json({ quiz });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });

router.delete('/deleteQuiz/:userId/:quizId', authenticate, async (req, res) => {
  try {
    const { userId, quizId } = req.params;

    // Validate user and quiz IDs
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ error: 'Invalid user or quiz ID' });
    }

    // Find the quiz by user and quiz ID
    const quiz = await Quiz.findOne({ userId, _id: quizId });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Delete the quiz
    // await quiz.remove();
    await Quiz.deleteOne({ _id: quizId });


    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error in deleteQuiz API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
