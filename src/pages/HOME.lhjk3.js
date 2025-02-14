// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction

$w.onReady(function () {
    // Initialize page elements
    const uploadButton = $w('#uploadButton');
    const questionInput = $w('#questionInput');
    const resultText = $w('#resultText');
    const loadingSpinner = $w('#loadingSpinner');
    const errorMessage = $w('#errorMessage');

    // Hide elements initially
    loadingSpinner.hide();
    errorMessage.hide();

    // Configure upload handler
    uploadButton.onChange(async (event) => {
        try {
            // Reset UI states
            resultText.html = "";
            errorMessage.hide();
            loadingSpinner.show();

            // Get user inputs
            const file = event.target.files[0];
            const question = questionInput.value || "Describe this image";

            // Validate input
            if (!file) {
                throw new Error("No image selected");
            }

            if (!file.type.startsWith('image/')) {
                throw new Error("Please upload an image file");
            }

            // Read image as base64
            const imgData = await readFileAsBase64(file);
            
            // Call your laptop API
            const response = await fetch('http://YOUR_LAPTOP_IP:5000/infer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: imgData,
                    question: question
                })
            });

            // Handle response
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.status === 'success') {
                resultText.html = formatResponse(data.response);
            } else {
                throw new Error(data.message || "Inference failed");
            }
            
        } catch (error) {
            errorMessage.text = error.message;
            errorMessage.show();
            console.error("Inference error:", error);
        } finally {
            loadingSpinner.hide();
        }
    });

    // Helper function to read files
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Format AI response
    function formatResponse(text) {
        return text.split('\n')
            .map(paragraph => `<p class="response-paragraph">${paragraph}</p>`)
            .join('\n');
    }
});