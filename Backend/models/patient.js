const mongoose = require('mongoose');

const { Schema } = mongoose;

const Chat = new Schema({
	statement: String,
	type: String,
	timestamp: {
        type: Date,
        default: Date.now
    }
});

const Timestamps = new Schema({
	time: Number,
	id: String
});

const ConversationState = new Schema({
	topic: {},
			stack: [],
			queue: [],
			last_message: {},
			intention: {}
})

const prescriptionSchema = new Schema({
    id: {
        type: Number,
        required: true,
        default: () => Math.floor(100000 + Math.random() * 900000), // Generate a random 6-digit ID
    },
    notation: {
        type: String,
        default: "",
    },
    saltName: {
        type: String,
        default: "",
    },
    dosage: {
        type: String,
        default: "",
    },
    remarks: {
        type: String,
        default: "",
    },
});

// create a schema
const PatientSchema = new Schema(
	{
		_id: {
			type: String,
			required: true
		},
		patientId: {
			type: String,
			default: function() {
				return this._id; // Use _id as patientId by default
			}
		},
		// Add virtual for formatted registration date
		registeredAt: {
			type: Date,
			get: function() {
				return this.created_at ? new Date(this.created_at) : null;
			}
		},
		// Add virtual for last visit date
		lastVisitedAt: {
			type: Date,
			get: function() {
				return this.last_messaged_at ? new Date(this.last_messaged_at) : null;
			}
		},
		conversation_sessions: [String],
		chat: [Chat],
		facts:{},
		patient_state:{},
		conversation_state: ConversationState,
		monte_carlo_tree: [],

		SPO2_value: String,
		BP_systolic: String,
		BP_diastolic: String,
		heart_rate: String,
		Pulserate: String,
		BP_value: String,
		Temperature_value: String,
		Bloodglucose_taken_at: String,
		Bloodglucose_value: String,
		
		prescriptions: [prescriptionSchema],
		prescription: String,//for old database
		pastHistory: String,
		diagnosis: String,
		advice: String,
		specialRemark: String,
		Visit: Number,
		/**
		Vital parameters reading
		*/


		HRCT_report: String,
		CRP_report: String,
		IL6_report: String,
		D_dimer_report: String,
		Ferritinin_report: String,
	    Procalcitonin_report: String,
		KFT_report: String,
		/**
		Pathological reports
		*/


		Covid19_when: {
			type: String,
			required: false,
			default: 'NA'
		},
		Hospitalization_during_covid: {
			type: String,
			required: false,
			default: 'NA'
		},
		duration_hospitalization: {
			type: String,
			required: false,
			default: 'NA'
		},
		steroids_given_duringstay: {
			type: String,
			required: false,
			default: 'NA'
		},
		oxygen_support_duringstay: {
			type: String,
			required: false,
			default: 'NA'
		},
		steroids_taken: {
			type: String,
			required: false,
			default: 'NA'
		},
		discoloration_upper_palette: {
			type: String,
			required: false,
			default: 'NA'
		},
		swelling_upper_pallette: {
			type: String,
			required: false,
			default: 'NA'
		},
		can_close_eyes: {
			type: String,
			required: false,
			default: 'NA'
		},
		can_feel_nose_and_cheek: {
			type: String,
			required: false,
			default: 'NA'
		},
		symptoms: {
			type: String,
			trim: true,
			required: [true, 'Symptoms are required']
		},
		symptoms_Duration: {
			type: String,
			trim: true,
			required: [true, 'Symptom duration is required']
		},
		vaccination_status: String,
		symptomatic_forcovid: Boolean,
		BP_Image: String,
		Spo2_Image: String,
		ECG_Image: String,
		Signature: String,

		/*
		 * Cardiac screening
		 */
		chest_pain: {
			type: String,
			required: false,
			default: 'NA'
		},
		cardiac_point_chest_pain: {
			type: String,
			required: false,
			default: 'NA'
		},
		cardiac_score: {
			type: String,
			required: false,
			default: 'NA'
		},
		cardiac_left_arm_pain: {
			type: String,
			required: false,
			default: 'NA'
		},
		cardiac_left_arm_pain_inside: {
			type: String,
			required: false,
			default: 'NA'
		},
		cardiac_arm_movement_pain: {
			type: String,
			required: false,
			default: 'NA'
		},
		cardiac_arm_pressure_pain: {
			type: String,
			required: false,
			default: 'NA'
		},
		cardiac_sweating: {
			type: String,
			required: false,
			default: 'NA'
		},
		cardiac_breathlessness: {
			type: String,
			required: false,
			default: 'NA'
		},
		cardiac_fatigue: {
			type: String,
			required: false,
			default: 'NA'
		},
		angina: {
			type: String,
			required: false,
			default: 'NA'
		},
		cardiac_exertion: {
			type: String,
			required: false,
			default: 'NA'
		},
		angina_episodes: {
			type: String,
			required: false,
			default: 'NA'
		},
		unstable_angina: {
			type: String,
			required: false,
			default: 'NA'
		},

		/*
		 * Crdiac Status
		 */
		// TODO
		is_cardiac_patient: Boolean,
		cardiac_surgery_in_the_past: Boolean,

		/**
		 * based on AIIMS delhi guidelines
		 * pre-assessment of patient is assessed
		 * if (s)he is a COVID-19 suspect
		 * According to age range
		 */
		symptomatic_formucormycosis: Boolean, /** from the current symptoms*/
		/**
		 * additional symptom information
		 * provided by patient* under covid-19 consultancy
		 */
		additional_symptoms: String,
		name: {
			type: String,
			trim: true,
			required: [true, 'Patient name is required'],
			minlength: [2, 'Name must be at least 2 characters long']
		},
		email: String,
		telephone: {
			type: String,
			trim: true,
			required: [true, 'Phone number is required'],
			match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
		},
		gender: String,
		age: String,
		Profession: String,
		latitude: Number,
		longitude: Number,
		ip: String,
		/**
		 * patient registered at
		 */
		created_at: Number,
		/**
		 * records time patient last messaged at
		 * it is used in deciding the last active time of patient
		 */
		last_messaged_at: Number,
		/**
		 * time on which the patient was last emailed
		 * for a message from doctor
		 */
		last_notified_at: Number,
		/**
		 * this contains the socket id of patient while chatting
		 * it is used by IO to emit events.
		 */
		chat_id: {
			type: String,
			default: ''
		},
		/**
		 * doctor he is presently seeking
		 * this field changes only at referral
		 */
		doctor: String,
		village: {
			type: String,
			trim: true,
			required: [true, 'Village name is required']
		},
		hospital: String,
		aiims_id: String,
		behavior: String,
		/**
		 * value is either "OPD" or "COVID-19"
		 */
		type: String,
		opd_symptoms: String,
		opd_symptoms_age: String,
		timestamps: [Timestamps],
		followup: {
			type: Number,
			default: 0,
			min: [0, 'Follow-up count cannot be negative']
		}
	},
	{ _id: false }
);

// Add indexes for frequently queried fields
PatientSchema.index({ name: 1 });
PatientSchema.index({ telephone: 1 }, { unique: true });
PatientSchema.index({ doctor: 1 });
PatientSchema.index({ village: 1 });
PatientSchema.index({ created_at: -1 });
PatientSchema.index({ last_messaged_at: -1 });

// Virtual for patient's full details
PatientSchema.virtual('patientDetails').get(function() {
	return {
		id: this._id,
		name: this.name,
		telephone: this.telephone,
		village: this.village,
		symptoms: this.symptoms,
		symptoms_Duration: this.symptoms_Duration,
		registeredAt: this.registeredAt,
		lastVisitedAt: this.lastVisitedAt,
		followup: this.followup,
		doctor: this.doctor
	};
});

// Create text index for search
PatientSchema.index(
	{ 
		name: 'text',
		telephone: 'text',
		village: 'text',
		symptoms: 'text',
		diagnosis: 'text'
	},
	{
		weights: {
			name: 10,
			telephone: 10,
			village: 5,
			symptoms: 3,
			diagnosis: 2
		},
		name: 'patient_search_index'
	}
);

// create the model
const Patient = mongoose.model('Patient', PatientSchema, 'patients');

// export the model
module.exports = Patient;
