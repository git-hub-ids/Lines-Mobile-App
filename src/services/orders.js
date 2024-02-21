import * as general from "services/general";
export async function getOrders(
  locationId,
  stepId,
  status,
  skip = 0,
  take = 0,
  orderBy = 0
) {
  var path = `${general.servicesUrl.getOrders}?ProductionCenterId=${locationId}&stepId=${stepId}&status=${status}&skip=${skip}&take=${take}&OrderBy=${orderBy}`;
  return await general.get(path, true).then((response) => {
    return response;
  });
}

export async function searchOrders(locationId, stepId, searchText) {
  var path = `${general.servicesUrl.getOrders}?ProductionCenterId=${locationId}&stepId=${stepId}&search=${searchText}`;
  return await general.get(path, true).then((response) => {
    return response;
  });
}

export async function getOrderDetails(item, checkType) {
  var path = `${general.servicesUrl.getOrderDetails}?checkType=${checkType}`;
  return await general.post(path, item, true).then((response) => {
    return response.map(function (item) {
      item.expiryDate = formatDate(item.expiryDate);
      return item;
    });
  });
}

export async function saveOrder(data) {
  return await general
    .post(general.servicesUrl.saveOrder, data, true)
    .then((response) => {
      return response;
    });
}

export async function saveCharges(data) {
  return await general
    .post(general.servicesUrl.saveCharges, data, true)
    .then((response) => {
      return response;
    });
}

export async function getItem(id) {
  var path = general.servicesUrl.getItems + id;
  let response = await general.get(path, true).then((response) => {
    return response;
  });
  return formatItem(response);
}

export async function getItems(skip, take, text = "") {
  let search = "";
  if (text !== "") search = `&search=${text}`;
  var path = `${general.servicesUrl.getItems}Skip/${skip}/Take/${take}?OnlyItem=1&invoiceKind=70&currencyId=1${search}`;
  let response = await general.get(path, true).then((response) => {
    return response;
  });
  return formatItems(response);
}

export async function getUnits(itemId) {
  var path = `${general.servicesUrl.getUnits}${itemId}?invoiceKind=70&currencyId=1`;
  let response = await general.get(path, true).then((response) => {
    return response;
  });
  return formatUnits(response);
}

// export async function getWarehouses() {
//   let warehouses = global.warehouses;
//   if (!warehouses || warehouses.length == 0) {
//     let response = await general
//       .get(general.servicesUrl.getWarehouses, true)
//       .then((response) => {
//         return response;
//       });
//     warehouses = formatWarehouses(response);
//     global["warehouses"];
//   }
//   return warehouses;
// }
export async function getIntermediateWarehouse() {
  let response = await general
    .get(general.servicesUrl.getIntermediateWarehouse, true)
    .then((response) => {
      return response;
    });
  global["IntermediateWarehouse"] = response[0].value;
  return response[0].value;
}
export async function getSettingShowOnlyName() {
  let response = await general
    .get(general.servicesUrl.getSettingShowOnlyName, true)
    .then((response) => {
      return response;
    });
  global["ShowOnlyName"] = response[0].value;
  return response[0].value;
}
export async function getWarehouses(withoutIntermediate = false) {
  let warehouses = global.warehouses;

  if (!warehouses || warehouses.length == 0) {
    var path = `${general.servicesUrl.getWarehouses}?ProductionCenterID=${global.LocationId}&withoutIntermediate=${withoutIntermediate}`;
    let response = await general
      .get(path, true)
      .then((response) => {
        return response;
      });
    warehouses = formatWarehouses(response);
    global["warehouses"];
  }
  return warehouses;
}

export async function getAvailableQty(itemId, whouseId, spec = '', expiry = '') {
  if (global.LocationId == null)
    global.LocationId = 0;
  var path = `${general.servicesUrl.getAvailableQty}${itemId}?whouseId=${whouseId}`;
  if (spec != '')
    path = path + `&spec=${spec}`
  if (expiry != '')
    path = path + `&expiryDate=${expiry}`
  let response = await general
    .get(path, true)
    .then((response) => {
      return response;
    });
  return response[0].onHand;
}

function formatDate(date) {
  if (date === "1900-01-01T00:00:00" || date === "0001-01-01T00:00:00")
    return null;
  return date;
}

function formatItems(response) {
  let items = [];
  if (response) {
    items = response.map((item) => {
      return formatItem(item);
    });
  }
  return items;
}

function formatItem(item) {
  if (item) {
    item.value = item.id;
    item.label = item.name;
    item.units = formatUnits(item);
  }
  return item;
}

function formatUnits(response) {
  let units = [];
  if (response && response.units && response.units.length > 0) {
    units = response.units.map((unit) => ({
      id: unit.unitId,
      value: unit.unitId,
      label: unit.unitName,
    }));
  }
  return units;
}

function formatWarehouses(response) {
  let warhouses = [];
  if (response && response.length > 0) {
    warhouses = response.map((warehouse) => ({
      id: warehouse.id,
      value: warehouse.id,
      label: warehouse.name,
    }));
  }
  return warhouses;
}
