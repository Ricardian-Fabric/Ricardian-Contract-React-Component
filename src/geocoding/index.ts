import { BlockCountry, FetchStatus } from "../components/RicadianContract/RicardianContract";
import { fetchGeoCodingCSV } from "./fetch";
import { createRevGeocoder } from "./geocoder";
import { GeoRecord } from "./types";

export function getLocation(): [GeolocationPosition | undefined, boolean, string] {
    let myPosition;
    let errOccured = false;
    let errMsg = "";
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async function (position) {
                setTimeout(() => {
                    myPosition = position;
                })
            },
            function (err) {
                errOccured = true;
                errMsg = err.message;
            }
        )
    } else {
        errOccured = true;
        errMsg = "Geolocation is unavailable."
    }

    return [myPosition, errOccured, errMsg]
}

export async function isBlocked(position: GeolocationPosition, blockedCountries: BlockCountry[]) {
    const geoCodingCSV = await fetchGeoCodingCSV();

    if (geoCodingCSV.status === FetchStatus.error) {
        // If we are unable to fetch the dataset, we block by default!
        return true;
    }
    const record = await getCountryCode(position, geoCodingCSV.data)
    if (record) {
        return isCountryBlocked(record, blockedCountries)
    }
    // If the record doesn't exist we can return true again
    return true;
}

export async function getCountryCode(
    locationData: GeolocationPosition,
    geoCodingData: string
): Promise<GeoRecord> {
    const revGeocoder = await createRevGeocoder({ dataset: geoCodingData });
    const result = await revGeocoder.lookup({
        latitude: locationData?.coords.latitude,
        longitude: locationData?.coords.longitude,
    });

    return result.record;
}

export function isCountryBlocked(
    record: GeoRecord,
    blockedCountries: BlockCountry[]
): boolean {
    let result = false;
    const blocked = (sanction: BlockCountry) => {
        switch (sanction) {
            case BlockCountry.OFEC:
                return [
                    "AF",
                    "BY",
                    "BA",
                    "BI",
                    "CF",
                    "CN",
                    "KM",
                    "CU",
                    "CY",
                    "CD",
                    "GN",
                    "GW",
                    "HT",
                    "IR",
                    "IQ",
                    "KG",
                    "LA",
                    "LB",
                    "LY",
                    "ML",
                    "MR",
                    "MD",
                    "ME",
                    "MM",
                    "NI",
                    "KP",
                    "PS",
                    "RU",
                    "RW",
                    "RS",
                    "SO",
                    "SS",
                    "SD",
                    "SY",
                    "TN",
                    "UA",
                    "VE",
                    "YE",
                    "ZW",
                ];

            case BlockCountry.UN:
                return [
                    "AF",
                    "CF",
                    "CD",
                    "GW",
                    "IR",
                    "IQ",
                    "LB",
                    "LY",
                    "ML",
                    "ME",
                    "KP",
                    "RS",
                    "SO",
                    "SS",
                    "SD",
                    "SY",
                    "YE",
                ];
            case BlockCountry.EU:
                return [
                    "BY",
                    "BA",
                    "BI",
                    "CF",
                    "CN",
                    "CD",
                    "GN",
                    "GW",
                    "HT",
                    "IR",
                    "LB",
                    "LY",
                    "MD",
                    "ME",
                    "MM",
                    "NI",
                    "KP",
                    "RU",
                    "RS",
                    "SS",
                    "SD",
                    "SY",
                    "TN",
                    "UA",
                    "VE",
                    "ZW",
                ];

            default:
                return [sanction];
        }
    };

    blockedCountries.forEach((sanctions) => {
        if (blocked(sanctions).includes(record.countryCode)) {
            //If it exists in a list, it's blocked for sure
            result = true;
        }
    });
    return result;
}
