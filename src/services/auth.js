import * as general from "services/general";

export async function postLogin(data) {
    return await general.post(general.servicesUrl.postLogin, data, false).then(response => { return response; });
}
