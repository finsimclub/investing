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

function membrane_modelAssetToHTML(modelAsset) {
    let html = html_buildRemovableAssetElement(modelAsset);
    return html;
}

function membrane_modelAssetsToHTML(modelAssets) {
    let html = '';
    for (modelAsset of modelAssets) {
        html += membrane_modelAssetToHTML(modelAsset);
    };
    return html;
}

function membrane_htmlElementToAssetModel (assetElement) {
    const inputElements = assetElement.querySelectorAll('input, select');
    return ModelAsset.parseHTML(inputElements);
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
