$w.onReady(function () {
    const uploadButton = $w("#uploadButton");
    const questionInput = $w("#questionInput");
    const resultText = $w("#resultText");
    const loadingText = $w("#loadingText");
    const loadingImage = $w("#loadingImage");
    const errorMessage = $w("#errorMessage");

    // Hide elements initially
    loadingText.collapse();
    loadingImage.collapse();
    errorMessage.collapse();

    // Fix: Use onUploadChange instead of onChange
    uploadButton.onUploadChange(async (event) => {
        try {
            // Reset UI
            resultText.html = "";
            errorMessage.collapse();
            showLoading(true);

            // Get uploaded file
            const file = event.target.files[0];  // Corrected
            if (!file) throw new Error("No file uploaded.");
            if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed.");

            // Convert file to Base64
            const imgData = await readFileAsBase64(file);

            // Send to API
            const response = await fetch("http://YOUR_LAPTOP_IP:5000/infer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: imgData, question: questionInput.value || "Describe this image" }),
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const data = await response.json();
            resultText.html = formatResponse(data.response);
        } catch (error) {
            errorMessage.text = error.message;
            errorMessage.expand();
            console.error("Upload Error:", error);
        } finally {
            showLoading(false);
        }
    });

    function showLoading(isLoading) {
        if (isLoading) {
            loadingText.expand();
            loadingImage.expand();
        } else {
            loadingText.collapse();
            loadingImage.collapse();
        }
    }

    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function formatResponse(text) {
        return text.split("\n").map(paragraph => `<p class="response">${paragraph}</p>`).join("\n");
    }
});
