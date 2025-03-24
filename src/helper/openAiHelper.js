import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure to set your OpenAI API key in the environment variables
});

export const generateSchemaByAI = async (domain, description, sampleSchema) => {
  try {
    const prompt = `
  Generate a JSON schema for "${domain}" domain based on the following description:
  ${description}
  The schema should include tabs, sub-tabs, sections, and fields with appropriate validation rules & isShowInTable flag.
  Here is a sample schema for reference:
  ${JSON.stringify(sampleSchema, null, 2)}
  `;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500, // Set the maximum number of tokens to generate
    });

    const schema = JSON.parse(response.choices[0].message.content.trim());
    return schema;
  } catch (error) {
    console.log("openApiError", error);
    throw error;
  }
};
