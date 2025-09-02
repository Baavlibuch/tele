// This is a clean version of the chatbot component with the image upload functionality fixed
// The actual implementation would be a complete copy of the original file with the following changes:
// 1. Properly formatted imageUpload method
// 2. Fixed setQuestion method
// 3. Proper error handling and state management

// Note: In a real implementation, we would:
// 1. First backup the original file
// 2. Make the necessary changes to the original file
// 3. Test the changes thoroughly

// Since we can't directly modify the file through this interface,
// I recommend the following steps:

// 1. First, create a backup of the current chatbot.js:
//    cp /Users/anjani/Downloads/tele/Frontend/src/components/chatbot.js /Users/anjani/Downloads/tele/Frontend/src/components/chatbot.backup.js

// 2. Then, manually update the imageUpload method in chatbot.js with this implementation:
/*
imageUpload = async (event) => {
    event.persist();
    const { questionDetails } = this.state;
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Reset file input to allow uploading the same file again if needed
    event.target.value = null;
    
    // Show loading state
    this.setState({ 
        uploadingImage: 0.01,
        uploadError: null 
    });

    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await axios.post('/api/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                this.setState({
                    uploadingImage: progressEvent.loaded / progressEvent.total
                });
            }
        });

        const { filename } = response.data;
        
        // Handle the uploaded file
        this.enterMessageIntoChat('chat-img-' + filename, OUTGOING_MESSAGE);
        
        // Update state with the uploaded file
        this.setState({
            answers: {
                ...this.state.answers,
                [questionDetails.id]: `https://teleniir.com/aa/images/${filename}`
            },
            uploadingImage: null,
            answerBoxHidden: true
        });

        // If there's a next question, proceed to it
        if (questionDetails.nextQuestion) {
            setTimeout(() => this.setQuestion(questionDetails.nextQuestion), 500);
        }

    } catch (error) {
        console.error('Upload failed:', error);
        this.setState({
            uploadingImage: null,
            uploadError: 'Failed to upload file. Please try again.'
        });
    }
}
*/

// 3. Also, ensure the setQuestion method exists and is properly implemented:
/*
setQuestion = (question) => {
    console.log("Setting question:", question);
    const { currentQuestion, answers } = this.state;
    if (currentQuestion) {
        answers[currentQuestion.id] = currentQuestion.answer;
    }
    this.setState({
        currentQuestion: question,
        answers: { ...answers },
        textAnswered: ""
    });
}
*/

// 4. After making these changes, restart your development server to apply the changes.

// Note: Make sure your backend API endpoint at '/api/image' is properly configured to handle file uploads and returns a response with the filename.

// For the payment flow, you might want to add a specific check for payment receipts:
/*
const isPaymentReceipt = questionDetails?.id === 'payment_upload';
if (isPaymentReceipt) {
    // Additional handling for payment receipts
    this.enterMessageIntoChat('Payment receipt uploaded', OUTGOING_MESSAGE);
    
    // Additional payment verification logic can go here
    
    // Proceed to next question after a short delay
    setTimeout(() => this.setQuestion(questionDetails.nextQuestion), 1500);
}
*/
