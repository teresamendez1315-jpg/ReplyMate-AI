// netlify/functions/generate-replies.js
//
// This code runs on Netlify's servers, NOT in the user's browser.
// That's what makes it safe: the ANTHROPIC_API_KEY below is read from
// an environment variable that only exists on the server. It is never
// sent to, or visible in, index.html or any browser JavaScript.

exports.handler = async function (event) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed." }),
    };
  }

  // Read the creator's secret key from Netlify's environment variables
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          "The server is missing its AI API key. Add ANTHROPIC_API_KEY in your Netlify site settings.",
      }),
    };
  }

  // Parse and validate the incoming request
  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request format." }),
    };
  }

  const { message, tone, messageType } = payload;

  if (!message || typeof message !== "string" || !message.trim()) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Please include a message to reply to." }),
    };
  }
  if (!tone) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Please include a tone." }),
    };
  }

  const safeMessage = message.trim().slice(0, 2000); // simple guard against huge inputs

  const prompt = `You are ReplyMate AI, a tool that helps people write quick, thoughtful replies to comments, messages, and reviews.

The user received the following ${messageType || "message"}:
"""
${safeMessage}
"""

Write exactly 3 genuinely different reply options, all in a "${tone}" tone, appropriate for a reply to a ${messageType || "message"}. Each reply should:
- Respond directly and specifically to what was actually said (don't write something generic that could apply to any message).
- Match the "${tone}" tone consistently.
- Be an appropriate length and style for a ${messageType || "message"} (e.g. a short comment reply should be brief; an email or customer support reply can be a little longer and more structured).
- Sound like a real person, not a corporate bot.

Respond ONLY with valid JSON, no preamble, no markdown code fences, in exactly this shape:
{"replies": ["reply one", "reply two", "reply three"]}`;

  try {
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("Anthropic API error:", aiRes.status, errText);
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: "The AI service couldn't process this request right now. Please try again in a moment.",
        }),
      };
    }

    const data = await aiRes.json();
    const text = (data.content || [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    let parsed;
    try {
      const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Could not parse AI response as JSON:", text);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "The AI response couldn't be read. Please try again." }),
      };
    }

    if (!Array.isArray(parsed.replies) || parsed.replies.length === 0) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "The AI didn't return any replies. Please try again." }),
      };
    }

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ replies: parsed.replies.slice(0, 3) }),
    };
  } catch (err) {
    console.error("Unexpected error calling Anthropic API:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong on our server. Please try again." }),
    };
  }
};
