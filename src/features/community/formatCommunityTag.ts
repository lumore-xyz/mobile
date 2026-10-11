const formatCommunityTag = (tag: string) =>
  tag.replace(/\b\w/g, (letter) => letter.toUpperCase());

export default formatCommunityTag;
