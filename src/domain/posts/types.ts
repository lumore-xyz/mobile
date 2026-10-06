export interface PromptCategory {
  _id: string;
  name?: string;
}

export interface Prompt {
  _id: string;
  text: string;
  category?: string;
}

export interface CreatePromptPostPayload {
  type: "PROMPT";
  content: {
    promptId: string;
    promptAnswer: string;
  };
  visibility?: string;
}

export interface CreatedPost {
  _id: string;
}
