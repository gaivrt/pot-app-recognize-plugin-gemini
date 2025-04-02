/**
 * Performs OCR using the Google Gemini API with selectable or custom model and custom prompt.
 *
 * @param {string} base64 Raw base64 image data.
 * @param {string} lang Target language code from Pot (currently ignored by the API call).
 * @param {object} options Contains config and utils.
 * @param {object} options.config User configuration { apiKey, modelSelection, customModelName, customPrompt }.
 * @param {object} options.utils Pot utilities.
 * @returns {Promise<string>} Recognized text.
 */
async function recognize(base64, lang, options) {
    const { config, utils } = options;
    const { tauriFetch } = utils; // Or utils.http.fetch, adapt as needed

    // --- Configuration ---
    const { apiKey, modelSelection, customModelName, customPrompt: userPrompt } = config;

    // 1. Validate API Key
    if (!apiKey || apiKey.trim().length === 0) {
        throw new Error("Google AI API Key is missing. Please configure it in Pot settings.");
    }

    // 2. Determine Model Name
    let modelToUse = "";
    const defaultModel = "gemini-2.0-flash"; // Fallback default

    // Prioritize custom model name if provided and not just whitespace
    if (customModelName && customModelName.trim() !== '') {
        modelToUse = customModelName.trim();
        console.log(`Using custom model name: ${modelToUse}`);
    } else if (modelSelection && modelSelection !== "") { // Check if a selection was made (and it's not the placeholder)
        modelToUse = modelSelection;
        console.log(`Using selected model name: ${modelToUse}`);
    } else {
        modelToUse = defaultModel;
        console.log(`No valid model selected or specified, defaulting to: ${modelToUse}`);
    }

    // Final check if modelToUse ended up empty somehow
    if (!modelToUse) {
         console.warn("Model name determination failed, falling back to default:", defaultModel);
        modelToUse = defaultModel;
    }


    // 3. Determine Prompt
    const defaultPrompt = "Extract text from this image. Provide only the text content, without any descriptions or introductory phrases.";
    const systemPrompt = (userPrompt && userPrompt.trim() !== '') ? userPrompt.trim() : defaultPrompt;

    console.log(`Using Prompt: "${systemPrompt}"`);


    // --- Prepare API Request ---
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [{
            parts: [
                { "text": systemPrompt },
                {
                    "inline_data": {
                        "mime_type": "image/png", // Assuming PNG
                        "data": base64
                    }
                }
            ]
        }],
        "generationConfig": {
            "temperature": 0.1,
            "topP": 0.95,
            "topK": 40,
            "maxOutputTokens": 2048
        },
        "safetySettings": [
           { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
           { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
           { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
           { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" }
       ]
    };

    // --- Make API Call ---
    console.log(`Sending request to Gemini API: ${apiUrl}`);
    let res;
    try {
        res = await tauriFetch(apiUrl, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: { type: 'Json', payload: requestBody }, // Adapt as needed
            timeout: 30000 // 30 second timeout
        });
         console.log("Received response status from Gemini API:", res.status);

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error(`Network or fetch error calling Gemini API: ${error.message || error}`);
    }

    // --- Handle Response (Error handling logic remains the same as before) ---
    if (res.ok) {
        const responseData = res.data;
        if (!responseData || responseData.error) { /* ... handle error ... */ throw new Error(/*...*/); }
        const candidate = responseData.candidates?.[0];
        if (!candidate) { /* ... handle missing candidate ... */ throw new Error(/*...*/); }
        const finishReason = candidate.finishReason;
        const safetyRatings = candidate.safetyRatings;
         if (finishReason && finishReason !== "STOP" && finishReason !== "MAX_TOKENS") { /* ... handle bad finish reason ... */ throw new Error(/*...*/); }
        const text = candidate.content?.parts?.[0]?.text;
        if (typeof text === 'string') {
            console.log("OCR successful.");
            return text.trim();
        } else { /* ... handle missing text or other issues ... */ throw new Error(/*...*/); }
    } else {
         // Handle HTTP errors (status code >= 400)
         let errorMsg = `Gemini API request failed with HTTP status ${res.status}`;
         let responseBodyError = null;
         try {
             responseBodyError = res.data?.error?.message || JSON.stringify(res.data);
         } catch (e) { /* ignore */ }
         if (responseBodyError) errorMsg += ` - ${responseBodyError}`;
         // Specific check for 404 which might mean invalid custom model name
         if (res.status === 404) {
             errorMsg += ` (Check if the custom model name '${modelToUse}' is correct and exists)`;
         }
         console.error(errorMsg);
         throw new Error(errorMsg);
    }
}