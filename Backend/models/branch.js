const mongoose = require("mongoose");

const VisibilityEnum = Object.freeze({
    PUBLIC: "public",
    PRIVATE: "private",
});

const getVisibilityEnum = (visibility) => {
    visibility = visibility ? visibility.toLowerCase() : null;
    switch (visibility) {
        case "public": {
            return VisibilityEnum.PUBLIC;
        }
        case "private": {
            return VisibilityEnum.PRIVATE;
        }
        case null:
        case undefined:
            return VisibilityEnum.PUBLIC;
        default:
            throw new Error("Invalid visibility");
    }
}

const BranchSchema = new mongoose.Schema({
    name: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
    },
    visibility: {
        type: String,
        enum: Object.values(VisibilityEnum),
        default: VisibilityEnum.PUBLIC,
    },
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    }],
});

const Branch = mongoose.model("Branch", BranchSchema);

module.exports = {
    Branch,
    VisibilityEnum,
    getVisibilityEnum,
};
