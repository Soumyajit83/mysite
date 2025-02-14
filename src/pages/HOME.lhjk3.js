$w.onReady(function () {
    // Select elements
    const uploadButton = $w("#uploadButton"); // Now using a real File Upload Button
    const previewImage = $w("#previewImage");
    const questionInput = $w("#questionInput");
    const resultText = $w("#resultText");
    const loadingText = $w("#loadingText");
    const loadingImage = $w("#loadingImage");
    const errorMessage = $w("#errorMessage");

    // Hide loading elements initially
    loadingText.collapse();
    loadingImage.collapse();
    errorMessage.collapse();

    // When file is uploaded
    uploadButton.onChange(() => {
        const uploadedFiles = uploadButton.value;
        if (uploadedFiles.length === 0) {
            errorMessage.text = "No file selected.";
            errorMessage.expand();
            return;
        }

        const file = uploadedFiles[0];
        
        // Validate file type
        if (!file.type.startsWith("image/")) {
            errorMessage.text = "Only image files are allowed.";
            errorMessage.expand();
            return;
        }

        // Show loading state
        showLoading(true);

        // Upload file to Wix Media Manager
        uploadFileToWix(file)
            .then(imgUrl => {
                previewImage.src = imgUrl;
                return convertToBase64(imgUrl);
            })
            .then(imgData => sendToAPI(imgData))
            .catch(error => {
                errorMessage.text = error.message;
                errorMessage.expand();
                console.error("Upload Error:", error);
            })
            .finally(() => showLoading(false));
    });

    function uploadFileToWix(file) {
        return file.upload()
            .then(uploadedFile => uploadedFile.url)
            .catch(error => {
                throw new Error("Upload to Wix Media failed: " + error.message);
            });
    }

    function sendToAPI(imgData) {
        return fetch("http://YOUR_LAPTOP_IP:5000/infer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: imgData, question: questionInput.value || "Describe this image" }),
        })
        .then(response => response.json())
        .then(data => {
            resultText.html = formatResponse(data.response);
        })
        .catch(error => {
            errorMessage.text = error.message;
            errorMessage.expand();
        });
    }

    function showLoading(isLoading) {
        if (isLoading) {
            loadingText.expand();
            loadingImage.expand();
        } else {
            loadingText.collapse();
            loadingImage.collapse();
        }
    }

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

    function formatResponse(text) {
        return text.split("\n").map(paragraph => `<p class="response">${paragraph}</p>`).join("\n");
    }
});
