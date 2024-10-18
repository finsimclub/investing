const htmlAssetHeader = 
`<form class="asset" style="background-color: $BACKGROUND-COLOR$">
    <div style="overflow: hidden; padding: 10px;">
        <div style="float: left; padding: 10px;">
            <label for="instrument">Financial Instrument</label><br />
            <select name="instrument">
                $INSTRUMENTOPTIONS$
            </select><br />
            <label for="displayName">Familiar Name</label><br />
            <input type="text" name="displayName" value="$DISPLAYNAME$" placeholder="familiar name" /><br />
        </div>
        $ASSETPROPERTIES$
    </div>
    <input type="submit" class="remove" value="Remove" />
</form>`;

const htmlAssetBody = 
`<div style="float: left; width: 100%; padding: 10px;">
    <div style="float: left;">
        <label for="startDate">Start Date</label><br />
        <input type="date" name="startDate" value="$STARTDATE$" required />
    </div>
    <div style="float: left">
        <label for="startValue">Start Value</label><br />
        <input type="number" style="width: 100px" name="startValue" value="$STARTVALUE$" step="0.01" placeholder="dollar amount at start date" required />
    </div>
</div>
<div style="float: left; width: 100%; padding: 10px;">
    <div style="float: left">
        <label for="finishDate">Finish Date</label><br />
        <input type="date" name="finishDate" value="$FINISHDATE$" required />
    </div>
    <div style="float: left">
        <label for="finishValue">Finish Value</label><br />
        <input type="number" style="width: 100px" name="finishValue" value="$FINISHVALUE$" step="0.01" placeholder="computed" readonly />
    </div>
</div>
<div style="float: left; width: 100%; padding: 10px">    
    <label for="annualReturnRate">Annual Return %</label><br />
    <input type="number" name="annualReturnRate" step="0.01" value="$ANNUALRETURNRATE$" placeholder="annual return rate" required /><br />
    <label for="accumulatedValue">Accumulated Value</label><br />
    <input type="number" name="accumulatedValue" step="0.01" value="$ACCUMULATEDVALUE$" placeholder="accumulated value" /><br />
</div>
<div style="float: left; width: 100%; padding: 10px">
    $INVISIBLEPLACEHOLDER$
    $MONTHSREMAININGDISPLAY$
    $FUNDINGSOURCEDISPLAY$
</div>`;

const htmlInvisibleDisplay = `<label class="invisible" for="invisiblePlaceholder">Invisible</label><br class="invisible" />
    <input class="invisible" type="number" style="width: 100px;" name="invisiblePlaceholder" placeholder="invisible" />`;

const htmlInvisibleHidden = `<label class="invisible" style="display: none" for="invisiblePlaceholder">Invisible</label><br class="invisible" style="display: none" />
    <input class="invisible" type="number" style="width: 100px; display: none" name="invisiblePlaceholder" placeholder="invisible" />`;

const htmlMonthsRemainingDisplay = `<label class="hidable" for="monthsRemaining">Months Remaining</label><br class="hidable" />
    <input class="hidable" type="number" style="width: 100px" name="monthsRemaining" value="$MONTHSREMAINING$" placeholder="months" />`;

const htmlMonthsRemainingHidden = `<label class="hidable" for="monthsRemaining" style="display: none">Months Remaining</label><br class="hidable" style="display: none" />
    <input class="hidable" type="number" style="width: 100px; display: none" name="monthsRemaining" value="$MONTHSREMAINING$" placeholder="months" />`;

const htmlFundingSourceDisplay = `<label class="hidable" for="fundingSource">Pay With</label><br class="hidable" />
    <select class="hidable" name="fundingSource">
        $FUNDINGSOURCEOPTIONS$
    </select>`;

const htmlFundingSourceHidden = `<label class="hidable" for="fundingSource" style="display: none">Pay With</label><br class="hidable" style="display: none" />
    <select class="hidable" style="display: none" name="fundingSource">
        $FUNDINGSOURCEOPTIONS$
    </select>`;

const htmlAssetExpense = '';

const htmlAssets = '<div class="scrollable-x" id="assets"></div>';

const assetBase = 'asset';

const positiveBackgroundColor = '#79ad76';
const negativeBackgroundColor = '#FC9E9F';

function html_buildInstrumentOptions(instrument) {
    let html = '';
    for (let i = 0; i < sInstrumentNames.length; i++) {
        html += '<option value="' + sInstrumentNames[i] + '"';
        if (sInstrumentNames[i] == instrument)
            html += ' selected';
        html += '>' + sIntrumentDisplayNames[i] + '</option>';
    }
    return html;
}

function html_buildFundingSourceOptions(fundingSource) {
    let modelAssets = membrane_htmlElementsToAssetModels();
    let html = '<option value="none">None</option>';
    for (const modelAsset of modelAssets) {
        if (isFundableAsset(modelAsset.instrument)) {
            html += '<option value="' + modelAsset.displayName + '"';
            if (modelAsset.displayName == fundingSource)
                html += ' selected';
            html += '>' + modelAsset.displayName + '</option>';
        }
    }
    return html;
}

function html_buildAssetHeader(instrument) {
    let html = htmlAssetHeader;
    return html.replace('$INSTRUMENTOPTIONS$', html_buildInstrumentOptions(instrument));     
}

//function html_buildAssetBody(fundingSource) {
//    let html = htmlAssetBody;
//    return html.replace('$FUNDINGSOURCEOPTIONS$', html_buildFundingSourceOptions(fundingSource));
//}

function html_buildRemovableAssetElement(modelAsset) {
    let html = (html_buildAssetHeader(modelAsset.instrument)).slice();
    html = html.replace('$ASSETPROPERTIES$', htmlAssetBody); // html_buildAssetBody(modelAsset.fundingSource));
    html = html.replace('$DISPLAYNAME$', modelAsset.displayName);
    html = html.replace('$STARTDATE$', modelAsset.startDateInt.toHTML());
    html = html.replace('$STARTVALUE$', modelAsset.startCurrency.toHTML());
    html = html.replace('$FINISHDATE$', modelAsset.finishDateInt.toHTML());

    if ('finishCurrency' in modelAsset )
        html = html.replace('$FINISHVALUE$', modelAsset.finishCurrency.toHTML());
    else
        html = html.replace("$FINISHVALUE$", '0.0');

    html = html.replace('$ANNUALRETURNRATE$', modelAsset.annualReturnRate.toHTML());

    if ('accumulatedCurrency' in modelAsset)
        html = html.replace('$ACCUMULATEDVALUE$', modelAsset.accumulatedCurrency.toHTML());
    else
        html = html.replace('$ACCUMULATEDVALUE$', '0.0');   

    if (isMortgage(modelAsset.instrument) || isDebt(modelAsset.instrument) || isMonthlyExpenses(modelAsset.instrument) || isMonthlyIncome(modelAsset.instrument)) {
        html = html.replace('$INVISIBLEPLACEHOLDER$', htmlInvisibleHidden);
        if (isMortgage(modelAsset.instrument) || isDebt(modelAsset.instrument)) {
            html = html.replace('$MONTHSREMAININGDISPLAY$', htmlMonthsRemainingDisplay);
            html = html.replace("$FUNDINGSOURCEDISPLAY$", htmlFundingSourceHidden);      
        }
        else if (isMonthlyExpenses(modelAsset.instrument) || isMonthlyIncome(modelAsset.instrument)) {
            html = html.replace('$FUNDINGSOURCEDISPLAY$', htmlFundingSourceDisplay);
            html = html.replace('$MONTHSREMAININGDISPLAY$', htmlMonthsRemainingHidden);
        }
        else {
            console.log('html_buildRemovableAssetElement - confused by isMortgage, isDebt, isMonthlyExpese');
        }
    }
    else {
        html = html.replace('$INVISIBLEPLACEHOLDER$', htmlInvisibleDisplay);
        html = html.replace('$MONTHSREMAININGDISPLAY$', htmlMonthsRemainingHidden);
        html = html.replace('$FUNDINGSOURCEDISPLAY$', htmlFundingSourceHidden);
    }

    html = html.replace('$MONTHSREMAINING$', modelAsset.monthsRemaining);  
    html = html.replace('$FUNDINGSOURCEOPTIONS$', html_buildFundingSourceOptions(modelAsset.fundingSource));

    if (modelAsset.accumulatedCurrency.amount > 0)
        html = html.replace('$BACKGROUND-COLOR$', positiveBackgroundColor + ';');
    else if (modelAsset.accumulatedCurrency.amount < 0)
        html = html.replace('$BACKGROUND-COLOR$', negativeBackgroundColor + ';');
    else
        html = html.replace('$BACKGROUND-COLOR$', 'white');

    return html;
}

function html_buildAssetsElement() {
    return htmlAssets.slice();
}