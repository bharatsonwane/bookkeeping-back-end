import OpenAI from "openai";
const aiResponse = {
  id: "chatcmpl-BEZqm8xpgY5PI23R0kT7dwTFpwaPq",
  object: "chat.completion",
  created: 1742814100,
  model: "gpt-4o-mini-2024-07-18",
  choices: [
    {
      index: 0,
      message: {
        role: "assistant",
        content:
          '```json\n{\n  "name": "projectSchema",\n  "label": "Project Schema",\n  "type": "schema",\n  "version": "1.0",\n  "children": [\n    {\n      "label": "Project Details",\n      "type": "parentTab",\n      "children": [\n        {\n          "label": "Basic Information",\n          "type": "tab",\n          "children": [\n            {\n              "label": "Project Name",\n              "type": "text",\n              "dataMappingName": "project.name",\n              "validationType": "string",\n              "validations": [\n                {\n                  "type": "min",\n                  "params": [\n                    3,\n                    "Must be at least 3 characters"\n                  ]\n                },\n                {\n                  "type": "max",\n                  "params": [\n                    100,\n                    "Must be at most 100 characters"\n                  ]\n                },\n                {\n                  "type": "trim"\n                }\n              ],\n              "readOnly": false,\n              "isMultilingual": false,\n              "isShowInTable": true\n            },\n            {\n              "label": "Project ID",\n              "type": "text",\n              "dataMappingName": "project.id",\n              "validationType": "string",\n              "validations": [\n                {\n                  "type": "min",\n                  "params": [\n                    3,\n                    "Must be at least 3 characters"\n                  ]\n                },\n                {\n                  "type": "max",\n                  "params": [\n                    50,\n                    "Must be at most 50 characters"\n                  ]\n                },\n                {\n                  "type": "trim"\n                }\n              ],\n              "readOnly": false,\n              "isMultilingual": false,\n              "isShowInTable": true\n            },\n            {\n              "label": "Start Date",\n              "type": "date",\n              "dataMappingName": "project.startDate",\n              "readOnly": false,\n              "isMultilingual": false,\n              "isShowInTable": true\n            },\n            {\n              "label": "End Date",\n              "type": "date",\n              "dataMappingName": "project.endDate",\n              "readOnly": false,\n              "isMultilingual": false,\n              "isShowInTable": true\n            },\n            {\n              "label": "Status",\n              "type": "select",\n              "options": [\n                {\n                  "label": "Not Started",\n                  "value": "Not Started"\n                },\n                {\n                  "label": "In Progress",\n                  "value": "In Progress"\n                },\n                {\n                  "label": "Completed",\n                  "value": "Completed"\n                }\n              ],\n              "dataMappingName": "project.status",\n              "readOnly": false,\n              "isMultilingual": false,\n              "isShowInTable": true\n            },\n            {\n              "label": "Description",\n              "type": "textarea",\n              "dataMappingName": "project.description",\n              "readOnly": false,\n              "isMultilingual": true\n            }\n          ]\n        }\n      ]\n    },\n    {\n      "label": "Team Members",\n      "type": "tab",\n      "children": [\n        {\n          "label": "Member List",\n          "type": "section",\n          "children": [\n            {\n              "label": "Member Name",\n              "type": "text",\n              "dataMappingName": "team.name",\n              "readOnly": false,\n              "isMultilingual": false\n            },\n            {\n              "label": "Role",\n              "type": "text",\n              "dataMappingName": "team.role",\n              "readOnly": false,\n              "isMultilingual": false\n            },\n            {\n              "label": "Contact",\n              "type": "text",\n              "dataMappingName": "team.contact",\n              "validationType": "string",\n              "validations": [\n                {\n                  "type": "pattern",\n                  "params": [\n                    "^[0-9\\\\-\\\\+]{9,15}$",\n                    "Must be a valid contact number"\n                  ]\n                }\n              ],\n              "readOnly": false,\n              "isMultilingual": false\n            }\n          ]\n        }\n      ]\n    },\n    {\n      "label": "Milestones",\n      "type": "tab",\n      "children": [\n        {\n          "label": "Milestone List",\n          "type": "section",\n          "children": [\n            {\n              "label": "Milestone Name",\n              "type": "text",\n              "dataMappingName": "milestones.name",\n              "readOnly": false,\n              "isMultilingual": false\n            },\n            {\n              "label": "Due Date",\n              "type": "date",\n              "dataMappingName": "milestones.dueDate",\n              "readOnly": false,\n              "isMultilingual": false\n            },\n            {\n              "label": "Status",\n              "type": "select",\n              "options": [\n                {\n                  "label": "Not Started",\n                  "value": "Not Started"\n                },\n                {\n                  "label": "In Progress",\n                  "value": "In Progress"\n                },\n                {\n                  "label": "Completed",\n                  "value": "Completed"\n                }\n              ],\n              "dataMappingName": "milestones.status",\n              "readOnly": false,\n              "isMultilingual": false\n            }\n          ]\n        }\n      ]\n    }\n  ]\n}\n```',
        refusal: null,
        annotations: [],
      },
      logprobs: null,
      finish_reason: "stop",
    },
  ],
  usage: {
    prompt_tokens: 1399,
    completion_tokens: 1151,
    total_tokens: 2550,
    prompt_tokens_details: {
      cached_tokens: 0,
      audio_tokens: 0,
    },
    completion_tokens_details: {
      reasoning_tokens: 0,
      audio_tokens: 0,
      accepted_prediction_tokens: 0,
      rejected_prediction_tokens: 0,
    },
  },
  service_tier: "default",
  system_fingerprint: "fp_b8bc95a0ac",
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure to set your OpenAI API key in the environment variables
});

export const generateSchemaByAI = async (description, sampleSchema) => {
  let response = null;
  try {
    const prompt = `
    Generate a JSON schema for bookkeeping based on the following description:
    ${description}
    The schema should include tabs, sub-tabs, sections, and fields with appropriate validation rules using Zod & isShowInTable flag.
    The isShowInTable flag should appear a maximum of 5 times in the schema.
    Here is a sample schema for reference:
    ${JSON.stringify(sampleSchema, null, 2)}
    Please provide only the JSON schema in the response, without any additional information. Ensure the response is valid JSON.
    `;

    response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0].message.content.trim();

    console.log("contentStart");
    console.log(content);
    console.log("contentEnd");
    const jsonContent = content.replace(/```json|```/g, "");

    const schema = JSON.parse(jsonContent);
    console.log("schemaStart");
    console.log(schema);
    console.log("schemaEnd");
    return schema;
  } catch (error) {
    console.log("openApiError", error);
    throw error;
  }
};
