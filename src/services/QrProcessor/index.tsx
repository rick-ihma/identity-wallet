import { Document } from "@govtechsg/open-attestation";
import { validateAction } from "../actionValidator/validator";
import {
  DocumentPermittedAction,
  DocumentAction
} from "../actionValidator/documentActionValidator";
import {
  fetchCleartextDocument,
  fetchEncryptedDocument
} from "./fetchDocument";
// The universal transfer method uses the query string's field as the action type
// and the uriencoded value as the payload
const universalTransferDataRegex = /https:\/\/action.openattestation.com\?q=(.*)/;

export enum ActionType {
  DOCUMENT = "DOCUMENT"
}

export interface Action {
  type: string;
  payload: DocumentAction;
}

export const decodeAction = (data: string): Action => {
  if (!universalTransferDataRegex.test(data)) {
    throw new Error("Invalid QR Protocol");
  }
  try {
    const encodedAction = data.match(universalTransferDataRegex)![1];
    const decodedAction = JSON.parse(decodeURI(encodedAction));
    validateAction(decodedAction);
    return decodedAction;
  } catch (e) {
    throw new Error(`Invalid QR Action: ${e.message}`);
  }
};

export interface QrHandler {
  onDocumentStore: (fetchedDocument: Document) => void | Promise<void>;
  onDocumentView: (fetchedDocument: Document) => void | Promise<void>;
}

export const processQr = async (
  data: string,
  { onDocumentStore, onDocumentView }: QrHandler
): Promise<void> => {
  const action = decodeAction(data);

  switch (action.type) {
    case ActionType.DOCUMENT:
      const { uri, key } = action.payload;
      const fetchedDocument = key
        ? await fetchEncryptedDocument({
            uri,
            key
          })
        : await fetchCleartextDocument({ uri });

      console.log(
        "Help, line below runs even when data.ttl is undefined",
        fetchedDocument
      );
      if (fetchedDocument.data.ttl && fetchedDocument.data.ttl < Date.now()) {
        throw new Error("The QR code has expired");
        // alert('The QR code has expired');
      }

      // TODO Validate if fetchedDocument is a valid document, need to add the method to open-attestation
      if (
        action.payload.permittedActions &&
        action.payload.permittedActions.includes(DocumentPermittedAction.STORE)
      ) {
        await onDocumentStore(fetchedDocument);
      } else {
        await onDocumentView(fetchedDocument);
      }
      break;
    default:
      throw new Error("Invalid QR Action");
  }
};
