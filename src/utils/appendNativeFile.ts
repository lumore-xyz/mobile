export interface RNFilePayload {
  uri: string;
  name: string;
  type: string;
}

type ReactNativeFormData = Omit<FormData, "append"> & {
  append(name: string, value: string | Blob | RNFilePayload): void;
};

const appendNativeFile = (
  formData: FormData,
  fieldName: string,
  file: RNFilePayload,
) => {
  // React Native accepts URI file objects; the DOM FormData type does not.
  (formData as ReactNativeFormData).append(fieldName, file);
};

export default appendNativeFile;
