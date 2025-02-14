$w.onReady(function () {
    const uploadButton = $w("#uploadButton");
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

    uploadButton.onChange(() => {
        const uploadedFiles = uploadButton.value;

        if (uploadedFiles.length === 0) {
            errorMessage.text = "No file selected.";
            errorMessage.expand();
            return;
        }

        const file = uploadedFiles[0]; // Get the selected file object

        // Validate file type
        if (!file.type.startsWith("image/")) {
            errorMessage.text = "Only image files are allowed.";
            errorMessage.expand();
            return;
        }

        // 🖼️ **Step 1: Show Temporary Image Preview**
        const reader = new FileReader();
        reader.onload = (event) => {
            previewImage.src = event.target.result; // Show preview instantly
        };
        reader.readAsDataURL(file); // Convert to Base64 for preview

        // Show loading state
        showLoading(true);

        // 🖼️ **Step 2: Upload Image to Wix Media**
        file.upload()
            .then(uploadedFile => {
                previewImage.src = uploadedFile.url; // Set final uploaded image
                return convertToBase64(uploadedFile.url);
            })
            .then(imgData => sendToAPI(imgData))
            .catch(error => {
                errorMessage.text = error.message;
                errorMessage.expand();
                console.error("Upload Error:", error);
            })
            .finally(() => showLoading(false));
    });

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
