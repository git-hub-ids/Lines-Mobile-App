import * as general from "services/general";
import * as storage from "helpers/storage";
import {getUniqueId} from "helpers/utils";

export async function getLocations() {
    var deviceId = getUniqueId();
    var path = `${general.servicesUrl.getProductionCenters}?ProductionCenterId=${deviceId}`;
    return await general.get(path, true).then(response => { return response; });
}

export async function getSteps(locationId) {
    var path = `${general.servicesUrl.getSteps}?ProductionCenterId=${locationId}`;
    return await general.get(path, true).then(response => { return response; });
}

export async function getCharges() {
    let charges = await storage.getItem("charges");
    if (!charges || charges.length == 0) {
        let response = await general.get(general.servicesUrl.getCharges, true).then(response => { return response; });
        charges = formatCharges(response);
        storage.setItem("charges", charges);
    }
    return charges;
}

function formatCharges(response) {
    let charges = [];
    if (response) {
        charges = response.map((charge) => ({
            id: charge.id,
            value: charge.id,
            label: charge.chargesType
        })
        )
    }
    return charges;
}

