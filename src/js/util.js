class DateInt {
    constructor(yyyyMM) {
        this.year = parseInt(yyyyMM / 100);
        this.month = yyyyMM - (this.year * 100);
    }

    static parse(yyyyMM) {
        let segments = yyyyMM.split('-');
        let year = parseInt(segments[0]);
        let month = parseInt(segments[1]);
        return new DateInt((year * 100) + month);
    }

    toTwoMonth() {
        let result = '';
        if (this.month < 10)
            result += '0';
        return result + this.month.toString();
    }

    toInt() {
        return (this.year * 100) + this.month;
    }

    toString() {
        return this.year.toString() + '-' + this.toTwoMonth();
    }

    toLastDate() {
        let dt = new Date(this.year, this.month, 1);
        dt.setDate(0);
        return dt.getDate();
    }

    toISOString(endOfMonth) {
        if (endOfMonth)
            return this.year.toString() + '-' + this.toTwoMonth() + '-' + this.toLastDate().toString();
        else
            return this.year.toString() + '-' + this.toTwoMonth() + '-01';
    }

    toHTML() {
        let html = this.year.toString() + '-';
        if (this.month < 10) html += '0';
        html += this.month.toString();
        return html;
    }

    prev() {
        if (this.month == 1) {
            this.year--;
            this.month = 12;
        }
        else
            this.month--;
    }

    next() {
        if (this.month == 12) {
            this.year++;
            this.month = 1;
        }
        else
            this.month++;
    }

    addMonths(num) {
        while (num > 0) {
            this.next();
            --num;
        }
    }
}

class MonthsSpan {
    constructor(totalMonths, combineMonths, offsetMonths) {
        this.totalMonths = totalMonths;
        this.combineMonths = combineMonths;
        this.offsetMonths = offsetMonths;
    }
}

class Currency {
    constructor(amount) {
        this.amount = amount;
    }

    static parse(currency) {
        var currency = currency.replace("$", "");
        return new Currency(parseFloat(currency));
    }

    zero() {
        this.amount = 0.0;
    }

    add(currency) {
        this.amount += currency.amount;
        return this;
    }

    subtract(currency) {
        this.amount -= currency.amount;
        return this;
    }

    toCurrency() {
        return this.amount.toFixed(2)
    }

    toString() {
        return '$' + String(this.toCurrency());
    }

    toHTML() {
        return String(this.toCurrency());
    }
}

class ARR {
    constructor(annualReturnRate) {
        this.annualReturnRate = annualReturnRate;
    }

    static parse(annualReturnRate) {
        annualReturnRate = annualReturnRate.replace("%", "");
        let annualReturnRateFloat = parseFloat(annualReturnRate);
        annualReturnRateFloat /= 100.0;
        return new ARR(annualReturnRateFloat);
    }

    hasMonthly() {
        return this.annualReturnRate != 0.0;
    }

    hasMonthlyAmount() {
        return false;
    }

    asMonthly() {
        return this.annualReturnRate / 12.0;
    }

    toString() {
        return String(this.annualReturnRate * 100.0) + '%';
    }

    toHTML() {
        return String(this.annualReturnRate * 100.0);
    }
}

function util_firstDateInt(modelAssets) {
    let firstDateInt = null;
    for (const modelAsset of modelAssets) {
        if (firstDateInt == null)
            firstDateInt = modelAsset.startDateInt;
        else if (firstDateInt.toInt() > modelAsset.startDateInt.toInt())
            firstDateInt = modelAsset.startDateInt;
    };
    return firstDateInt;
}

function util_lastDateInt(modelAssets) {
    let lastDateInt = null;
    for (const modelAsset of modelAssets) {
        if (lastDateInt == null)
            lastDateInt = modelAsset.finishDateInt;
        else if (lastDateInt.toInt() < modelAsset.finishDateInt.toInt())
            lastDateInt = modelAsset.finishDateInt;  
    };  
    return lastDateInt;
}

function util_totalMonths(startDateInt, finishDateInt) {
    let runnerDateInt = new DateInt(startDateInt.toInt());
    let totalMonths = 0;
    while (runnerDateInt.toInt() <= finishDateInt.toInt()) {
        ++totalMonths;
        runnerDateInt.next();
    }
    return totalMonths;
}

function computeMonthsRemainingFromStartDateChange(finishDateValue, startDateValue) {
    console.log('computecomputeMonthsRemainingFromFinishDateChange(' + startDateValue + ', ' + finishDateValue + ')');
    if (startDateValue == null || startDateValue.length < 10) // 10 characters in yyyy-MM-dd format
        startDateValue = new Date().toISOString();
    if (finishDateValue == null || finishDateValue.length < 10)
        finishDateValue = new Date().toISOString();

    return computeMonthsRemainingFromStartDateToFinishDate(startDateValue, finishDateValue);
}

function computeMonthsRemainingFromFinishDateChange(startDateValue, finishDateValue) {
    console.log('computecomputeMonthsRemainingFromFinishDateChange(' + startDateValue + ', ' + finishDateValue + ')');
    if (startDateValue == null || startDateValue.length < 10) // 10 characters in yyyy-MM-dd format
        startDateValue = new Date().toISOString();
    if (finishDateValue == null || finishDateValue.length < 10)
        finishDateValue = new Date().toISOString();

    return computeMonthsRemainingFromStartDateToFinishDate(startDateValue, finishDateValue);
}

function computeMonthsRemainingFromStartDateToFinishDate(startDateValue, finishDateValue) {
    let startDate = DateInt.parse(startDateValue);
    let finishDate = DateInt.parse(finishDateValue);
    let monthsRemaining = 0;
    while (startDate.toInt() <= finishDate.toInt()) {
        startDate.next();
        ++monthsRemaining;
    }
    return monthsRemaining;
}

function computeFinishDateFromMonthsRemainingChange(startDateValue, monthsRemainingValue) {
    console.log('computeFinishDateFromMonthsRemainingChange(' + startDateValue + ', ' + monthsRemainingValue + ')');
    if (startDateValue == null || startDateValue.length < 10) // 10 characters in yyyy-MM-dd format
        startDateValue = new Date().toISOString();
    if (monthsRemainingValue == null || monthsRemainingValue < 0)
        monthsRemainingValue = 0;

    let finishDate = DateInt.parse(startDateValue);
    while (monthsRemainingValue > 0) {
        finishDate.next();
        --monthsRemainingValue;
    }

    return finishDate.toISOString(true);
}

function findModelAssetByDisplayName(modelAssets, displayName) {    
    for (const modelAsset of modelAssets) {
        if (modelAsset.displayName == displayName)
            return modelAsset;
    }
    return null;
}

function isMortgage(value) {
    return value == sInstrumentNames[sInstrumentsIDs.mortgage];
}

function isDebt(value) {
    return value == sInstrumentNames[sInstrumentsIDs.debt];
}

function isMonthlyExpenses(value) {
    return value == sInstrumentNames[sInstrumentsIDs.monthlyExpenses];
}

function isMonthlyIncome(value) {
    return value == sInstrumentNames[sInstrumentsIDs.income];
}

function isFundableAsset(value) {
    if (value == sInstrumentNames[sInstrumentsIDs.income])
        return true;
    else if (value == sInstrumentNames[sInstrumentsIDs.cash])
        return true;
    else if (value == sInstrumentNames[sInstrumentsIDs.bank])
        return true;
    else if (value == sInstrumentNames[sInstrumentsIDs.taxableEquity])
        return true;
    else if (value == sInstrumentNames[sInstrumentsIDs.taxDeferredEquity])
        return true;
    else if (value == sInstrumentNames[sInstrumentsIDs.taxFreeEquity])
        return true;
    else if (value == sInstrumentNames[sInstrumentsIDs.usBond])
        return true;
    else if (value == sInstrumentNames[sInstrumentsIDs.corpBond])
        return true;
    else
        return false;
}

function displayElementSet(sourceElement, startIndex) {
    // hide invisible placeholders
    sourceElement.parentElement.children[0].style.display = 'none';
    sourceElement.parentElement.children[1].style.display = 'none';
    sourceElement.parentElement.children[2].style.display = 'none';

    // show the element set
    sourceElement.parentElement.children[startIndex].style.display = '';
    sourceElement.parentElement.children[startIndex+1].style.display = '';
    sourceElement.style.display = '';
}

