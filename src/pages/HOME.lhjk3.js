import { mediaManager } from 'wix-media-backend';

$w.onReady(function () {
    const uploadButton = $w("#uploadButton");
    const previewImage = $w("#previewImage");
    const questionInput = $w("#questionInput");
    const resultText = $w("#resultText");
    const loadingText = $w("#loadingText");
    const loadingImage = $w("#loadingImage");
    const errorMessage = $w("#errorMessage");

    // Hide elements initially
    loadingText.collapse();
    loadingImage.collapse();
    errorMessage.collapse();

    // Button click triggers file upload
    uploadButton.onClick(() => {
        wixMedia.promptUpload()
            .then(uploadedFile => {
                if (!uploadedFile) throw new Error("No file selected");
                if (!uploadedFile.type.startsWith("image/")) throw new Error("Only images are allowed");

                // Show image preview
                previewImage.src = uploadedFile.url;
                
                return convertToBase64(uploadedFile.url);
            })
            .then(imgData => sendToAPI(imgData))
            .catch(error => {
                errorMessage.text = error.message;
                errorMessage.expand();
                console.error("Upload Error:", error);
            });
    });

    function sendToAPI(imgData) {
        showLoading(true);
        fetch("http://YOUR_LAPTOP_IP:5000/infer", {
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
        })
        .finally(() => showLoading(false));
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
