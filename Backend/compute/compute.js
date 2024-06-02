const { questions, CONTENT_VARIANT_NAME, CONTENT_VARIANTS, STATEMENT,
  NEXT_QUESTION_LIST, NEXT_QUESTION, STACK, STACK_POP, DOWNLOAD,
  DEFAULT_ASK, VARIANT_PROBABILITY, OPTIONS, OPTION_STATEMENT_VARIANTS,
  OPTION_VARIANT_NAME, SKIP_PROBABILITY, FACT, ID, COMMAND, TYPE
} = require("../data/questions");
const { TYPE_ANALYSE, TYPE_NONE, TYPE_BUTTON } = require("../helper/values");
const { commands } = require("../data/commands");
const Patient = require('../models/patient');
// const Session = require('../models/session');
const { updatePatientWithFacts } = require("../helper/index")
const { getCurrentSelectedOption } = require("./computeHelper");
const path = require("path");
const TYPE_GENERIC_TEXT = 'generic_text'

// TODO Thompson sampling

function randomSelection(parent, list){
  return Math.floor(Math.random() * parent[list].length)
}

// not actually epsilon greedy. best is checked based on best's probability
// [x,y] : x is index, y is probability
function stochasticSelection(probabilities){
  probabilities.sort((a, b) => {
    if (a[1]<b[1]) return 1     // b will be placed before a
    else return -1              // a will be placed before b
  })
  let total_probability = 0
  for (let i =0; i<probabilities.length; i++){
    total_probability+= probabilities[i][1]
  }
  for (let i =0; i<probabilities.length; i++){
    let p = Math.random() * total_probability
    // console.log('compute stochasticSelection : p = ', p)
    if (p < probabilities[i][1]) return probabilities[i][0]
  }
  return probabilities[probabilities.length-1][0]
}

function makeProbabilityList(parent, list){
  let probabilities = []
  for (let i = 0; i<parent[list].length; i++){
    if (parent[list][i][VARIANT_PROBABILITY]!==undefined) {
      probabilities.push([i, parent[list][i][VARIANT_PROBABILITY]])
    }
  }
  return probabilities
}

function selectContentVariant(question){
  // if(question!==null) console.log('compute.SelectContentVariant. 0 question[ID] = ', question[ID], '. question[NEXT_QUESTION] = ', question[NEXT_QUESTION])
  if (question && question[CONTENT_VARIANTS] !== undefined) {
    console.log("question[CONTENT_VARIANTS].length = ", question[CONTENT_VARIANTS].length)
    let probabilities = makeProbabilityList(question, CONTENT_VARIANTS)
    let index
    if (probabilities && probabilities.length>0) index = stochasticSelection(probabilities, question)
    else index = randomSelection(question, CONTENT_VARIANTS)
    console.log("compute.SelectContentVariant. selectedVariant. index = ",  index, ". variant", question[CONTENT_VARIANTS][index])
    question[STATEMENT] = question[CONTENT_VARIANTS][index][STATEMENT]
    question[CONTENT_VARIANT_NAME] = question[CONTENT_VARIANTS][index][CONTENT_VARIANT_NAME]
  }
  return question
}

function getQuestionById(id){
  for (let i = 0; i < questions.length; i++) {
    if (questions[i][ID] === id) return JSON.parse(JSON.stringify(questions[i]));                 // otherwise the original object gets modified. replace with structuredClone() later
  }
  console.error("LOG getQuestionById(). failed to search for question with ID = ", id)
  return null;
}

function prepareResult(res, question) {
  console.log('prepareResult(). questionID = ', question.id)
  console.log('question.statement = ', question[STATEMENT])
  res.json({
    "none": "none",
    question: question,
    incomingChats: [{ statement: { none: "none" }, type: "incoming" }],
  })
  if (question[STATEMENT]) {
    if (question[STATEMENT][DOWNLOAD]) {
      console.log('compute.prepareResult : sending downloadable file')
      res.sendFile("./data/" + question[STATEMENT][DOWNLOAD], { root: path.join(__dirname) }, function(err) {
        if (err) {
          console.log(`Failed to send file : name = ${"./data/" + question[STATEMENT][DOWNLOAD]}`);
        } else {
          console.log(`compute.prepareResult.sendfile : filename = ${"./data/" + question[STATEMENT].download}`);
        }
      });
    }
  //   else if (question[TYPE] === TYPE_GENERIC_TEXT)
  //     console.log("compute.prepareResult : question = ", question)
  //     console.log("compute.prepareResult : res = ", res)
  }
  // else console.log(`compute.prepareResult :  question.statement = ${Object.keys(question[STATEMENT])}. ${Object.values(question[STATEMENT])}. question.statement.download = ${question[STATEMENT].download}`)
  return res
}

function selectNextQuestionFromList(question){
  // console.log("select next question from list")
  if (question[NEXT_QUESTION_LIST] === undefined) {
    console.log("selectNextQuestionFromList: no next question list exists. deciding the simple way")
    return;
  }

  // TODO : decide based on state (in command?). use probabilities
  console.log("compute selectNextQuestionFromList question.id = ", question[ID])

  let defaultAsk = undefined
  let index = undefined
  let probabilities = makeProbabilityList(question, NEXT_QUESTION_LIST)
  if (probabilities && probabilities.length>0) index = stochasticSelection(probabilities, question)
  if (index) {
    question[NEXT_QUESTION] = question[NEXT_QUESTION_LIST][index][NEXT_QUESTION];
    return
  }
  // else select default
  for (let i=0; i<question[NEXT_QUESTION_LIST].length; i++) {
    if (question[NEXT_QUESTION_LIST][i][DEFAULT_ASK] === true) defaultAsk = i
  }
  if (defaultAsk) {
    console.log('default ask for nextQuestion variant')
    question[NEXT_QUESTION] = question[NEXT_QUESTION_LIST][defaultAsk][NEXT_QUESTION]
    return
  }
  // else select random
  console.log('selecting nextQuestion variant randomly')
  index = randomSelection(question, NEXT_QUESTION_LIST)
  question[NEXT_QUESTION] = question[NEXT_QUESTION_LIST][index][NEXT_QUESTION]
}

function selectOptionStatementVariant(question, skipList) {
  console.log('compute.selectOptionStatementVariant question[OPTIONS].length = ', question[OPTIONS].length)
  for (let optionIndex = 0; optionIndex<question[OPTIONS].length; optionIndex++) {
    if (question[OPTIONS][optionIndex][OPTION_STATEMENT_VARIANTS] !== undefined &&
    !skipList.includes(optionIndex)) {
      // if not suppressed use, else ignore
      let statementVariantIndex = undefined
      let probabilities = makeProbabilityList(question[OPTIONS][optionIndex], OPTION_STATEMENT_VARIANTS)
      if (probabilities && probabilities.length>0) statementVariantIndex = stochasticSelection(probabilities, question[OPTIONS][optionIndex])
      // statementVariantIndex = randomSelection(question[OPTIONS][optionIndex], OPTION_STATEMENT_VARIANTS)
      //let index = Math.floor(Math.random() * question[OPTIONS][optionIndex][OPTION_STATEMENT_VARIANTS].length)
      // console.log("question[CONTENT_VARIANTS].length = ", question[OPTIONS][optionIndex][OPTION_STATEMENT_VARIANTS].length)
      // console.log("index = ", index)
      // console.log("question[CONTENT_VARIANTS][index] = ", question[OPTIONS][optionIndex][OPTION_STATEMENT_VARIANTS][index])
      question[OPTIONS][optionIndex][STATEMENT] = question[OPTIONS][optionIndex][OPTION_STATEMENT_VARIANTS][statementVariantIndex][STATEMENT]
      question[OPTIONS][optionIndex][OPTION_VARIANT_NAME] = question[OPTIONS][optionIndex][OPTION_STATEMENT_VARIANTS][statementVariantIndex][CONTENT_VARIANT_NAME]
      question[OPTIONS][optionIndex].skip = false
    }
    else question[OPTIONS][optionIndex].skip = skipList.includes(optionIndex);
    // console.log('selectOptionStatementVariant question[OPTIONS][optionIndex] skipList.includes(optionIndex) = ', skipList.includes(optionIndex))
  }
  return question
}

function selectOptionNextQuestion(question, skipList) {
  console.log("select next question from options")
  for (let optionIndex = 0; optionIndex<question[OPTIONS].length; optionIndex++) {
    // continue if contained in skipList
    if (skipList!==undefined && skipList.includes(optionIndex)) continue
    // for every option
    if (question[OPTIONS][optionIndex][NEXT_QUESTION_LIST] === undefined) {
      // console.log("selectOptionNextQuestion: no nextQuestion list exists. deciding the simple way")
      continue;                                                                 // move to next option
    }

    // TODO : decide based on state (in command?). use probabilities

    let defaultAsk = undefined
    for (let i = 0; i < question[OPTIONS][optionIndex][NEXT_QUESTION_LIST].length; i++) {
      if (question[OPTIONS][optionIndex][NEXT_QUESTION_LIST][i][DEFAULT_ASK] === true) defaultAsk = i
      else if (question[OPTIONS][optionIndex][NEXT_QUESTION_LIST][i][VARIANT_PROBABILITY] !== undefined
        && Math.random() < question[OPTIONS][optionIndex][NEXT_QUESTION_LIST][i][VARIANT_PROBABILITY]) {
        // non-default. coin flip and select
        question[OPTIONS][optionIndex][NEXT_QUESTION] = question[OPTIONS][optionIndex][NEXT_QUESTION_LIST][i][NEXT_QUESTION]
        break                                                                   // select variant
      }
      console.log('selected nextQuestion variant. index : ', i)
    }
    // else select default
    if (defaultAsk) {
      console.log('default ask for nextQuestion variant')
      question[OPTIONS][optionIndex][NEXT_QUESTION] = question[OPTIONS][optionIndex][NEXT_QUESTION_LIST][defaultAsk][NEXT_QUESTION]
      continue                                                                  // select default variant and move to next option
    }
    // else select random if there's no default
    console.log('selecting nextQuestion variant randomly')
    let index = Math.floor(Math.random() * question[OPTIONS][optionIndex][NEXT_QUESTION_LIST].length)
    question[OPTIONS][optionIndex][NEXT_QUESTION] = question[OPTIONS][optionIndex][NEXT_QUESTION_LIST][index][NEXT_QUESTION]
  }
  return question
}

function fetchConversationState(){
  // TODO
}

function fetchPatientState(){
  // TODO
}

function fetchState(){
  // compare with get Facts and figure out something
  fetchConversationState()
  fetchPatientState()
}

async function analyzeStatement(customText, currentQuestion){
  // TODO
  if (customText) return await nlu(customText, currentQuestion, questions)
}

function runCommand(question, currentQuestion, nextQuestion, command, answers, patient_id, session){
  console.log('compute.runCommand(). commands = ', commands, '. patient_id = ', patient_id, 'session.temp_patient = ', session.temp_patient)
  if (currentQuestion && currentQuestion.type === TYPE_NONE && command) {
    // run a task/command
    console.debug('statement followed by command')
    // console.log('command = ', command, '. commands[command] = ', commands[command])
    nextQuestion = commands[command](answers, currentQuestion, patient_id, session);
    // console.debug('nextQuestion = ', nextQuestion)
  }
  else if (currentQuestion && currentQuestion.type === TYPE_ANALYSE && command) {
    // run a task/command
    console.debug('runCommand.analysis.command = ', command)
    // console.log('commands = ', commands)
    // console.log('commands[command] = ', commands[command])
    // console.log('commands[command].type = ', commands[command].type)
    nextQuestion = commands[command](answers, currentQuestion, questions, patient_id, session);
    // console.debug('analysis command')
    // console.debug(nextQuestion)
  }
  else if (currentQuestion && currentQuestion.type === TYPE_NONE && nextQuestion) {
  // simple statement
  // Without delay, the present question may not get rendered
  // console.log("simple statement. nextQuestion = ", nextQuestion)
  // if (this.questions!==undefined) ;
  // else {
  // 	//default;
  // }
  }
  else if (currentQuestion.type === TYPE_BUTTON && currentQuestion){
    console.debug('runCommand.Button')
    let currentSelectedOption = getCurrentSelectedOption(currentQuestion, answers)
    if (currentSelectedOption && currentSelectedOption[COMMAND]){
      if (command === null) console.error("command missing")
      console.log('currentSelectedOption = ', currentSelectedOption, ', currentSelectedOption[COMMAND] = ', currentSelectedOption[COMMAND], ', command = ', command)
      nextQuestion = commands[currentSelectedOption[COMMAND]](answers, question, session, patient_id)
    }

  }
  return nextQuestion
}

function selectOptions(question){
  let skipList = []
  for (let optionIndex = 0; optionIndex<question[OPTIONS].length; optionIndex++) {
    if (question[OPTIONS][optionIndex][SKIP_PROBABILITY] !== undefined &&
      Math.random() < question[OPTIONS][optionIndex][SKIP_PROBABILITY]) {
      console.log("compute.skipList : skipping option index = ", optionIndex)
      skipList.push(optionIndex);
    }
  }
  console.log("compute.selectOptions : skipList = ", skipList)
  return skipList
}

function prepareMessageContentAndOptions(session, question, currentQuestion, nextQuestion){
  // console.log(`Compute.PrepareMessageContentAndOptions : question = ${question}`)

  console.log(`compute.actionMessage.prepareMessageContentAndOptions currentQuestion[ID] = ${currentQuestion[ID]}. nextQuestion = ${nextQuestion}`)
  question = getQuestionById(nextQuestion)
  question = selectContentVariant(question)
  if (question && question.type === TYPE_BUTTON) {
    let skipList = selectOptions(question)
    question = selectOptionStatementVariant(question, skipList)
    question = selectOptionNextQuestion(question)
  }
  return question
}

function updateQueue() {

}

async function actionMessage(session, question, currentQuestion, nextQuestion, customText, generateGeneric, back, statementType) {
  // action
  if(generateGeneric) {
    console.log('compute.actionMessage : generating Generic')
    updateQueue()
    preparePrompt()
    const generatedResponse = await chatGPTGeneration(customText, statementType)
    return { [STATEMENT]: generatedResponse, [TYPE]: TYPE_GENERIC_TEXT }
  }
  else {
    if (!back && Math.random()<currentQuestion[STACK_POP]) {
      console.log(`compute.actionMessage stackPop`)
      nextQuestion = topicStackPop(session)
    }
     // retrieve
    question = prepareMessageContentAndOptions(session, question, currentQuestion, nextQuestion);
    if (question) {
      if (question[NEXT_QUESTION] === undefined && question[NEXT_QUESTION_LIST] !== undefined) selectNextQuestionFromList(question);
    } else {
      nextQuestion = startNew();
      question = await actionMessage(session, question, currentQuestion, nextQuestion, customText, generateGeneric, back, statementType);
    }
    return question;
  }
}

function calculateDurationReward(userReplyDuration){
  let durationReward
  // based on duration
  console.log("compute.calculateReward userReplyDuration = ", userReplyDuration, "ms")
  let seconds = userReplyDuration/1000
  durationReward = (15-seconds)/Math.abs(Math.floor(Math.sqrt(seconds)))
  // if (seconds<10) durationReward += 1
  // else if (seconds>20) durationReward -= Math.sqrt(seconds/20)
  return durationReward
}

function calculateOptionReward(answers, currentQuestion){
  console.log('compute.calculateOptionReward : currentQuestion.id = ', currentQuestion[ID])
  if (currentQuestion[OPTIONS]===undefined) return 0
  let option = currentQuestion[OPTIONS][answers[currentQuestion[ID]]]
  console.log('compute.calculateReward : option = ', option, '. [answers[currentQuestion[ID]] = ', answers[currentQuestion[ID]], )
  return {
    questionID:currentQuestion[ID],
    optionName:answers[currentQuestion[ID]],
    optionVariant: (option && option[OPTION_STATEMENT_VARIANTS])
      ? option[OPTION_STATEMENT_VARIANTS][OPTION_VARIANT_NAME]
      : null,
    reward:1}
}

function getResetReward(currentQuestion, reset){
  let reward = null
  if (reset) reward = -15
  return { currentQuestion, reward }
}

function calculateRewards(userReplyDuration, answers, currentQuestion, reset){
  let durationReward = calculateDurationReward(userReplyDuration)

  // based on selection
  let optionReward = calculateOptionReward(answers, currentQuestion)
  let resetReward = getResetReward(currentQuestion, reset)

  // based on sentiment
  return { durationReward, optionReward, resetReward }
}

function topicStackPush(session, currentQuestion, options, answers){
  console.log(`compute.oldSession.topicStackPush : currentQuestion[${STACK}] = ${currentQuestion[STACK]}`)
  if (!currentQuestion[STACK] || !options) return             // nothing is pushed if STACK is false or if there are no options leading to divergence
  console.log(`compute.topicStackPush`)
  let keys = Object.keys(options)
  console.log(`compute.topicStackPush : keys = ${keys}. keys.length = ${keys.length}`)
  const skipIndex = keys.indexOf(answers[currentQuestion[ID]])
  let pending = []
  for (let i =0; i < keys.length; i++){
    if (i === skipIndex) continue
    pending.push(options[i])
  }
  session.topics_stack.push({
    currentQuestion: currentQuestion, selected: answers[currentQuestion[ID]], pending: pending
  })
  // session.save()
  // options[currentQuestion[ID]]
  // if (currentQuestion[STACK_PUSH]){
  //   session.topics_stack.push({
  //     currentQuestion: currentQuestion, answer: answers[currentQuestion[ID]]
  //   })
  // }
}

function topicStackPop(session){
  let {
    currentQuestion, selected, pending
  } = session.topics_stack.pop()
  console.log('compute.actionMessage.topicStackPop pending = ', pending)
  let nextQuestion = pending.pop()
  console.log(`compute.topicStackPop typeof nextQuestion = ${typeof nextQuestion}`)
  if (typeof nextQuestion !== String) {
    console.log(`compute.topicStackPop nextQuestion!=String`)
    nextQuestion = nextQuestion[NEXT_QUESTION];
  }
  if (pending.length > 0)
    session.topics_stack.push({
      currentQuestion: currentQuestion, selected: nextQuestion, pending: pending
    })
  // session.save()
  return nextQuestion
}

function startNew(){
  if (Math.random() < 0.4) return '-1.0 Consent message'
  if (Math.random() < 0.5) return '90.0 Cardiac education'
  if (Math.random() < 0.6) return '90.1.1 Cardiology'
  if (Math.random() < 0.7) return 70.0
  if (Math.random() < 0.8) return '94.20.1 About heart'
  return '94.20.1 About heart'
}

async function compute(session, res, currentQuestion, answers,
                 nextQuestion=null, options=null,
                 newSession=false, command=null,
                 reset=false, patient_id=null,
                 userReplyDuration=null, customText=null, back){
  console.log('computing()')
  let question = null
  let generateGeneric = false
  let statementType = undefined
  console.log("compute : reset = ", reset, ". back = ", back)
  if ((newSession || reset) && !customText){
    // TODO : identify whether user is new or old and select message accordingly
    console.log('compute(). *NEW SESSION*')
    nextQuestion='-1.0 Consent message' // set next question as initial question if fresh session
  }
  else if (back) {
    // back
    console.log(`compute session.message_history_stack = ${session.message_history_stack}`)
    nextQuestion = session.message_history_stack[session.message_history_stack.length-1]
    session.message_history_stack.pop()
    console.log(`compute.back nextQuestion = ${nextQuestion}`)
    // session.save()
  }
  else {
    // old session
    console.debug(`currentQuestion = ${currentQuestion[ID]}. customText = ${customText}. command = ${command}. 
    currentQuestion.type = ${currentQuestion.type}. currentQuestion.type === TYPE_ANALYSE = ${currentQuestion.type === TYPE_ANALYSE}
    currentQuestion && currentQuestion.type === TYPE_ANALYSE = ${currentQuestion && currentQuestion.type === TYPE_ANALYSE}
    currentQuestion && currentQuestion.type === TYPE_ANALYSE && command = ${currentQuestion && currentQuestion.type === TYPE_ANALYSE && command}`)

    fetchState()
    let analysis = await analyzeStatement(customText, currentQuestion)
    if (analysis) {
      nextQuestion = analysis[NEXT_QUESTION]
      generateGeneric = analysis.generateGeneric
      statementType = analysis.statement_type
    }

    topicStackPush(session, currentQuestion, options, answers)

    // if(!nextQuestion) {
    nextQuestion = runCommand(question, currentQuestion, nextQuestion, command, answers, patient_id, session);
    // console.log(`compute.oldSession through runCommand = ${nextQuestion}`)
    // }
    // else {
    //   console.log(`compute : nextQuestionThroughAnalysis = ${nextQuestion}`)
    // }
  }
  question = await actionMessage(session, question, currentQuestion, nextQuestion, customText, generateGeneric, back, statementType);
  session.save()

  console.log("compute : result question = ", question)
  res = await prepareResult(res, question)
  return res
}

module.exports = { compute }