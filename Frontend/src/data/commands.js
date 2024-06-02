// import axios from 'axios';

function getQuestionById(id, questions) {
  for (let i = 0; i < questions.length; i++) {
    if (questions[i].id === id) {
      return questions[i];
    }
  }
  console.error("tried to search for question with ID = ", id)
  return null;
}

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
  selfevaluation: function(answers, question, setQuestion, optionsSelected) {
    const { paramsFrom, branches } = question;
    let Sensation = answers[paramsFrom.Sensation];
	  let Eye_Control = answers[paramsFrom.Eye_Control];
	  let Palette1 = answers[paramsFrom.Palette1];
	  let Palette2 = answers[paramsFrom.Palette2];
    if (Sensation === 1 || Eye_Control === 1 || Palette1 === 0 || Palette2 === 0 ) {
      setQuestion(branches.Redirecting_for_consultation);
    }
	  else {
        setQuestion(branches.doing_fine);
      }
    },

  iscardiacpatient: function(answers, question, questions, setQuestion, optionSelected) {//answers, question, this.setQuestion
    console.log("iscardiac patient?");

    let id = "90.1 Cardiac status"
    let k = getQuestionById(id, questions).options[answers[id]]
    console.log('k = ', k)
    console.log('value = ', k.value)

    const { branches } = question;
    if (k.value === 0) setQuestion(branches["106.0 Cardiac patient description"]);    // cardiac patient
    else setQuestion(branches["105.0 Heart exercise"]);                               // not cardiac patient
  },

  anginaselfevaluation: function(answers, question, questions, setQuestion, optionsSelected){
    const { branches } = question;

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
      setQuestion(branches.probable_angina);
    }
    else {
      setQuestion(branches.non_cardiac_chest_pain);
    }
  },

   firstassessement: function(answers, question, setQuestion, optionsSelected) {
    const { paramsFrom, branches } = question;
    // let symptoms = answers[paramsFrom.symptoms];
    if (optionsSelected) {
      if (optionsSelected[0] && (optionsSelected[1] || optionsSelected[2] || optionsSelected[3] || optionsSelected[6])) {
	  	setQuestion(branches.for_covid19);
	  } else if (optionsSelected[0] && (optionsSelected[4] || optionsSelected[5])) {
		  setQuestion(branches.for_mucormycosis);
      } else if (optionsSelected[4] || optionsSelected[5]) {
		  setQuestion(branches.for_mucormycosis);
      } else {
          setQuestion(branches.still_not_confirmed);
      }
    } else {
     	setQuestion(branches.still_not_confirmed);
    }
  },
   secondassessement: function(answers, question, setQuestion, optionsSelected) {
    const { paramsFrom, branches } = question;
    // let symptoms = answers[paramsFrom.symptoms];
    if (optionsSelected) {
      if (optionsSelected[0]) {
        // Diabetes and Hypertension selected
        if (optionsSelected[1] || optionsSelected[2] || optionsSelected[4]) {
		setQuestion(branches.for_mucormycosis);
		}
		else if (optionsSelected[3]) {
		setQuestion(branches.for_covid19);
      } else {
        setQuestion(branches.still_not_confirmed);
      }
    }
	else if (optionsSelected[1] || optionsSelected[2] || optionsSelected[4]) {
		setQuestion(branches.for_mucormycosis);
	}
	else {
      setQuestion(branches.still_not_confirmed);
    }
}
  else {
      setQuestion(branches.still_not_confirmed);
	}
   }
}

// function compareOptions(a, b) {
//   return a.statement > b.statement ? 1 : -1;
// }

export { commands };
