import { Document } from "@govtechsg/open-attestation";
import { decryptString } from "@govtechsg/oa-encryption";

interface EncryptedDocumentAction {
  uri: string;
  key: string;
  type: string;
}

export const fetchCleartextDocument = async (payload: {
  uri: string;
}): Promise<Document> => fetch(payload.uri).then(res => res.json());

export const fetchEncryptedDocument = async ({
  uri,
  key,
  type
}: EncryptedDocumentAction): Promise<Document> => {
  const {
    document: { tag, cipherText, iv }
  } = await fetch(uri).then(res => res.json());
  const cipher = {
    tag,
    cipherText,
    iv,
    key,
    type
  };
  return JSON.parse(decryptString(cipher)) as Document;
};
