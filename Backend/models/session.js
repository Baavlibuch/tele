const mongoose = require('mongoose');

const { Schema } = mongoose;

const Content = new Schema({
  en: {},
  hi: {},
  mwr: {},
  bn: {},
  description_image: String
  });

const Option = new Schema({
    next_question: String,
    statement: Content,
    value: String
  });

const Question = new Schema({
  id: String,
  next_question: String,
  statement: Content,
  options: [Option],
  value: String
});

const AnswerFormat = new Schema({
  type: String,
  options: [Option],
  pattern: String
})

// create a schema
const SessionSchema = new Schema(
  {
    messages: [{
      statement: String,
      messageType: String,
      direction: String,
      index: Number,
      answerFormat: AnswerFormat,
      nextQuestion: String,
      optionSelected: String,
      options: [Option],
      question: Question,
      timestamp: Number,
      patient_id: String,
      currentQuestion: {}
    }],
    patient_id: String,
    temp_patient: [],
    message_history_stack: [String],
    topics_stack: [],
    answers: Schema.Types.Mixed
  }
);

// create the model
const Session = mongoose.model('Session', SessionSchema, 'sessions');

// export the model
module.exports = Session;
