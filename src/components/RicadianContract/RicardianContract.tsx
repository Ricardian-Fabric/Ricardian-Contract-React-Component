import { useEffect, useState } from 'react';
import Web3 from 'web3';
import { getLocation, isBlocked } from '../../geocoding';
import { didExpire, getRecomputedHash } from '../../utils';
import { acceptAgreement, canAccept, getAccount } from '../../web3';
import { provider } from 'web3-core';


/*
  @Dev: The properties of the Ricardian contract component
  @param arweaveTx: The arweave transaction id of the uploaded ricardian contract
  @param provider: The Web3 provider used to accept this ricardian contract
  @param LoadingIndicator: The React component to show when the contract is loading
  @param useReverseGeocoding: A boolean value to enable decentralized reverse geocoding. The component downloads a dataset from arweave after requesting location if this is enabled
  @param AcceptButton: The Button Component used for accepting the contract.
  @param signingSuccessCallback: A function that is called when a contract has been accepted
  @param signingErrorCallback: A function that is called when the contract signing has failed!
*/

export interface RicardianContractProps {
    arweaveTx: string,
    provider: provider,
    LoadingIndicator: React.ReactNode,
    useReverseGeocoding: boolean,
    AcceptButton: React.ReactNode,
    signingSuccessCallback: SigningSuccessCallback,
    signingErrorCallback: SigningErrorCallback,

}

/*
  @Dev: The funciton is called when a contract has been successfully signed or if it was accepted already
*/

export type SigningSuccessCallback = () => void;

/*
  @Dev: This function is called when an error occurs.
*/
export type SigningErrorCallback = (message: string) => void;

/*
  @Dev: The Status when Fetching the Ricardian Contract
*/
export enum FetchStatus { loading, success, error };


/*
  @Dev: When blocking a country the following sanctions can be applied: OFEC,EU,UN or you can choose to block USA
*/
export enum BlockCountry {
    OFEC = "OFEC",
    EU = "EU",
    UN = "UN",
    BLOCKUSA = "BLOCKUSA"
}

/*
 @Dev: The contract properties contain the encoded data from the Ricardian Contract
*/

export type ContractProperties = {
    contracttype: string | null,
    version: string | null,
    created: string | null,
    expires: string | null,
    redirectto: string | null,
    network: string | null,
    issuer: string | null,
    issuersignature: string | null,
    smartcontract: string | null,
    erc20: string | null,
    blockedAddresses: string[] | null,
    blockedCountries: BlockCountry[] | null,
    relatedtrail: string | null,
    trailaddress: string | null
}

function parseContract(html: string): [string, ContractProperties] {
    const doc: Document = new DOMParser().parseFromString(html, "text/html");
    const page: Element | null = doc.getElementById("page");

    if (page === null || page === undefined) {
        throw new Error("Invalid Ricardia Contract");
    }

    const display: Element = doc.getElementById("contract-display") as Element;

    let display_innerHTML = display.innerHTML;

    return [display_innerHTML, {
        contracttype: page.getAttribute("data-contracttype"),
        version: page.getAttribute("data-version"),
        created: page.getAttribute("data-created"),
        expires: page.getAttribute("data-expires"),
        redirectto: page.getAttribute("data-redirectto"),
        network: page.getAttribute("data-network"),
        issuer: page.getAttribute("data-issuer"),
        issuersignature: page.getAttribute("data-issuersignature"),
        smartcontract: page.getAttribute("data-smartcontract"),
        erc20: page.getAttribute("data-erc20") === `""` ? "" : JSON.parse(page.getAttribute("data-erc20") as string),
        blockedAddresses: JSON.parse(page.getAttribute("data-blockedaddresses") as string),
        blockedCountries: JSON.parse(page.getAttribute("data-blockedcountries") as string),
        relatedtrail: page.getAttribute("data-relatedtrail"),
        trailaddress: page.getAttribute("data-trailaddress")

    }]
}

const RicardianContract = ({ arweaveTx, provider, LoadingIndicator, useReverseGeocoding, AcceptButton, signingSuccessCallback, signingErrorCallback }: RicardianContractProps) => {
    const [contractSemantics, setContractSemantics] = useState<string>("");
    const [contractProperties, setContractProperties] = useState<ContractProperties | undefined>(undefined);
    const [status, setStatus] = useState(FetchStatus.loading);

    async function clickAccept() {
        const contractProps = contractProperties as ContractProperties;

        if (useReverseGeocoding) {
            const [myPosition, errOccured, errMsg] = await getLocation();
            if (errOccured) {
                signingErrorCallback(errMsg);
            }
            const blocked = await isBlocked(myPosition as GeolocationPosition, contractProps.blockedCountries as BlockCountry[])

            if (blocked) {
                signingErrorCallback("Unavailable");
                return;
            }
        }
        const expired = didExpire(contractProps.expires as string);
        if (expired) {
            signingErrorCallback("Expired!")
            return;
        }

        if (contractProps.network !== "arweave") {
            const web3 = new Web3(provider);

            const account = await getAccount(web3);

            if (contractProps.blockedAddresses?.includes(account)) {
                signingErrorCallback("Blocked");
                return;
            }


            const acceptable = await canAccept(web3, contractProps.smartcontract as string, account, signingErrorCallback)

            if (!acceptable) {
                //You have already accepted this contract
                signingSuccessCallback();
                return;
            }

            const hash = await getRecomputedHash(contractProps, contractSemantics);

            const onError = (error: any, receipt: any) => {
                signingErrorCallback(error.message);
            }
            const onReceipt = async (receipt: any) => {
                signingSuccessCallback();
            }

            await acceptAgreement(web3,
                signingErrorCallback,
                {
                    hash: hash as string,
                    signerAddress: account,
                    contractAddress: contractProps.smartcontract as string,
                    onError,
                    onReceipt
                })

        }

    }

    useEffect(() => {
        if (arweaveTx === undefined) {
            throw new Error("arweaveTx is undefined");
        }
        fetch(`https://arweave.net/${arweaveTx}`)
            .then(response => response.text())
            .then(data => {
                const [semantics, properties] = parseContract(data);
                setContractProperties(properties);
                setContractSemantics(semantics);
                setStatus(FetchStatus.success)
            }).catch(err => {
                setStatus(FetchStatus.error)
                signingErrorCallback(err.message)
            })
    }, [])

    if (status === FetchStatus.loading) {

        if (arweaveTx === undefined) {
            return <h1>Arweave Transaction is undefined.</h1>
        }

        return <div style={{ display: "flex", justifyContent: "center" }}>{LoadingIndicator}</div>
    } else if (status === FetchStatus.error) {
        return <h1>An Error Occured!</h1>
    } else {
        return (<div>
            <div dangerouslySetInnerHTML={{ __html: contractSemantics }}></div>
            <div style={{ display: "flex", justifyContent: "center" }} >
                <div onClick={async () => await clickAccept()} style={{ width: "fit-content" }}>{AcceptButton}</div>
            </div>
            <p></p>
        </div>)
    }
}

export default RicardianContract;