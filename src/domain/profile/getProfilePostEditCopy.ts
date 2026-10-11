import type { ProfilePost } from "@/src/domain/profile/types";

export interface ProfilePostEditCopy {
  title: string;
  label: string;
  placeholder: string;
  helper?: string;
  required: boolean;
}

const getProfilePostEditCopy = (
  post: ProfilePost | null,
): ProfilePostEditCopy => {
  if (post?.type === "PROMPT") {
    return {
      title: "Edit prompt answer",
      label: "Your answer",
      placeholder: "Write an answer that feels easy to reply to.",
      helper:
        typeof post.content.promptId === "object"
          ? post.content.promptId?.text
          : undefined,
      required: true,
    };
  }

  if (post?.type === "IMAGE") {
    return {
      title: "Edit photo caption",
      label: "Caption",
      placeholder: "Add a caption that gives people something to ask about.",
      helper: "You can update the caption and visibility from here.",
      required: false,
    };
  }

  return {
    title: "Edit text post",
    label: "Post text",
    placeholder: "Share a thought, moment, or conversation starter.",
    helper: "Keep it personal and easy to respond to.",
    required: true,
  };
};

export default getProfilePostEditCopy;
