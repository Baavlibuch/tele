const Patient = require("../models/patient");
const { DECISION } = require('../data/questions')

function getPatient(session, patient_id){
  let patient = null
  if (!patient_id) {
		patient = session.temp_patient
		console.log('getPatient : patient = temp patient')
	}
  else patient = Patient.findOne({id:patient_id})
  return patient
}

function makeMask(session, patient_id){
  const patient = getPatient(session, patient_id)
  let nextQuestionActionSpace = []
  for (let i = 0; i<stateToNodeMapping.length; i++){
    if(patient[stateToNodeMapping[i][0]]) nextQuestionActionSpace+=stateToNodeMapping[i][1]
  }
  return { nextQuestionActionSpace }
}

function selectNewFlow(answers, question, session, patient_id){
  let nextFlowIds = makeMask(session, patient_id)
  return nextFlowIds[Math.floor(Math.random() * nextFlowIds.length)]
}

function getQuestionById(id, questions) {
  for (let i = 0; i < questions.length; i++) {
    if (questions[i].id === id) {
      return questions[i];
    }
  }
  console.error("tried to search for question with ID = ", id)
  return null;
}

function getCurrentSelectedOption(currentQuestion, answers){
  return currentQuestion.options[answers[currentQuestion.id]]
}

// convert path to json
function sanitizeFact(fact){
  fact = fact.replace('""', 'null')
  fact = '"' + fact
  fact = fact.replace('/', '":"')
  fact = fact+'"'
  fact.replace('""', '"')
  fact.replace(`"'`, '"')
  fact.replace(`'"`, '"')
  fact = fact.replace('null', '""')
  fact = `{${fact}}`
  return fact
}

function makeDecision(process, score) {
	let decision = process[DECISION];
	let branch = "";
	for (let i = 0; i < decision.length; i++) {
		if (decision[i].operation === "<" && score < decision[i].value) {
			branch = decision[i].branch;
			break;
		} else if (decision[i].operation === "<=" && score <= decision[i].value) {
			branch = decision[i].branch;
			break;
		} else if (decision[i].operation === ">" && score > decision[i].value) {
			branch = decision[i].branch;
			break;
		} else if (decision[i].operation === ">=" && score >= decision[i].value) {
			branch = decision[i].branch;
			break;
		} else if (decision[i].operation === "><" && score > decision[i].value.min && score < decision[i].value.max) {
			branch = decision[i].branch;
			break;
		} else if (decision[i].operation === ">==<" && score >= decision[i].value.min && score <= decision[i].value.max) {
			branch = decision[i].branch;
			break;
		} else if (decision[i].operation === "<>" && score > decision[i].value.max && score < decision[i].value.min) {
			branch = decision[i].branch;
			break;
		} else if (decision[i].operation === "<==>" && score >= decision[i].value.max && score <= decision[i].value.min) {
			branch = decision[i].branch;
			break;
		} else if (decision[i].operation === "=" && score === decision[i].value) {
			branch = decision[i].branch;
			break;
		}
	}
	return branch
}

module.exports = { getPatient, makeMask, selectNewFlow, getQuestionById, getCurrentSelectedOption, sanitizeFact, makeDecision }