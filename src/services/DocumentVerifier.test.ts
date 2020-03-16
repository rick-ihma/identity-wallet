// FIX - test is failing

import { checkValidity } from "./DocumentVerifier";
import { OAWrappedDocument } from "../types";

const mockOpenAttestationHash = jest.fn();
const mockOpenAttestationEthereumDocumentStoreIssued = jest.fn();
const mockOpenAttestationEthereumDocumentStoreRevoked = jest.fn();
const mockOpenAttestationDnsTxt = jest.fn();
jest.mock("@govtechsg/oa-verify", () => {
  return {
    openAttestationHash: {
      verify: () => {
        return mockOpenAttestationHash();
      }
    },
    openAttestationEthereumDocumentStoreIssued: {
      verify: () => {
        return mockOpenAttestationEthereumDocumentStoreIssued();
      }
    },
    openAttestationEthereumDocumentStoreRevoked: {
      verify: () =>{
        return mockOpenAttestationEthereumDocumentStoreRevoked();
      }
    },
    openAttestationDnsTxt: {
      verify: () => {
        return mockOpenAttestationDnsTxt();
      }
    }
  };
});

describe("DocumentVerifier", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  describe("checkValidity", () => {
    it("should return true when all checks are valid", async () => {
      expect.assertions(1);
      mockOpenAttestationHash.mockResolvedValue(Promise.resolve({ status: "VALID" }));
      mockOpenAttestationEthereumDocumentStoreIssued.mockResolvedValue(Promise.resolve({ status: "VALID" }));
      mockOpenAttestationEthereumDocumentStoreRevoked.mockResolvedValue(Promise.resolve({ status: "VALID" }));
      mockOpenAttestationDnsTxt.mockResolvedValue(Promise.resolve({ status: "VALID" }));

      const result = await checkValidity(
        {} as OAWrappedDocument,
        "ropsten",
        "OpenAttestation",
        jest.fn()
      );
      expect(result).toBe(true);
    });
    it("should return be false MF", async () => {
      expect.assertions(1);
      mockOpenAttestationHash.mockResolvedValue(Promise.resolve({ status: "VALID" }));
      mockOpenAttestationEthereumDocumentStoreIssued.mockResolvedValue(Promise.resolve({ status: "VALID" }));
      mockOpenAttestationEthereumDocumentStoreRevoked.mockResolvedValue(Promise.resolve({ status: "VALID" }));
      mockOpenAttestationDnsTxt.mockResolvedValue(Promise.resolve({ status: "ERROR" }));

      const result = await checkValidity(
        {} as OAWrappedDocument,
        "ropsten",
        "OpenAttestation",
        jest.fn()
      );
      expect(result).toBe(false);
    });

    // it('should return false when somes checks errored', async () => {
    //   expect.assertions(1);
    //   const mockVerify = jest.fn(
    //     (): Promise<VerificationFragment<any>[]> =>
    //       Promise.resolve([
    //         { name: '', type: 'DOCUMENT_INTEGRITY', status: 'VALID' },
    //         { name: '', type: 'DOCUMENT_STATUS', status: 'ERROR' },
    //         { name: '', type: 'DOCUMENT_STATUS', status: 'VALID' },
    //         { name: '', type: 'ISSUER_IDENTITY', status: 'VALID' },
    //       ]),
    //   );
    //   const result = await checkValidity(
    //     {} as OAWrappedDocument,
    //     'ropsten',
    //     jest.fn(),
    //     mockVerify,
    //   );
    //   expect(result).toBe(false);
    // });

    // it('should return false when somes checks skipped', async () => {
    //   expect.assertions(1);
    //   const mockVerify = jest.fn(
    //     (): Promise<VerificationFragment<any>[]> =>
    //       Promise.resolve([
    //         { name: '', type: 'DOCUMENT_INTEGRITY', status: 'VALID' },
    //         { name: '', type: 'DOCUMENT_STATUS', status: 'VALID' },
    //         { name: '', type: 'DOCUMENT_STATUS', status: 'SKIPPED' },
    //         { name: '', type: 'ISSUER_IDENTITY', status: 'SKIPPED' },
    //       ]),
    //   );
    //   const result = await checkValidity(
    //     {} as OAWrappedDocument,
    //     'ropsten',
    //     jest.fn(),
    //     mockVerify,
    //   );
    //   expect(result).toBe(false);
    // });

    // it('should return false when somes checks are invalid', async () => {
    //   expect.assertions(1);
    //   const mockVerify = jest.fn(
    //     (): Promise<VerificationFragment<any>[]> =>
    //       Promise.resolve([
    //         { name: '', type: 'DOCUMENT_INTEGRITY', status: 'VALID' },
    //         { name: '', type: 'DOCUMENT_STATUS', status: 'INVALID' },
    //         { name: '', type: 'DOCUMENT_STATUS', status: 'INVALID' },
    //         { name: '', type: 'ISSUER_IDENTITY', status: 'VALID' },
    //       ]),
    //   );
    //   const result = await checkValidity(
    //     {} as OAWrappedDocument,
    //     'ropsten',
    //     jest.fn(),
    //     mockVerify,
    //   );
    //   expect(result).toBe(false);
    // });

    // it('should return false when somes checks are invalid and some have errored', async () => {
    //   expect.assertions(1);
    //   const mockVerify = jest.fn(
    //     (): Promise<VerificationFragment<any>[]> =>
    //       Promise.resolve([
    //         { name: '', type: 'DOCUMENT_INTEGRITY', status: 'VALID' },
    //         { name: '', type: 'DOCUMENT_STATUS', status: 'INVALID' },
    //         { name: '', type: 'DOCUMENT_STATUS', status: 'INVALID' },
    //         { name: '', type: 'ISSUER_IDENTITY', status: 'ERROR' },
    //       ]),
    //   );
    //   const result = await checkValidity(
    //     {} as OAWrappedDocument,
    //     'ropsten',
    //     jest.fn(),
    //     mockVerify,
    //   );
    //   expect(result).toBe(false);
    // });
  });
});
