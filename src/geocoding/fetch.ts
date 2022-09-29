import { FetchStatus } from "../components/RicadianContract/RicardianContract";

export async function fetchGeoCodingCSV(): Promise<{ data: string, status: FetchStatus, error: string }> {
    let result = { data: "", status: FetchStatus.loading, error: "" };
    try {
        const response = await fetch(
            "https://arweave.net/Wl0lmZU2A1D60EqMePwX77PpFpTEIMUdKGSBM-uGlto",
            { method: "get" }
        );
        result.data = await response.text();
        result.status = FetchStatus.success;
    } catch (error: any) {
        result.status = FetchStatus.error;
        result.error = error.message;
    }
    return result;
}

