const QUESTIONS = "questions"
const ID = "id";
const OPTIONS = "options"
const NEXT_QUESTION = "nextQuestion"
const NEXT_QUESTION_LIST = "next_question_list"
const NEXT_QUESTION_OBJECT = "next_question_object"
const NEXT_QUESTION_VARIANTS = "next_question_variants"
const DEFAULT_ASK = "default_ask"
const USUAL_ASK = "usual_ask"
const VARIANT_PROBABILITY = "variant_probability"
const STATEMENT = "statement"
const VALUE = "value"
const TYPE = "type"
const CARDIAC_SCORE = "cardiac_score"
const DB_VALUE = "dbValue"
const DESCRIPTION_IMAGE = "description_image"
const BRANCHES = "branches"
const COMMAND = "command"                   // handled by commands.js
const URL = "url"
const PARAMS_FORM = "paramsFrom"            // support commands
const PATTERN = "pattern"            // support commands
const CONTENT_VARIANTS = "content_variants"
const NEXT_MESSAGE_VARIANTS = "next_message_variants"
const CONTENT_VARIANT_NAME = "content_variant_name"
const OPTIONS_VARIANT_NAME = "options_variant_name"
const OPTION_VARIANT_NAME = "option_variant_name"
const OPTION_STATEMENT_VARIANTS = "option_statement_variants"
const OPTION_NAME = "option_name"
const ALWAYS_SHOW_OPTION = "always_show_option"
const FACT = "fact"
const SKIP_PROBABILITY = "skip_probability"

// interaction types
const TYPE_NONE = "none"                    // send a message and move to next message. Or run a command
// const TYPE_INCOMING = "incoming"            // send a message and move to next message. Probably
const TYPE_BUTTON = "button"                // choose option from text buttons
const TYPE_LIST = "list"                    // checkboxes
// const TYPE_SELECT = "select"                // spinner
// const TYPE_UPLOAD = "upload"                // upload
const TYPE_TEXT = "text"                    // text
const TYPE_ANALYSE = "analyse"              // complex analyses of user answers on frontend across multiple questions. example cardiac screening
const TYPE_TELEPHONE = "tel"                // complex telephone and age

// LANGUAGES
const LANG_ENGLISH = "en"
const LANG_HINDI = "hi"
const LANG_BANGLA = "bn"
const LANG_MARWARI = "mwr"

//DB_VALUES
// const DB_VALUE_0 = 0
// const DB_VALUE_1 = 1
// const DB_VALUE_2 = 2
// const DB_VALUE_3 = 3
// const DB_VALUE_4 = 4
// const DB_VALUE_5 = 5
// const DB_VALUE_6 = 6
// const DB_VALUE_7 = 7
// const DB_VALUE_8 = 8
// const DB_VALUE_OPD = "OPD"
const DB_VALUE_YES = "Yes"
const DB_VALUE_NO = "No"
// const DB_VALUE_RESTART = "Restart"
// const DB_VALUE_END = "End"
// const DB_VALUE_AIIMSJ = "AIIMS Jodhpur"

// common values
const STATEMENT_YES = {
    [LANG_ENGLISH]: "Yes✔️",
    [LANG_HINDI]: "हाँ✔️",
    [LANG_BANGLA]: 'হ্যাঁ✔️'
}
const STATEMENT_NO = {
    [LANG_ENGLISH]: "No ❌",
    [LANG_HINDI]: "नहीं ❌",
    [LANG_BANGLA]: 'না ❌'
}
// const STATEMENT_CORRECT = {
//     [LANG_ENGLISH]: "Correct answer!",
//     [LANG_HINDI]: "सही जवाब!",
// }
// const STATEMENT_WRONG = {
//     [LANG_ENGLISH]: "Wrong answer",
//     [LANG_HINDI]: "गलत जवाब"
// }
const STATEMENT_TRUE = {
    [LANG_ENGLISH]: "True",
    [LANG_HINDI]: "सत्य",
}
const STATEMENT_FALSE = {
    [LANG_ENGLISH]: "False",
    [LANG_HINDI]: "असत्य"
}
const STATEMENT_WHY_NOT = {
    [LANG_ENGLISH]: "Why not",
    [LANG_HINDI]: "क्यों नहीं"
}
const CARDIAC_CURIOSITY = "111.0 Still curious"
const NEXT_QUESTION_ENDS_FLOW = 0                   // end chatbot. sometimes communicate with doctor

export {
    CONTENT_VARIANTS,
    CONTENT_VARIANT_NAME,
    STATEMENT,
    NEXT_QUESTION_LIST,
    NEXT_QUESTION_VARIANTS,
    NEXT_QUESTION,
    USUAL_ASK,
    DEFAULT_ASK,
    VARIANT_PROBABILITY,
    OPTIONS,
    OPTION_STATEMENT_VARIANTS,
    OPTION_VARIANT_NAME,
    TYPE,
    ID,
    BRANCHES,
    DB_VALUE,
    VALUE,
    COMMAND,
    LANG_MARWARI,
    LANG_BANGLA,
    LANG_HINDI,
    LANG_ENGLISH,
    DESCRIPTION_IMAGE,
    SKIP_PROBABILITY,
    FACT,
    STATEMENT_YES,
    STATEMENT_NO,
    STATEMENT_TRUE,
    STATEMENT_FALSE,
    STATEMENT_WHY_NOT
}