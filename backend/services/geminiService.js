const { GoogleGenAI } = require("@google/genai");
const dotenv = require('dotenv');

dotenv.config();

// FIX: use GEMINI_API_KEY (your .env provides GEMINI_API_KEY, not GOOGLE_API_KEY)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getCodeAnalysis = async (problem, submission) => {
    const { name, statement } = problem;
    const { code, language } = submission;

    const prompt = `
You are an expert programming tutor. Analyze the following code submission and provide a comprehensive review.

**Problem:** ${name}

**Problem Statement:**
${statement}

**User's Code (${language}):**
\`\`\`${language}
${code}
\`\`\`

Please provide a detailed analysis following this exact structure:

## Code Review Summary

### What's Working Well
- List positive aspects of the code
- Mention correct approaches used

### Complexity Analysis
- **Time Complexity:** O(?) - explain the analysis
- **Space Complexity:** O(?) - explain the analysis

### Areas for Improvement
1. **Performance Optimizations** (if any)
   - Specific suggestions for better algorithms or data structures
   
2. **Code Quality** (if any)
   - Readability improvements
   - Best practices
   - Edge case handling

3. **Style & Conventions** (if any)
   - Language-specific conventions
   - Variable naming
   - Code organization

### Optimized Solution (if applicable)
If there's a significantly better approach, provide it here:

\`\`\`${language}
// Improved version of the code
// Include comments explaining the improvements
\`\`\`

**Key Improvements Explained:**
- Explain why this version is better
- Highlight the performance gains

### Learning Resources
- Suggest topics to study for similar problems
- Recommend specific algorithms or data structures to learn

---
*Note: If the original code is already optimal, clearly state that and focus on code quality aspects.*

Keep your response concise but informative. Use clear headings and bullet points for better readability.
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
    });
    return response.text;
};

module.exports = {
    getCodeAnalysis,
};