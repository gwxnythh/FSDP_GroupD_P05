function googleTranslateElementInit() {
    new google.translate.TranslateElement(
        { pageLanguage: "en" },
        "google_translate_element"
    );
}

function removePoweredByText() {
    // Find all text nodes on the page
    var textNodes = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var currentNode;

    // Loop through all text nodes
    while (currentNode = textNodes.nextNode()) {
        // Check if the text contains "Powered by"
        if (currentNode.nodeValue.includes("Powered by")) {
            // Remove the text "Powered by" from the node
            currentNode.nodeValue = currentNode.nodeValue.replace(/Powered by/g, '');
        }
    }
}

// Ensure the Google Translate script is initialized
window.onload = function () {
    googleTranslateElementInit();
    removePoweredByText();
};
