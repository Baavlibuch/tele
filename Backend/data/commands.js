const { getQuestionById, selectNewFlow, getPatient, makeDecision } = require("../compute/computeHelper")
const { updatePatientWithFacts } = require("../helper/index");
const { OPERATION, FACTORS, PROCESS, DECISION } = require('./questions');

function updateCardiacScore(id, answers, questions){
	try {
		let cardiac_score = getQuestionById(id, questions).options[answers[id]].cardiac_score;
		if (cardiac_score) return cardiac_score
		return 0
	} catch (e) {
		return 0
	}
}

function updateCardiacScoreFromList(id, answers, questions){
	let score = 0
	let options = getQuestionById(id, questions).options
	try {
		for (let i in answers[id]){
			for (let j in options) {
				if (options[j].dbValue === answers[id][i]) score += options[j].cardiac_score
				else console.log("not equal")
			}
		}
		return score
	} catch (e) {
		console.warn(e)
		return 0
	}
}

const commands = {
	records: {},
	// Enter commands here
	selectNewFlow: function(answers, currentQuestion, session, patient_id) {
		return selectNewFlow(answers, currentQuestion, session, patient_id)
	},

	selfevaluation: function(answers, question, setQuestion, optionsSelected) {
		const { paramsFrom, branches } = question;
		let Sensation = answers[paramsFrom.Sensation];
		let Eye_Control = answers[paramsFrom.Eye_Control];
		let Palette1 = answers[paramsFrom.Palette1];
		let Palette2 = answers[paramsFrom.Palette2];
		if (Sensation === 1 || Eye_Control === 1 || Palette1 === 0 || Palette2 === 0 ) {
			return branches.Redirecting_for_consultation;
		}
		else {
			return branches.doing_fine;
		}
	},

	iscardiacpatient: function(answers, question, questions, patient_id, session, optionSelected) {//answers, question, this.setQuestion
		console.log("iscardiac patient?");
		let id = "90.1 Cardiac status"
		const { branches } = question;

		if (answers[id] === undefined) return branches["non_cardiac_patient"];

		if (getQuestionById(id, questions).options[answers[id]].value === 0)
			return branches["non_cardiac_patient"];    // non cardiac patient

		updatePatientWithFacts(session, patient_id, {cardiac_patient:true})
		return branches["cardiac_patient"];                               //  cardiac patient
	},

	heartfailureselfevaluation: function(answers, question, questions, patient_id, session, setQuestion, optionsSelected){
		const { paramsFrom, branches } = question;

		let cardiacScore = 0
		// updateCardiacScore("71.1 Cardiac pain middle of chest pain", answers, questions)
		cardiacScore += updateCardiacScore("75.0 Cardiac HF Dyspnea", answers, questions)
		cardiacScore += updateCardiacScore("75.1 Cardiac HF Orthopnea", answers, questions)
		cardiacScore += updateCardiacScore("75.2 Cardiac HF PND", answers, questions)
		cardiacScore += updateCardiacScore("75.3 Cardiac HF pedal edema", answers, questions)

		console.log(cardiacScore)
		// cardiacScore += updateCardiacScoreFromList("80.0 Cardiac associated symptoms", answers, questions)
		// console.log(cardiacScore)

		if (cardiacScore >= 1) {
			updatePatientWithFacts(session, patient_id, {cardiac_patient:true})
			updatePatientWithFacts(session, patient_id, {heart_failure:true})
			updatePatientWithFacts(session, patient_id, {cardiac_score:cardiacScore})
			return branches.heart_failure_diagnosed;		// TODO return is needed
		}
		else {
			updatePatientWithFacts(session, patient_id, {heart_failure:false})
			return branches.heart_failure_not_diagnosed;
		}
	},

	anginaselfevaluation: function(answers, currentQuestion, questions, patient_id, session, setQuestion, optionsSelected){
		const { paramsFrom, branches } = currentQuestion;

		let cardiacScore = 0
		// updateCardiacScore("71.1 Cardiac pain middle of chest pain", answers, questions)
		cardiacScore += updateCardiacScore("72.0 Cardiac point pain", answers, questions)
		cardiacScore += updateCardiacScore("74.0 Cardiac left arm pain", answers, questions)
		cardiacScore += updateCardiacScore("74.1 Cardiac inner side left arm pain", answers, questions)
		cardiacScore += updateCardiacScore("73.1 Pain on arm movement", answers, questions)
		cardiacScore += updateCardiacScore("73.2 Cardiac pain on squeezing", answers, questions)

		console.log(cardiacScore)
		cardiacScore += updateCardiacScoreFromList("80.0 Cardiac associated symptoms", answers, questions)
		console.log(cardiacScore)

		if (cardiacScore > 1) {
			updatePatientWithFacts(session, patient_id, {cardiac_patient:true})
			updatePatientWithFacts(session, patient_id, {angina:true})
			updatePatientWithFacts(session, patient_id, {cardiac_score:cardiacScore})
			return branches.probable_angina;		// TODO return is needed
		}
		else {
			updatePatientWithFacts(session, patient_id, {angina:false})
			return branches.non_cardiac_chest_pain;
		}
	},

	firstassessement: function(answers, question, setQuestion, optionsSelected) {
		const { paramsFrom, branches } = question;
		let symptoms = answers[paramsFrom.symptoms];
		if (optionsSelected) {
			if (optionsSelected[0] && (optionsSelected[1] || optionsSelected[2] || optionsSelected[3] || optionsSelected[6])) {
				return branches.for_covid19;
			} else if (optionsSelected[0] && (optionsSelected[4] || optionsSelected[5])) {
				return branches.for_mucormycosis;
			} else if (optionsSelected[4] || optionsSelected[5]) {
				return branches.for_mucormycosis;
			} else {
				return branches.still_not_confirmed;
			}
		} else {
			return branches.still_not_confirmed;
		}
	},
	secondassessement: function(answers, question, setQuestion, optionsSelected) {
		const { paramsFrom, branches } = question;
		let symptoms = answers[paramsFrom.symptoms];
		if (optionsSelected) {
			if (optionsSelected[0]) {
				// Diabetes and Hypertension selected
				if (optionsSelected[1] || optionsSelected[2] || optionsSelected[4]) {
					return branches.for_mucormycosis;
				}
				else if (optionsSelected[3]) {
					return branches.for_covid19;
				} else {
					return branches.still_not_confirmed;
				}
			}
			else if (optionsSelected[1] || optionsSelected[2] || optionsSelected[4]) {
				return branches.for_mucormycosis;
			}
			else {
				return branches.still_not_confirmed;
			}
		}
		else {
			return branches.still_not_confirmed;
		}
	},

	act: function(answers, currentQuestion, questions, patient_id, session, setQuestion, optionsSelected){
		const { paramsFrom, branches, process } = currentQuestion;
		// console.log(`command.act currentQuestion = ${currentQuestion}`)
		// console.log(`command.act currentQuestion.process = ${currentQuestion[PROCESS]}`)
		// console.log(`command.act currentQuestion.process.factors = ${currentQuestion[PROCESS][FACTORS]}`)
		let factors = currentQuestion[PROCESS][FACTORS]
		let score = (currentQuestion[PROCESS][OPERATION] === "sum") ? 0 : 1;
		let patient = getPatient(session, patient_id)
		console.log(`commands.act : patient = ${patient}`)

		for (let i=0; i < factors.length; i++) {
			// console.log(`commands.act.loop : factor_key = ${factors[i]}`)
			console.log(`factors[i] = ${factors[i]}`)
			patient.forEach((patient_fact) => {
				let key = Object.keys(patient_fact)
				// Desired behavior
				// noinspection EqualityComparisonWithCoercionJS
				if (key == factors[i]) {
					let value = patient_fact[key]
					// console.log(`value = ${value}`)
					score = (currentQuestion[PROCESS][OPERATION] === "sum") ? score+=value : score*=value;
					// console.log(`commands.act : score = ${score}, value = ${value}`)
				}
			})
		}

		console.log(`commands.act : score = ${score}`)
		let branch = makeDecision(process, score);
		console.log(`commands.act : branch = ${branch}. branches[branch] = ${branches[branch]}`)
		return branches[branch]
		// compare with score
			// TODO
	}
}

function compareOptions(a, b) {
	return a.statement > b.statement ? 1 : -1;
}

module.exports = { commands }
