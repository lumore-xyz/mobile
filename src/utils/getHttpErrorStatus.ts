import { isAxiosError } from "axios";

const getHttpErrorStatus = (error: unknown): number | null =>
  isAxiosError(error) ? error.response?.status ?? null : null;

export default getHttpErrorStatus;
