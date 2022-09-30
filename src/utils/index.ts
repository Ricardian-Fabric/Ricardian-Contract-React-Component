import Web3 from "web3";
import { BlockCountry, ContractProperties } from "../components/RicadianContract/RicardianContract";

export type HashData = {
    legalContract: string;
    createdDate: string;
    expires: string;
    redirectto: string;
    version: string;
    issuer: string;
    blockedCountries: BlockCountry[];
    blockedAddresses: string[];
    network: string;
    smartContract: string;
    ERC20: string;
};


export async function getRecomputedHash(props: ContractProperties, semantics: string) {
    const createdDate = props.created as string;
    const expires = props.expires as string;
    const redirectto = props.redirectto as string;
    const version = props.version as string;
    const issuer = props.issuer as string;
    const blockedCountries = props.blockedCountries as BlockCountry[];
    const blockedAddresses = props.blockedAddresses as string[];
    const network = props.network as string;
    const smartContract = props.smartcontract as string;
    const ERC20 = JSON.stringify(props.erc20);
    const recomputedHash = await getHash({
        legalContract: semantics,
        createdDate,
        expires,
        redirectto,
        version,
        issuer,
        blockedCountries,
        network,
        smartContract,
        blockedAddresses,
        ERC20,
    });
    return recomputedHash;
}

function orderStringsForHashing(data: HashData): string {
    const blockedCountries = JSON.stringify(data.blockedCountries);
    const blockedAddresses = JSON.stringify(data.blockedAddresses);
    return concatStrings([
        data.legalContract,
        data.createdDate,
        data.expires,
        data.redirectto,
        data.version,
        data.issuer,
        blockedCountries,
        blockedAddresses,
        data.network,
        data.smartContract,
        data.ERC20,
    ]);
}

export async function getHash(data: HashData) {
    const ordered = orderStringsForHashing(data);
    return await sha256(ordered);
}

export async function sha256(message: string) {
    const web3 = new Web3();
    const encoded = web3.eth.abi.encodeParameters(["string"], [message]);
    const hash = Web3.utils.sha3(encoded);
    return hash;
}

function concatStrings(data: Array<String>) {
    let res = "";
    data.forEach((d) => {
        res += d;
    });
    return res;
}

export function didExpire(expires: string): boolean {
    if (expires === "NEVER") {
        return false;
    } else {
        const now = new Date().getTime();
        const expiryDate = new Date(expires).getTime();
        return now > expiryDate;
    }
}