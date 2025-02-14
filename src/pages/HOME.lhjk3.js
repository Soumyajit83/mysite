$w.onReady(function () {
    // Initialize page elements
    const uploadButton = $w('#uploadButton');
    const questionInput = $w('#questionInput');
    const resultText = $w('#resultText');
    const loadingText = $w('#loadingText');  // "Processing..." text element
    const loadingImage = $w('#loadingImage'); // Spinner GIF element
    const errorMessage = $w('#errorMessage');

    // Hide elements initially using Wix Velo methods
    if (loadingText) loadingText.collapse();
    if (loadingImage) loadingImage.collapse();
    if (errorMessage) errorMessage.collapse();

    // Upload button event listener
    uploadButton.onChange(async (event) => {
        try {
            // Reset UI states
            if (resultText) resultText.html = "";
            if (errorMessage) errorMessage.collapse();
            showLoading(true); // Show loading indicators

            // Get user inputs
            const file = event.target.files[0];
            const question = questionInput.value.trim() || "Describe this image";

            // Validate input
            if (!file) throw new Error("No image selected. Please upload an image.");
            if (!file.type.startsWith('image/')) throw new Error("Invalid file type. Please upload an image file.");

            // Read image as base64
            const imgData = await readFileAsBase64(file);
            
            // Call external API
            const response = await fetch('http://YOUR_LAPTOP_IP:5000/infer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imgData, question: question })
            });

            // Handle response
            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const data = await response.json();
            if (data.status === 'success') {
                if (resultText) resultText.html = formatResponse(data.response);
            } else {
                throw new Error(data.message || "Inference failed. Please try again.");
            }
            
        } catch (error) {
            if (errorMessage) {
                errorMessage.text = error.message;
                errorMessage.expand();
            }
            console.error("Inference error:", error);
        } finally {
            showLoading(false); // Hide loading indicators
        }
    });

    // Function to show/hide loading indicators properly
    function showLoading(isLoading) {
        if (isLoading) {
            if (loadingText) loadingText.expand();
            if (loadingImage) loadingImage.expand();
        } else {
            if (loadingText) loadingText.collapse();
            if (loadingImage) loadingImage.collapse();
        }
    }

    // Helper function to read files
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Function to format AI response
    function formatResponse(text) {
        return text.split('\n')
            .map(paragraph => `<p class="response-paragraph">${paragraph}</p>`)
            .join('\n');
    }
});
