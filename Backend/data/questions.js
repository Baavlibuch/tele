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
const OPTION_VARIANT_NAME = "option_name"
const OPTION_STATEMENT_VARIANTS = "option_statement_variants"
const OPTION_NAME = "option_name"
const ALWAYS_SHOW_OPTION = "always_show_option"
const FACT = "fact"
const SKIP_PROBABILITY = "skip_probability"
const STACK = "stack"
const STACK_POP = "stack_pop"
const DOWNLOAD = "download"
const FLOW = "flow"
const PROCESS = "process"
const FACTORS = "factors"
const OPERATION = "operation"
const DECISION = "decision"
const SCORE = "score"
const TEXT = "text"
const AUDIO = "audio"

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
const LANG_MARWARI = "mwr"                  // ISO 639-2 Code

// Message Creator ID
const DOCTOR = "doctor"
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
    [LANG_ENGLISH]: "Yes ✔️",
    [LANG_HINDI]: "हाँ ✔️",
    [LANG_BANGLA]: 'হ্যাঁ ✔️',
    [LANG_MARWARI]: "हाँ ✔️"
}
const STATEMENT_NO = {
    [LANG_ENGLISH]: "No ❌",
    [LANG_HINDI]: "नहीं ❌",
    [LANG_BANGLA]: 'না ❌',
    [LANG_MARWARI]: "ना ❌"
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

module.exports = {
    [QUESTIONS]: [
        {
            [ID]: "-1.0 Consent message",
            [NEXT_QUESTION_LIST]: [
                {
                    // [DEFAULT_ASK]: true,
                    [NEXT_QUESTION]: 1.0,
                    [VARIANT_PROBABILITY]: 0.4
                }
            ],
            [CONTENT_VARIANTS]: [
                {
                    [CONTENT_VARIANT_NAME]: "Consent message short emojis",
                    [STATEMENT]: {
                        [LANG_ENGLISH]: "By continuing, you agree to take part in the testing of this chat-bot 🤖 and your data being collected and used for research purposes. 📝\n" +
                        "It will be kept securely 🛡️ and will not be shared with any third parties.",
                        [LANG_HINDI]: "बातें जारी रखकर, आप इस चैट-बॉट 🤖 के परीक्षण में भाग लेने के लिए सहमत हैं। आपका डेटा एकत्रित किया जाएगा और शोध उद्देश्यों के लिए उपयोग किया जाएगा। 📝\n" +
                        "इसे सुरक्षित रखा जाएगा 🛡️ और किसी तीसरे पक्ष के साथ साझा नहीं किया जाएगा।"
                    },
                    [VARIANT_PROBABILITY]: 0.1
                },
                {
                    [CONTENT_VARIANT_NAME]: "Consent message short no emojis",
                    [STATEMENT]: {
                        [LANG_ENGLISH]: "By continuing, you agree to take part in the testing of this chat-bot and your data being collected and used for research purposes. \n" +
                        "It will be kept securely and will not be shared with any third parties.",
                        [LANG_HINDI]: "बातें जारी रखकर, आप इस चैट-बॉट के परीक्षण में भाग लेने के लिए सहमत हैं। आपका डेटा एकत्रित किया जाएगा और शोध उद्देश्यों के लिए उपयोग किया जाएगा।\n" +
                        "इसे सुरक्षित रखा जाएगा और किसी तीसरे पक्ष के साथ साझा नहीं किया जाएगा।"
                    },
                    [VARIANT_PROBABILITY]: 0.2
                },
                {
                    [CONTENT_VARIANT_NAME]: "Consent message original from telemedicine",
                    [STATEMENT]: {
                        [LANG_ENGLISH]: "Disclaimer: We collect your personal information like name, age, phone number for registration purposes. We do not share this information with any other third parties nor do we use it for commercial purposes. We may use your information for the purpose of our research and to create innovative and enhanced services. We also use third party web analytical services such as Google Analytics which may collect information relating to your use of this website.",
                        [LANG_HINDI]: "अस्वीकरण: हम आपकी व्यक्तिगत जानकारी जैसे नाम, आयु, फोन नंबर पंजीकरण के प्रयोजनों के लिए एकत्र करते हैं। हम इस जानकारी को किसी अन्य तीसरे पक्ष के साथ साझा नहीं करते हैं और न ही हम इसका उपयोग व्यावसायिक उद्देश्यों में करते हैं। हम आपकी जानकारी का उपयोग हमारे शोध के उद्देश्य और नवीन और उन्नत सेवाओं को बनाने के लिए कर सकते हैं। हम गूगल एनालिटिक्स जैसी थर्ड पार्टी वेब विश्लेषणात्मक सेवाओं का भी उपयोग करते हैं जो इस वेबसाइट के आपके उपयोग से संबंधित जानकारी एकत्र कर सकती हैं।"
                    },
                    [VARIANT_PROBABILITY]: 0.3
                }
                // ,
                // {
                //     [CONTENT_VARIANT_NAME]: "just link",
                //     [STATEMENT]: {
                //         [LANG_ENGLISH]: "By continuing, you agree with <u>the study and the privacy policy</u>",
                //         [LANG_HINDI]: "बातें जारी रखकर, आप <u>स्टडी एवं प्राइवसी पॉलिसी से सहमत हैं</u>",
                //         [URL]: "https://www.aiimsjodhpur.edu.in/Patient_Portal/"
                //     },
                // }
            ],
            [TYPE]: TYPE_NONE
        },
        {
            [ID]: "-1.1 Why no consent",
            [STATEMENT]: STATEMENT_WHY_NOT,
            [NEXT_QUESTION]: "-1.2 Disclaimer",
            [TYPE]: TYPE_TEXT
        },
        {
            [ID]: "-1.2 Disclaimer",
            [STATEMENT]: {
                en: 'Disclaimer: We collect your personal information such as name, age, phone number for registration purposes. We do not share this information with any other third party nor do we use it for commercial purposes. We may use your information for the purpose of our research and to create innovative and advanced services. We also use third party web analytics services such as Google Analytics which may collect information related to your use of this website.',
                hi: 'अस्वीकरण: हम आपकी व्यक्तिगत जानकारी जैसे नाम, आयु, फोन नंबर पंजीकरण के प्रयोजनों के लिए एकत्र करते हैं। हम इस जानकारी को किसी अन्य तीसरे पक्ष के साथ साझा नहीं करते हैं और न ही हम इसका उपयोग व्यावसायिक उद्देश्यों में करते हैं। हम आपकी जानकारी का उपयोग हमारे शोध के उद्देश्य और नवीन और उन्नत सेवाओं को बनाने के लिए कर सकते हैं। हम गूगल एनालिटिक्स जैसी थर्ड पार्टी वेब विश्लेषणात्मक सेवाओं का भी उपयोग करते हैं जो इस वेबसाइट के आपके उपयोग से संबंधित जानकारी एकत्र कर सकती हैं।',
                bn: 'দাবি অস্বীকার: আমরা আপনার ব্যক্তিগত তথ্য যেমন নাম, বয়স, নাম্বার জন্য ফোন নম্বর সংগ্রহ করি। আমরা এই তথ্যটি অন্য কোনও তৃতীয় পক্ষের সাথে ভাগ করি না বা আমরা বাণিজ্যিক উদ্দেশ্যে এটি ব্যবহার করি না। আমরা আপনার তথ্য আমাদের গবেষণার উদ্দেশ্যে এবং উদ্ভাবনী এবং উন্নত পরিষেবা তৈরি করতে ব্যবহার করতে পারি। আমরা তৃতীয় পক্ষের ওয়েব অ্যানালিটিক্স পরিষেবাদি যেমন গুগল অ্যানালিটিক্স ব্যবহার করি যা আপনার ওয়েবসাইটের ব্যবহার সম্পর্কিত তথ্য সংগ্রহ করতে পারে।'
            },
            [NEXT_QUESTION]: 1.0,
            [TYPE]: TYPE_NONE
        },
        {
            [ID]: 1.0,
            [OPTIONS]: [
                {
                    [NEXT_QUESTION]: 2.5,//23.0,
                    [STATEMENT]: {
                        [LANG_ENGLISH]: "Consultation 👨‍⚕️",
                        [LANG_HINDI]: "डॉक्टर से बात 👨‍⚕️"
                    },
                    [VALUE]: 0
                }
            ],
            [STATEMENT]: {
                [LANG_ENGLISH]: "Choose your option for further interaction",
                [LANG_HINDI]: "आगे की बातचीत के लिए अपना विकल्प चुनें"
            },
            [TYPE]: TYPE_BUTTON
        },

        {
            [ID]: 2.0,
            [NEXT_QUESTION]: 3.0,
            [STATEMENT]: {
                [LANG_ENGLISH]: "Follow the steps given in the upcoming statements",
                [LANG_HINDI]: "आगामी कथनों में दिए गए चरणों का पालन करें"
            },
            [TYPE]: TYPE_NONE
        },
        {
            [ID]: 11.1,
            [NEXT_QUESTION]: NEXT_QUESTION_ENDS_FLOW,
            [STATEMENT]: {
                [LANG_HINDI]: "आपका दिन शुभ हो 😊",
                [LANG_ENGLISH]: "Have a nice day 😊."
            },
            [TYPE]: TYPE_NONE
        },
/////////////////////////////////////////////////
        {
            "id": 22.0,
            "options": [
                {
                    "dbValue": "Yes",
                    "nextQuestion": 23,
                    "statement": {
                        "hi": "हाँ",
                        "en": "Yes"
                    },
                    "value": 0
                },
                {
                    "dbValue": "No",
                    "nextQuestion": 1.0,
                    "statement": {
                        "hi": "नहीं",
                        "en": "No"
                    },
                    "value": 1
                }
            ],
            "statement": {
                "hi": "क्या आप डॉक्टर से बात के लिए जाना चाहेंगे?",
                "en": "Would you like to go for consultation?"
            },
            "type": "button"
        },
      // covid consultation
        {
            [ID]: 23.0,
            [OPTIONS]: [
                {
                    [NEXT_QUESTION]: 28.0,
                    [STATEMENT]: {
                        [LANG_ENGLISH]: "New consultation",
                        [LANG_HINDI]: "नया परामर्श"
                    },
                    [VALUE]: 0
                },
                {
                    [NEXT_QUESTION]: 24.0,
                    [STATEMENT]: {
                        [LANG_HINDI]: "पिछला परामर्श",
                        [LANG_ENGLISH]: "Previous consultation"
                    },
                    [VALUE]: 1
                },
                {
                    [NEXT_QUESTION]: "9997.0 Redirecting",
                    [STATEMENT]: {
                        [LANG_ENGLISH]: "AIIMS portal",
                        [LANG_HINDI]: "एम्स पोर्टल"
                    },
                    [VALUE]: 2,
                    [URL]: "https://www.aiimsjodhpur.edu.in/Patient_Portal/"
                }
            ],
            [STATEMENT]: {
                [LANG_HINDI]: "डॉक्टर से बात के लिए अपना विकल्प चुनें",
                [LANG_ENGLISH]: "Choose your option for consultation"
            },
            [TYPE]: TYPE_BUTTON
        },
        {
            "id": 24.0,
            "nextQuestion": 25.0,
            "statement": {
                "hi": "आपका नाम? पहले के डॉक्टर से बात के लिए उपयोग किया गया",
                "en": "Your name? Used for the earlier consultation"
            },
            [TYPE]: TYPE_TEXT
        },
        {
            "id": 25.0,
            "nextQuestion": 26,
            "pattern": "[0-9]{10}",
            "statement": {
                "hi": "आपका संपर्क नंबर? जिसे आपने पहले पंजीकृत किया था",
                "en": "Your contact number? Which you registered previously"
            },
            "type": "tel"
        },
        {
            "id": 26.0,
            "options": [
                {
                    "dbValue": "NIIRNCD",
                    "nextQuestion": NEXT_QUESTION_ENDS_FLOW,//27.0,
                    "statement": {
                        "hi": "NIIRNCD",
                        "en": "NIIRNCD"
                    },
                    "value": 0
                },
                {
                    "dbValue": "ICMR",
                    "nextQuestion": NEXT_QUESTION_ENDS_FLOW,//27.0,
                    "statement": {
                        "hi": "ICMR",
                        "en": "ICMR"
                    },
                    "value": 0
                },
                // {
                //     "dbValue": "AIIMS Jodhpur",
                //     "nextQuestion": NEXT_QUESTION_ENDS_FLOW,//27.0,
                //     "statement": {
                //         "hi": "AIIMS Jodhpur",
                //         "en": "AIIMS Jodhpur"
                //     },
                //     "value": 0
                // }
                
            ],
            "statement": {
                "hi": "डॉक्टर या अस्पताल चुनकर जांच शुरू करें",
                "en": "Start the investigation by choosing a doctor or hospital"
            },
            "type": "select"
        },
        {
            "id": 27.0,
            "nextQuestion": 26.1,
            "statement": {
                "hi": "एम्स के मरीज की आईडी?",
                "en": "AIIMS patient's ID?"
            },
            "type": "text"
        },
        // TODO
        {
            "id": 26.1,
            "options": [
                {
                    "nextQuestion": 26.2,
                    "statement": {
                        "hi": "रसीद अपलोड करें",
                        "en": "Upload receipt"
                    },
                    "value": 0
                },
                {
                    [NEXT_QUESTION]: NEXT_QUESTION_ENDS_FLOW,
                    "statement": {
                        "hi": "छोड़ें",
                        "en": "Skip"
                    },
                    "value": 1
                }
            ],
            "statement": {
                "hi": "कृपया यूपीआई आईडी पर शुल्क का भुगतान करें और रसीद या स्क्रीनशॉट अपलोड करें। पिछले मैसेज में UPI और फीस लिखी हुई है। अगर नहीं लिखा है तो कृपया स्किप करें।",
                "en": "Please pay the fees on the UPI ID and upload the receipt or screenshot. UPI and fees are written in the previous message. Please skip if not written."
            },
            "type": "button"
        },
        {
            "id": 26.2,
            [NEXT_QUESTION]: NEXT_QUESTION_ENDS_FLOW,
            "statement": {
                "hi": "कृपया अपलोड करने के लिए एक तस्वीर का चयन करें",
                "en": "Please select an image to upload"
            },
            "type": "upload"
        },
        {
            [ID]: 28.0,
            [OPTIONS]: [
                {
                    [DB_VALUE]: "OPD",
                    [NEXT_QUESTION]: 2.5,
                    [STATEMENT]: {
                        [LANG_HINDI]: "ओ.पी.डी / सामान्य परामर्श",
                        [LANG_ENGLISH]: "O.P.D / General counseling"
                    },
                    [VALUE]: 0
                }
            ],
            [STATEMENT]: {
                [LANG_HINDI]: "अपना विकल्प चुनें",
                [LANG_ENGLISH]: "Choose your option"
            },
            [TYPE]: TYPE_BUTTON
        },
      // Covid/Mucormycosis consultation
        {
            "id": 29.0,
            "nextQuestion": 30.0,
            "statement": {
                "hi": "आपका नाम क्या हे?",
                "en": "What is your name?"
            },
            "type": "text"
        },
        {
            [ID]: 30.0,
            [NEXT_QUESTION]: 31.0,
            [PATTERN]: "[0-9]{10}",
            [STATEMENT]: {
                [LANG_HINDI]: "आपका संपर्क नंबर? भविष्य में यदि आवश्यक हो तो संपर्क करने के लिए",
                [LANG_ENGLISH]: "Your contact number? To contact in the future if required"
            },
            [TYPE]: TYPE_TELEPHONE
        },
        {
            "id": 31.0,
            "nextQuestion": 32.0,
            "pattern": "[0-9]{1,3}",
            "statement": {
                "hi": "आपकी उम्र क्या हैं?",
                "en": "What is your age?"
            },
            "type": "tel"
        },
        {
            "id": 32.0,
            "options": [
                {
                    "dbValue": "Male",
                    "nextQuestion": 33.0,
                    "statement": {
                        "hi": "पुरुष",
                        "en": "Male"
                    },
                    "value": 0
                },
                {
                    "dbValue": "Female",
                    "nextQuestion": 33.0,
                    "statement": {
                        "hi": "महिला",
                        "en": "Female"
                    },
                    "value": 1
                },
                {
                    "dbValue": "Other",
                    "nextQuestion": 33.0,
                    "statement": {
                        "hi": "अन्य",
                        "en": "Other"
                    },
                    "value": 2
                }
            ],
            "statement": {
                "hi": "आपका लिंग क्या है?",
                "en": "What is your gender?"
            },
            "type": "button"
        },

      // OPD questionnaire
        {
            "id": 2.5,
            "nextQuestion": 2.6,
            "statement": {
                "hi": "आपका नाम क्या हे?",
                "en": "What is your name?"
            },
            "type": "text"
        },
        {
            "id": 2.6,
            "nextQuestion": 2.7,
            "pattern": "[0-9]{1,3}",
            "statement": {
                "hi": "आपकी उम्र क्या हैं?",
                "en": "What is your age?"
            },
            "type": "tel"
        },
        {
            "id": 2.7,
            "options": [
                {
                    "dbValue": "Male",
                    "nextQuestion": 2.8,
                    "statement": {
                        "hi": "पुरुष",
                        "en": "Male"
                    },
                    "value": 0
                },
                {
                    "dbValue": "Female",
                    "nextQuestion": 2.8,
                    "statement": {
                        "hi": "महिला",
                        "en": "Female"
                    },
                    "value": 1
                },
                {
                    "dbValue": "Other",
                    "nextQuestion": 2.8,
                    "statement": {
                        "hi": "अन्य",
                        "en": "Other"
                    },
                    "value": 2
                }
            ],
            "statement": {
                "hi": "आपका लिंग क्या है?",
                "en": "What is your gender?"
            },
            "type": "button"
        },
        {
            "id": 2.8,
            "nextQuestion": 2.4,
            "pattern": "[0-9]{10}",
            "statement": {
                "hi": "आपका संपर्क नंबर? भविष्य में आपसे संपर्क करने के लिए",
                "en": "Your contact number? To contact you in the future"
            },
            "type": "tel"
        },
        {
            "id": 2.4,
            "nextQuestion": 2.41,
            "statement": {
                "hi": "अपनी समस्याओं / दृश्यमान लक्षणों का उल्लेख करें",
                "en": "Mention your problems / visible symptoms"
            },
            "type": "text"
        },
        {
            "id": 2.41,
            "nextQuestion": 26,
            "statement": {
                "hi": "आपको यह समस्या कब से है?",
                "en": "How long have you had this problem?"
            },
            "type": "text"
        },
        {
            [ID]: "9997.0 Redirecting",
            [STATEMENT]: {
                [LANG_ENGLISH]: 'Redirecting',
                [LANG_HINDI]: 'पुन: निर्देशित',
            },
            [TYPE]: TYPE_NONE
        },
        {
    			  [ID]: "9998 dead end",
            [STATEMENT]: {
                en: 'You have asked something I am yet to learn. We will figure it out shortly. Did you enjoy the experience?',
                hi: 'आपने कुछ पूछा है जो मुझे अभी सीखना बाकी है। हम जल्द ही इसका पता लगा लेंगे। क्या आपने अनुभव का आनंद लिया?',
            },
            [NEXT_QUESTION]: 0,
    			  [TYPE]: TYPE_BUTTON,
    			  [OPTIONS]: [
    				{
    				    [NEXT_QUESTION]: 1,
    					  [VALUE]: 0,
                [STATEMENT]: STATEMENT_YES,
    					  [DB_VALUE]: DB_VALUE_YES
    				},
    				{
    					  [NEXT_QUESTION]: 1,
    					  [VALUE]: 1,
                [STATEMENT]: STATEMENT_NO,
                [DB_VALUE]: DB_VALUE_NO
    				}
    			]
    		},
        {
    			  [ID]: 9999,
            [STATEMENT]: {
                [LANG_ENGLISH]: 'Begin online consultation?',
                [LANG_HINDI]: 'ऑनलाइन डॉक्टर से बात शुरू करें?',
            },
    			  [TYPE]: TYPE_BUTTON,
    			  [OPTIONS]: [
    				{
    					[NEXT_QUESTION]: 0,
    					[VALUE]: 0,
              [STATEMENT]: {
                [LANG_ENGLISH]: 'Yes',
                [LANG_HINDI]: 'हाँ',
                [LANG_BANGLA]: 'হ্যাঁ',
              },
    					[DB_VALUE]: DB_VALUE_YES
    				},
    				{
    					[NEXT_QUESTION]: 1.0,
    					[VALUE]: 1,
              [STATEMENT]: {
                [LANG_ENGLISH]: 'No',
                [LANG_HINDI]: 'नहीं',
                [LANG_BANGLA]: 'না',
              },
    				}
    			]
    		},

      // Rapport building
        // {
        //     [ID]: "300.0 Opener",
        //     [STATEMENT]:"Hi",
        //     [OPTIONS]:[
        //         {
        //             [OPTION_NAME]: "hi reply",
        //             [STATEMENT]: "Hi!",
        //             [NEXT_QUESTION]: "305.0 Questioner",
        //             [VALUE]:0
        //         },
        //         {
        //             [OPTION_NAME]: "what's up",
        //             [STATEMENT]: "Hi! What's up?",
        //             [NEXT_QUESTION]: 1.0,
        //             [VALUE]:1
        //         }
        //     ],
        //     [TYPE]:TYPE_BUTTON
        // },
        // {
        //     [ID]: "305.0 Questioner",
        //     [STATEMENT]:"How are you?",
        //     [OPTIONS]:[
        //         {
        //             [OPTION_NAME]: "doing good",
        //             [STATEMENT]: "Great!",
        //             [NEXT_QUESTION]: "306.0 compliment because all well",
        //             [VALUE]:0
        //         },
        //         {
        //             [OPTION_NAME]: "sick",
        //             [STATEMENT]: "Sick",
        //             [NEXT_QUESTION]: 1.0,
        //             [VALUE]:1
        //         },
        //         {
        //             [OPTION_NAME]: "bad day",
        //             [STATEMENT]: "Bad day",
        //             [NEXT_QUESTION]: 1.0,
        //             [VALUE]:1
        //         },
        //     ],
        //     [TYPE]:TYPE_BUTTON
        // },
        // {
        //     [ID]: "306.0 Compliment because all well",
        //     [STATEMENT]:"That's great!",
        //     [NEXT_QUESTION]:"310.0 News?",
        //     [TYPE]:TYPE_NONE
        // },
        // {
        //     [ID]: "307.0 What?",
        //     [STATEMENT]:"What's new today?"
        // },
        // {
        //     [ID]: "310.0 News?",
        //     [STATEMENT]:"What's new today?"
        // },
        // {
        //     [ID]: "315.0 Weather?",
        //     [STATEMENT]:"Nice weather?"
        // },
        // {
        //     [ID]: "320.0 Facing problem?",
        //     [STATEMENT]:"I hope you're not facing any problem"
        // },
        // {
        //     [ID]: "225.0 Problem?",
        //     [CONTENT_VARIANTS]:[
        //         {
        //             [CONTENT_VARIANT_NAME]:"ask problem",
        //             [CONTENT_VARIANT_NAME]:"What's the problem happened",
        //         },
        //         {
        //             [CONTENT_VARIANT_NAME]:"ask event",
        //             [CONTENT_VARIANT_NAME]:"Why? What happened",
        //         },
        //         {
        //             [CONTENT_VARIANT_NAME]:"hope",
        //             [CONTENT_VARIANT_NAME]:"I hope it's not that bad",
        //         }
        //     ]
        // },
        // {
        //     [ID]: "-2.0 change topic",
        //     [CONTENT_VARIANTS]:[
        //         {
        //             [CONTENT_VARIANT_NAME]:"concise",
        //             [CONTENT_VARIANT_NAME]:"Let's change the topic",
        //         },
        //         {
        //             [CONTENT_VARIANT_NAME]:"generic",
        //             [CONTENT_VARIANT_NAME]:"Let's talk about something else",
        //         },
        //         {
        //             [CONTENT_VARIANT_NAME]:"regret",
        //             [CONTENT_VARIANT_NAME]:"I'm not smart enough. Let's discuss something else",
        //         }
        //     ],
        //     [NEXT_QUESTION]:1.0
        // },

    ],

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
    STATEMENT_WHY_NOT,
    DOCTOR,
    PROCESS,
    FACTORS,
    DECISION,
    OPERATION,
    STACK,
    STACK_POP,
    DOWNLOAD
}
