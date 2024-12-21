const htmlAssetHeader = 
`<form class="asset" style="background-color: $BACKGROUND-COLOR$">
    <div style="overflow: hidden; padding: 10px;">
        <div class="card-chart-color" style="background-color: $BACKGROUNDCOLOR$"></div>
        <div class="width-full" style="float: left; padding-top: 10px;">
            <label for="instrument">Financial Instrument</label><br />
            <select class="width-full" name="instrument">
                $INSTRUMENTOPTIONS$
            </select><br />
            <label for="displayName">Familiar Name</label><br />
            <input type="text" class="width-full" name="displayName" value="$DISPLAYNAME$" placeholder="familiar name" /><br />
        </div>
        $ASSETPROPERTIES$
    </div>
    <br />
    <input type="submit" class="remove" value="Remove" />
</form>`;

const htmlAssetBody = 
`<div class="width-full" style="float: left; padding-top: 10px;">
    <div style="float: left; width: 55%">
        <label for="startDate">Start Date</label><br />
        <input type="month" class="width-full" name="startDate" value="$STARTDATE$" required />
    </div>
    <div style="float: left; width: 45%">
        <label for="startValue">Start Value</label><br />
        <input type="number" class="width-full" name="startValue" value="$STARTVALUE$" step="0.01" placeholder="dollar amount at start date" required />
    </div>
</div>
<div class="width-full" style="float: left; padding-top: 10px;">
    <div style="float: left; width: 55%">
        <label for="finishDate">Finish Date</label><br />
        <input type="month" class="width-full" name="finishDate" value="$FINISHDATE$" required />
    </div>
    <div style="float: left; width: 45%">
        <label for="finishValue">Finish Value</label><br />
        <input type="number" class="width-full" name="finishValue" value="$FINISHVALUE$" step="0.01" placeholder="computed" readonly />
    </div>
</div>
<div class="width-full" style="float: left; padding-top: 10px">
    <div style="float: left; width: 55%">    
        <label for="annualReturnRate">Annual Return %</label><br />
        <input type="number" class="width-full" name="annualReturnRate" step="0.01" value="$ANNUALRETURNRATE$" placeholder="annual return rate" required />        
    </div>
    <div style="float: left; width: 45%">
        $MONTHSREMAININGDISPLAY$
    </div>
</div>
<div class="width-full" style="float: left; padding-top: 10px">
    <div style="float: left; width: 55%">    
        <label for="accumulatedValue">Accumulated Value</label><br />
        <input type="number" class="width-full" name="accumulatedValue" step="0.01" value="$ACCUMULATEDVALUE$" placeholder="accumulated value" />
    </div>
    <div style="flat: left; width: 45%:">
    </div>
</div>
<div class="width-full" style="float: left; padding-top: 10px">    
    $FUNDINGSOURCEDISPLAY$
</div>`;

const htmlInvisibleDisplay = `<label class="invisible" for="invisiblePlaceholder">Invisible</label><br class="invisible" />
    <input class="invisible" type="number" style=""width: 125px" name="invisiblePlaceholder" placeholder="invisible" />`;

const htmlInvisibleHidden = `<label class="invisible" style="display: none" for="invisiblePlaceholder">Invisible</label><br class="invisible" style="display: none" />
    <input class="invisible" type="number" style="display: none; width: 125px" name="invisiblePlaceholder" placeholder="invisible" />`;

const htmlMonthsRemainingDisplay = `<label class="hidable" for="monthsRemaining">Months Remaining</label><br class="hidable" />
    <input class="hidable" type="number" style="width: 125px" name="monthsRemaining" value="$MONTHSREMAINING$" placeholder="months" />`;

const htmlMonthsRemainingHidden = `<label class="hidable" for="monthsRemaining" style="display: none">Months Remaining</label><br class="hidable" style="display: none" />
    <input class="hidable" type="number" style="display: none; width: 125px" name="monthsRemaining" value="$MONTHSREMAINING$" placeholder="months" />`;

const htmlFundingSourceDisplay = `<label for="fundingSource">Apply to Card</label><br />
    <select class="width-full" name="fundingSource">
        $FUNDINGSOURCEOPTIONS$
    </select>`;

const htmlFundingSourceHidden = `<label class="hidable" for="fundingSource" style="display: none">Apply to Card</label><br class="hidable" style="display: none" />
    <select class="hidable width-full" style="display: none" name="fundingSource">
        $FUNDINGSOURCEOPTIONS$
    </select>`;

const htmlAssetExpense = '';

const htmlAssets = '<div class="scrollable-x" id="assets"></div>';

const assetBase = 'asset';

const positiveBackgroundColor = '#76ad76';
const negativeBackgroundColor = '#ad7676';

//const colorRange = ['#33cc00','#cc3300','#0033cc','#cc9900','#00cc99','#9900cc','#cc33cc','#cc3333','#556B2F','#8FBC8B'];
const colorRange = ['#3366cc', '#dc3912', '#ff9900', '#109618', '#990099', '#3b3eac', '#0099c6','#dd4477', '#66aa00', '#b82e2e', '#316395', '#994499', '#22aa99', '#aaaa11','#6633cc', '#e67300', '#8b0707', '#329262', '#5574a6', '#651067'];

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

function html_buildFundingSourceOptions(modelAssets, currentDisplayName, fundingSource) {
    if (modelAssets == null) {
        console.log('html_buildFundingSourceOptions - modelAssets is null; querying html assets');
        modelAssets = membrane_htmlElementsToAssetModels();    
    }
    let html = '<option value="none">None</option>';
    for (const modelAsset of modelAssets) {
        if (isFundableAsset(modelAsset.instrument) && modelAsset.displayName != currentDisplayName) {
            html += '<option value="' + modelAsset.displayName + '"';
            if (modelAsset.displayName == fundingSource)
                html += ' selected';
            html += '>' + modelAsset.displayName + '</option>';
        }
    }
    return html;
}

function html_buildAssetHeader(modelAsset) {
    let html = htmlAssetHeader;
    html = html.replace("$BACKGROUNDCOLOR$", colorRange[modelAsset.colorId]);
    html = html.replace('$INSTRUMENTOPTIONS$', html_buildInstrumentOptions(modelAsset.instrument));     
    return html;
}

function html_buildRemovableAssetElement(modelAssets, modelAsset) {
    let html = (html_buildAssetHeader(modelAsset)).slice();
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

    html = html.replace('$FUNDINGSOURCEDISPLAY$', htmlFundingSourceDisplay);
    
    if (isMortgage(modelAsset.instrument) || isDebt(modelAsset.instrument)) {
        html = html.replace('$MONTHSREMAININGDISPLAY$', htmlMonthsRemainingDisplay);
    }
    else {
        html = html.replace('$MONTHSREMAININGDISPLAY$', htmlMonthsRemainingHidden);    
    }

    html = html.replace('$MONTHSREMAINING$', modelAsset.monthsRemaining);  
    html = html.replace('$FUNDINGSOURCEOPTIONS$', html_buildFundingSourceOptions(modelAssets, modelAsset.displayName, modelAsset.fundingSource));

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