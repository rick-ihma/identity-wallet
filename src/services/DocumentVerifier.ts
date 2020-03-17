import {
  openAttestationHash,
  openAttestationEthereumDocumentStoreIssued,
  openAttestationEthereumDocumentStoreRevoked,
  openAttestationDnsTxt,
  VerificationFragment
} from "@govtechsg/oa-verify";
import {
  isValid as ocIsValid,
  registryVerifier
} from "@govtechsg/opencerts-verify";
import { NetworkTypes, OAWrappedDocument, VerifierTypes } from "../types";
import { CheckStatus } from "../components/Validity";

export interface OaVerifyIdentity {
  identifiedOnAll: boolean;
  details: [];
}

// TODO import this from oa-verify
interface Identity {
  status: "VALID" | "INVALID" | "SKIPPED";
  location?: string;
  value?: string;
}

// TODO import this from opencerts verifier
interface RegistryEntry {
  name: string;
  displayCard: boolean;
  website?: string;
  email?: string;
  phone?: string;
  logo?: string;
  id?: string;
}
type OpencertsRegistryVerificationFragmentData = Partial<RegistryEntry> & {
  value: string;
  status: "VALID" | "INVALID";
};

const getIssuerNameFromRegistryFragment = (
  dnsFragment: VerificationFragment<Identity | Identity[]>,
  registryFragment?: VerificationFragment<
    | OpencertsRegistryVerificationFragmentData
    | OpencertsRegistryVerificationFragmentData[]
  >
): string => {
  // find location from registry fragment if available
  if (registryFragment) {
    const registryVerifierFragmentData = Array.isArray(registryFragment.data)
      ? registryFragment.data
      : registryFragment.data // not an array and is defined => make it an array
      ? [registryFragment.data]
      : []; // otherwise return empty array
    // using concat to handle arrays and single element
    const registryIdentity = registryVerifierFragmentData.find(
      ({ status }) => status === "VALID"
    );
    if (registryIdentity && registryIdentity.name) {
      return registryIdentity.name;
    }
  }

  // find location from dns fragment
  const dnsTxtVerifierFragmentData = Array.isArray(dnsFragment.data)
    ? dnsFragment.data
    : dnsFragment.data // not an array and is defined => make it an array
    ? [dnsFragment.data]
    : []; // otherwise return empty array
  const dnsIdentity = dnsTxtVerifierFragmentData
    .sort((obj1, obj2) =>
      (obj1.location || "").localeCompare(obj2.location || "")
    )
    .find(({ status }) => status === "VALID");
  if (dnsIdentity && dnsIdentity.location) {
    return dnsIdentity.location;
  }
  return "Issuer's identity not found"; // this should never happen ? :)
};

// Let TS infer the return type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const checkValidity = (
  document: OAWrappedDocument,
  network: NetworkTypes = NetworkTypes.ropsten,
  verifier: VerifierTypes,
  promisesCallback: (
    statuses: Promise<{ status: CheckStatus; issuerName?: string }>[]
  ) => void
) => {
  // TODO why do we need to transform mainnet to homestead ? why not using homestead in the enum
  const networkName =
    network === NetworkTypes.mainnet ? "homestead" : "ropsten";
  const isOpenCerts = verifier === VerifierTypes.OpenCerts;

  // TODO open an issue on oa-verify, to export each verifier individually, then here we can reuse the verifier
  const verifyHash = openAttestationHash
    .verify(document as OAWrappedDocument, { network: networkName })
    .then(s => {
      console.log(s);
      return s;
    })
    .then(({ status }) =>
      status === CheckStatus.VALID
        ? { status: CheckStatus.VALID }
        : { status: CheckStatus.INVALID }
    );

  const verifyIssued = openAttestationEthereumDocumentStoreIssued
    .verify(document as OAWrappedDocument, { network: networkName })
    .then(s => {
      console.log(s);
      return s;
    })
    .then(({ status }) =>
      status === CheckStatus.VALID
        ? { status: CheckStatus.VALID }
        : { status: CheckStatus.INVALID }
    );
  const verifyRevoked = openAttestationEthereumDocumentStoreRevoked
    .verify(document as OAWrappedDocument, { network: networkName })
    .then(s => {
      console.log(s);
      return s;
    })
    .then(({ status }) =>
      status === CheckStatus.VALID
        ? { status: CheckStatus.VALID }
        : { status: CheckStatus.INVALID }
    );

  const verifyIdentity = isOpenCerts
    ? Promise.all([
        openAttestationDnsTxt.verify(document as OAWrappedDocument, {
          network: networkName
        }),
        registryVerifier.verify(document as OAWrappedDocument, {
          network: networkName
        })
      ]).then(([dnsTextFragment, registryFragment]) => {
        const issuerName = getIssuerNameFromRegistryFragment(
          dnsTextFragment,
          registryFragment
        );
        return ocIsValid(
          [dnsTextFragment, registryFragment],
          ["ISSUER_IDENTITY"]
        )
          ? { status: CheckStatus.VALID, issuerName }
          : {
              status: CheckStatus.INVALID,
              issuerName
            };
      })
    : openAttestationDnsTxt
        .verify(document as OAWrappedDocument, { network: networkName })
        .then(dnsTextFragment => {
          const issuerName = getIssuerNameFromRegistryFragment(dnsTextFragment);
          return dnsTextFragment.status === CheckStatus.VALID
            ? { status: CheckStatus.VALID, issuerName }
            : { status: CheckStatus.INVALID, issuerName };
        });

  promisesCallback([verifyHash, verifyIssued, verifyRevoked, verifyIdentity]);

  // If any of the checks are invalid, resolve the overall validity early
  return Promise.all([
    new Promise(async (resolve, reject) =>
      (await verifyHash).status === CheckStatus.VALID
        ? resolve()
        : reject("verifyHash has failed")
    ),
    new Promise(async (resolve, reject) =>
      (await verifyIssued).status === CheckStatus.VALID
        ? resolve()
        : reject("verifyIssued has failed")
    ),
    new Promise(async (resolve, reject) =>
      (await verifyRevoked).status === CheckStatus.VALID
        ? resolve()
        : reject("verifyRevoked has failed")
    ),
    new Promise(async (resolve, reject) =>
      (await verifyIdentity).status === CheckStatus.VALID
        ? resolve()
        : reject("verifyIdentity has failed")
    )
  ])
    .then(() => true)
    .catch(err => {
      console.log("There was an error in DocumentVerifier.js", err);
      return false;
    });
};
