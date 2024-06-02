const TYPE_NONE = "none"                    // send a message and move to next message. Or run a command
// const TYPE_INCOMING = "incoming"            // send a message and move to next message. Probably
const TYPE_BUTTON = "button"                // choose option from text buttons
const TYPE_LIST = "list"                    // checkboxes
// const TYPE_SELECT = "select"                // spinner
// const TYPE_UPLOAD = "upload"                // upload
const TYPE_TEXT = "text"                    // text
const TYPE_ANALYSE = "analyse"              // complex analyses of user answers on frontend across multiple questions. example cardiac screening
const TYPE_TELEPHONE = "tel"                // complex telephone and age

module.exports = {
  TYPE_NONE, TYPE_BUTTON, TYPE_LIST, TYPE_TEXT, TYPE_ANALYSE, TYPE_TELEPHONE
}