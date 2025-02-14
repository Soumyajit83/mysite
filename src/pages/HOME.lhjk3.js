$w.onReady(function () {
    const uploadButton = $w("#uploadButton"); // File upload button
    const previewImage = $w("#previewImage"); // Image preview
    const questionInput = $w("#questionInput"); // User text input
    const submitButton = $w("#submitButton"); // Submit button
    const resultText = $w("#resultText"); // Response display
    const loadingText = $w("#loadingText"); // Loading indicator
    const errorMessage = $w("#errorMessage"); // Error message display

    let uploadedImageUrl = ""; // Store uploaded image URL

    // Hide loading/error elements initially
    loadingText.hide();
    errorMessage.hide();

    // 🖼️ **Step 1: Image Upload & Preview**
    uploadButton.onChange(() => {
        const uploadedFiles = uploadButton.value; // Get selected file(s)

        if (uploadedFiles.length === 0) {
            errorMessage.text = "No file selected.";
            errorMessage.show();
            return;
        }

        const file = uploadedFiles[0]; // Get the first file

        // Validate file type
        if (!file.type.startsWith("image/")) {
            errorMessage.text = "Only image files are allowed.";
            errorMessage.show();
            return;
        }

        // Reset error message
        errorMessage.hide();

        // 🖼️ **Show Temporary Image Preview**
        const reader = new FileReader();
        reader.onload = (event) => {
            previewImage.src = event.target.result; // Show image preview instantly
        };
        reader.readAsDataURL(file); // Convert file to base64 for preview

        // 🚀 **Upload Image to Wix Media**
        file.upload()
            .then(uploadedFile => {
                uploadedImageUrl = uploadedFile.url; // Store final uploaded image URL
                previewImage.src = uploadedImageUrl; // Update preview with real image
            })
            .catch(error => {
                errorMessage.text = "Upload failed: " + error.message;
                errorMessage.show();
            });
    });

    // 📤 **Step 2: Submit Image + Text**
    submitButton.onClick(() => {
        const question = questionInput.value.trim(); // Get user input text

        if (!uploadedImageUrl) {
            errorMessage.text = "Please upload an image first.";
            errorMessage.show();
            return;
        }

        if (!question) {
            errorMessage.text = "Please enter a question.";
            errorMessage.show();
            return;
        }

        errorMessage.hide();
        loadingText.show(); // Show loading indicator

        // Convert uploaded image URL to Base64
        convertToBase64(uploadedImageUrl)
            .then(imgData => sendToAPI(imgData, question))
            .catch(error => {
                errorMessage.text = "Error processing image: " + error.message;
                errorMessage.show();
            })
            .finally(() => loadingText.hide()); // Hide loading indicator
    });

    // **Function to Send Data to API**
    function sendToAPI(imgData, question) {
        return fetch("http://YOUR_LAPTOP_IP:5000/infer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: imgData, question: question }),
        })
        .then(response => response.json())
        .then(data => {
            resultText.html = formatResponse(data.response);
        })
        .catch(error => {
            errorMessage.text = "Error: " + error.message;
            errorMessage.show();
        });
    }

    // **Function to Convert Image URL to Base64**
    function convertToBase64(imageUrl) {
        return fetch(imageUrl)
            .then(response => response.blob())
            .then(blob => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            }));
    }

    // **Format Response Text**
    function formatResponse(text) {
        return text.split("\n").map(paragraph => `<p class="response">${paragraph}</p>`).join("\n");
    }
});
