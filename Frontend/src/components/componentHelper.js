export function getDescriptionImage(statement, language) {
    // Check if statement is defined
    if (!statement) {
        console.warn("getDescriptionImage: statement is undefined.");
        return null;
    }

    let description_image = statement.description_image;
    if (description_image) {
        console.log(`chatbot.render.descriptionImage.componentHelper.getDescriptionImage typeof description_image = ${typeof description_image}`);
        if (typeof description_image === 'string') {
            console.log(`chatbot.render.descriptionImage.componentHelper.getDescriptionImage : Default description image. Path = ${description_image}`);
        } else {
            description_image = description_image[language];
            console.log(`chatbot.render.descriptionImage.componentHelper.getDescriptionImage : Multilingual description images. Path = ${description_image}`);
        }
    }
    return description_image;
}
