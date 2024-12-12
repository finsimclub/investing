function membrane_jsonObjectToModelAsset(jsonObject) {
    var modelAsset = ModelAsset.parse(jsonObject);
    return modelAsset;
}

function membrane_jsonObjectsToModelAssets(jsonObjects) {
    var modelAssets = [];
    for (const jsonObject of jsonObjects) {
        modelAssets.push(membrane_jsonObjectToModelAsset(jsonObject));
    };    
    return modelAssets;
}

function membrane_modelAssetToHTML(modelAssets, modelAsset) {
    let html = html_buildRemovableAssetElement(modelAssets, modelAsset);
    return html;
}

function membrane_modelAssetsToHTML(modelAssets) {
    let html = '';
    let colorId = 0;
    for (modelAsset of modelAssets) {
        if (colorId >= colorRange.length)
            colorId = 0;
        modelAsset.colorId = colorId++;
        html += membrane_modelAssetToHTML(modelAssets, modelAsset);
    };
    return html;
}

/* This is required in order to turn data objects into object instances-- like Month-Year data to DateInt objects */
function membrane_jsonDataToModelAssets(jsonData) {
    let rawModelAssets = JSON.parse(jsonData);
    let result = [];
    for (let ii = 0; ii < rawModelAssets.length; ii++) {
        result.push(membrane_rawModelDataToModelAsset(rawModelAssets[ii]));
    }
    return result;
}

function membrane_rawModelDataToModelAsset(rawModelData) {
    let startDateInt = new DateInt((rawModelData.startDateInt.year * 100) + rawModelData.startDateInt.month);
    let startCurrency = new Currency(rawModelData.startCurrency.amount);
    let finishDateInt = new DateInt((rawModelData.finishDateInt.year * 100) + rawModelData.finishDateInt.month);
    let finishCurrency = new Currency(rawModelData.finishCurrency.amount);
    let arr = new ARR(rawModelData.annualReturnRate.annualReturnRate);
    let modelAsset = new ModelAsset(rawModelData.instrument, rawModelData.displayName, startDateInt, startCurrency, finishDateInt, rawModelData.monthsRemaining, finishCurrency, arr);
    modelAsset.fundingSource = rawModelData.fundingSource;
    return modelAsset;
}

function membrane_htmlElementToAssetModel (assetElement) {
    const inputElements = assetElement.querySelectorAll('input, select');
    const colorElement = assetElement.querySelector('.card-chart-color');
    return ModelAsset.parseHTML(inputElements, colorElement.style.backgroundColor);
}

function membrane_htmlElementsToAssetModels () {
    var assetModels = [];
    const assetElements = assetsContainerElement.querySelectorAll('form');
    for (const assetElement of assetElements) {
        // kind of weird to stringify and parse, but matches the pattern
        assetModels.push(membrane_htmlElementToAssetModel(assetElement));
    }
    return assetModels;
}

function JSONObjectToAsset(assetObject, id) {
    assetElement = document.getElementById("asset");
    for (const [key, value] of Object.entries(assetObject)) {
        if (key.length > 0) {
            let inputElement = assetElement.querySelector('#' + key);
            if (inputElement != null)
                inputElement.value = value;
        }
    }
}

function JSONObjectArrayToAssets(assetObjects) {
    assetsContainerElement.innerHTML = '';
    let count = 1;
    for (const assetObject of assetObjects) {
        JSONObjectToAsset(assetObject, count++);
    }
}
