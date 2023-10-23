import { API } from '@env';
import { translate } from "helpers/utils";
import * as storage from "helpers/storage";

export const servicesUrl = {
    /* GET */
    getProductionCenters: '/LookUp/ProductionCenter',
    getCharges: '/LookUp/Charges',
    getSteps: '/WorkFlow/Step',
    getOrders: '/WorkFlow/FlowData',
    getItems: '/Items/',
    getUnits: '/Items/',
    // getWarehouses: '/Warehouses?withoutIntermediate=true',
    getWarehouses: '/WorkFlow/ProductionCenterWhouses',
    getIntermediateWarehouse: '/Settings/10071',
    getAvailableQty:'/WarehouseUnits/GroupedByWarehouse/',
    /* POST */
    postLogin: '/Auth/Login',
    getOrderDetails: '/WorkFlow/FlowDataDetail',
    saveOrder: '/WorkFlow/SaveFlowDataProduction',
    saveCharges: '/WorkFlow/SaveChargesStep',
}

export async function createHeaders(withToken = true, contentType = 'application/json', language = 'en') {
    var headers = new Headers();
    headers.append('Content-Type', contentType);
    headers.append('Accept', "application/json");
    if (withToken) {
        token = global.token;
        headers.append('Authorization', 'Bearer ' + token);
    }

    return headers;
}

export async function get(path, withToken = true) {
    let apiUrl = await storage.getItem("api");
    if (!apiUrl || apiUrl === "")
        apiUrl = API;
    const url = `${apiUrl}${path}`;
    const headers = await createHeaders(withToken);
    return fetch(url, {
        method: "GET",
        headers: headers,
    })
        .then((res) => res.json())
        .catch((error) => global.toast.show(translate('msgErrorOccurred'), { type: "danger" }))
        .then((response) => {
            if (response.hasError) {
                global.toast.show(response.message, { type: "danger" })
                return null;
            }
            return response.body;
        });
}

export async function post(path, data, withToken = true) {
    let apiUrl = await storage.getItem("api");
    if (!apiUrl || apiUrl === "")
        apiUrl = API;
    const url = `${apiUrl}${path}`;
    const headers = await createHeaders(withToken);
    const controller = new AbortController();

    const id = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
        signal: controller.signal
    })
        .then((res) => res.json())
        .then((response) => {
            if (response) {
                if (response.hasError) {
                    global.toast.show(response.message, { type: "danger" })
                    return null;
                }
                return response.body;
            }
            return response;
        })
        .catch((error) => {
            if (error.code == 20) {
                global.toast.show(translate('msgConnectionError'), { type: "danger" })
                return "timeout"
            } else {
                global.toast.show(translate('msgErrorOccurred'), { type: "danger" })
                return null
            }
        })

    clearTimeout(id);
    return response;
}
