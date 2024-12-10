const {
  questions
} = require("../data/questions");
const Doctor = require("../models/doctor");
const Patient = require("../models/patient");

function getQuestionById(id) {
  for (let i = 0; i < questions.length; i++) {
    if (questions[i].id === id) {
      return questions[i];
    }
  }
  return null;
}

function getId(name, number) {
  const cleansedName = name.trim().toLowerCase();
  if (cleansedName) {
    const firstWord = cleansedName.split(" ")[0];
    return `${firstWord}-${number}`;
  }
  return null;
}


function getSelectedOption(id, answers){
  return getQuestionById(id).options[answers[id]].dbValue;
}

function pushTimestamps(model, timestamps){
  for(let i=0; i<timestamps.length; i++){
    model.push(timestamps[i])
  }
}

function opdCommonQuestions(answers, modelTimestamps, timestamps) {
  opd_symptoms = answers["2.4"];
  modelTimestamps.push({ id: "opd_symptoms", time: timestamps["2.4"] });
  opd_symptoms_age = answers["2.41"];
  modelTimestamps.push({ id: "opd_symptoms_age", time: timestamps["2.41"] });
  name = answers["2.5"];
  console.log(name);
  modelTimestamps.push({ id: "name", time: timestamps["2.5"] });
  gender = getQuestionById(2.7).options[answers["2.7"]].dbValue;
  modelTimestamps.push({ id: "gender", time: timestamps["2.7"] });
  age = answers["2.6"];
  modelTimestamps.push({ id: "age", time: timestamps["2.6"] });
  email = answers["2.9"] === "0" ? answers["2.91"] : "";
  modelTimestamps.push({ id: "email", time: timestamps["2.9"] });
  telephone = answers["2.8"];
  modelTimestamps.push({ id: "telephone", time: timestamps["2.8"] });
  return { opd_symptoms, opd_symptoms_age, name, gender, age, email, telephone };
}

/*
 * Push user responses into DB and make decisions based on user responses
 * callback = mongoose model
 */
function answersToModel(answers, timestamps, mongooseModelCallback) {
  // return
  if (!answers) {
    // don't add anything into the db
    mongooseModelCallback({});
  } else {
    Doctor.find().distinct("hospital", (err, hospitals) => {
      let type;
      console.log("answersToModel()")
      if (err || !hospitals) return mongooseModelCallback({});
      console.log(answers[26]);
      console.log("answers.26",hospitals[answers["26"]])
      let hospital = hospitals[answers["26"]];
      let aiims_id = hospital === "AIIMS Jodhpur" ? answers["27"] : "";

      try {
        // type = getQuestionById(28).options[answers["28"]].dbValue;    // check if conversation type is OPD
        // console.log("type = ", type)
      } catch (typeError){
        // type = getQuestionById(2.5).options[answers["2.5"]].dbValue;    // check if conversation type is OPD
        type = undefined
        console.log('answersToModel conversation type error : ', typeError)
      }

      let modelTimestamps = [];

      console.log('conversation type = ', type)

      if (type === "OPD" || answers["2.5"] !== "undefined") {
        console.log("answersToModel - 'OPD'");
        const {
          opd_symptoms,
          opd_symptoms_age,
          name,
          gender,
          age,
          email,
          telephone
        } = opdCommonQuestions(answers, modelTimestamps, timestamps);

        mongooseModelCallback({
          name,
          age,
          gender,
          telephone,
          // email,
          hospital,
          // type,
          // opd_symptoms,
          // opd_symptoms_age,
          // aiims_id,
          "timestamps": modelTimestamps
        });
      }
    });
  }
}

module.exports = {
  getId,
  answersToModel
};
