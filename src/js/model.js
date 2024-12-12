
const sInstrument = 'instrument';
const sDisplayName = 'displayName';
const sStartDate = 'startDate';
const sStartValue = 'startValue';
const sFinishDate = 'finishDate';
const sMonthsRemaining = 'monthsRemaining';
const sFinishValue = 'finishValue';
const sAnnualReturnRate = 'annualReturnRate';
const sFundingSource = 'fundingSource';

const sInstrumentNames = ['home', 'mortgage', 'debt', 'monthlyExpense', 'monthlyIncome', 'taxableEquity', 'taxDeferredEquity', 'taxFreeEquity', 'usBond', 'corpBond', 'bank', 'cash'];
const sIntrumentDisplayNames = ['🏡 House', '💸🏡 Mortgage', '💳 Debt', '💸💰 Monthly Expense', '💲💰 Monthly Income', '🧾📈 Taxable Account', '⏳📈 Tax Deferred Account', '📈 Tax Free Account', '🏛️ US Treasury', '🏛️ Corporate Bond', '🏦 Savings', '💰 Cash'];
const sInstrumentsIDs = Object.freeze({
    home: 0,
    mortgage: 1,
    debt: 2,
    monthlyExpense: 3,
    monthlyIncome: 4,
    taxableEquity: 5,
    taxDeferredEquity: 6,
    taxFreeEquity: 7,
    usBond: 8,
    corpBond: 9,
    bank: 10,
    cash: 11
});

class ModelAsset {
    constructor(instrument, displayName, startDateInt, startCurrency, finishDateInt, monthsRemaining, finishCurrency, annualReturnRate) {
        this.instrument = instrument;
        this.displayName = displayName;
        this.startDateInt = startDateInt;
        this.startCurrency = startCurrency;
        this.finishDateInt = finishDateInt;
        this.finishCurrency = finishCurrency;
        if (Number.isInteger(monthsRemaining))
            this.monthsRemaining = monthsRemaining;
        else
            this.monthsRemaining = 0;
        this.annualReturnRate = annualReturnRate;
        this.accumulatedCurrency = new Currency(0.0);
        this.monthlyDelta = [];
        this.monthlyTotal = [];
        this.fundingSource = null;
        this.colorId = 0;
    }

    static parseJSON(jsonObject) {
        let instrument = jsonObject.instrument;
        let displayName = jsonObject.displayName;
        let startDateInt = DateInt.parse(jsonObject['startDate']);
        let startCurrency = Currency.parse(jsonObject['startValue']);
        let finishDateInt = DateInt.parse(jsonObject['finishDate']);
        let monthsRemaining = parseInt(jsonObject['monthsRemaining']);
        let finishCurrency = Currency.parse(jsonObject['finishValue']);
        let annualReturnRate = ARR.parse(jsonObject['annualReturnRate']);
        return new ModelAsset(instrument, displayName, startDateInt, startCurrency, finishDateInt, monthsRemaining, finishCurrency, annualReturnRate);
    }

    static parseHTML(htmlElements, colorRGB) {
        let instrument = null;
        let displayName = null;
        let startDateInt = null;
        let startCurrency = null;
        let finishDateInt = null;
        let monthsRemaining = null;
        let finishCurrency = new Currency(0.0);
        let annualReturnRate = null;
        let fundingSource = null;
        
        for (const element of htmlElements) {
            if (element.name == sInstrument)
                instrument = element.value;
            else if (element.name == sDisplayName)
                displayName = element.value;
            else if (element.name == sStartDate)
                startDateInt = DateInt.parse(element.value);
            else if (element.name == sStartValue)
                startCurrency = Currency.parse(element.value);
            else if (element.name == sFinishDate)
                finishDateInt = DateInt.parse(element.value);
            else if (element.name == sMonthsRemaining)
                monthsRemaining = parseInt(element.value);
            else if (element.name == sFinishValue)
                finishCurrency = Currency.parse(element.value);
            else if (element.name == sAnnualReturnRate)
                annualReturnRate = ARR.parse(element.value);
            else if (element.name == sFundingSource)
                fundingSource = element.value;
        }

        let modelAsset = new ModelAsset(instrument, displayName, startDateInt, startCurrency, finishDateInt, monthsRemaining, finishCurrency, annualReturnRate);
        // because fundingSource is usually null, let's set it outside the constructor in case we want to do anything interesting
        modelAsset.fundingSource = fundingSource;

        let colorHex = rgb2hex(colorRGB)
        for (let ii = 0; ii < colorRange.length; ii++) {
            if (colorHex == colorRange[ii]) {
                this.colorId = ii;
                break;
            }
        }

        return modelAsset;
    }

    hasMonthlyRate() {
        if (this.annualReturnRate != null)
            return this.annualReturnRate.hasMonthly();
        else
            return false;
    }

    hasMonthlyAmount() {
        if (this.annualReturnRate != null)
            return this.annualReturnRate.hasMonthlyAmount();
        else
            return false;
    }

    credit(currency) {
        this.finishCurrency.add(currency);
        this.accumulatedCurrency.add(currency);
    }

    debit(currency) {
        this.finishCurrency.subtract(currency);
        this.accumulatedCurrency.subtract(currency);
    }

    startMonth() {
        this.monthlyDelta = [];
        this.monthlyTotal = [];
        this.monthsRemainingDynamic = this.monthsRemaining;
        this.finishCurrency.zero();

        // bump 
    }

    applyMonth_common(isInMonth) {

        if (isInMonth) {
            let currentAmount = new Currency(0.0);
            if (this.hasMonthlyRate())
                currentAmount = new Currency(this.finishCurrency.amount * this.annualReturnRate.asMonthly());
            else if (this.hasMonthlyAmount())
                currentAmount = new Currency(0.0);

            this.credit(currentAmount);        
        }

    }

    applyMonth_mortgage(isInMonth) {

        if (this.startCurrency.amount > 0) {
            this.startCurrency.amount *= -1;
            this.finishCurrency.amount *= -1;
        }

        if (isInMonth) {                	
	        let monthlyMortgagePayment = (this.finishCurrency.amount * this.annualReturnRate.asMonthly()) * Math.pow(1.0 + this.annualReturnRate.asMonthly(), this.monthsRemainingDynamic)
	        monthlyMortgagePayment /= Math.pow(1.0 + this.annualReturnRate.asMonthly(), this.monthsRemainingDynamic) - 1.0
            let monthlyMortgageInterest = new Currency(this.finishCurrency.amount * this.annualReturnRate.asMonthly());
	        let monthlyMortgagePrincipal = new Currency(monthlyMortgagePayment - monthlyMortgageInterest.amount);            
            --this.monthsRemainingDynamic;

            this.finishCurrency.subtract(monthlyMortgagePrincipal);
            this.accumulatedCurrency.add(new Currency(monthlyMortgagePayment));	
        }

    }

    applyMonth_debt(isInMonth) {

        if (this.startCurrency.amount > 0) {
            this.startCurrency.amount *= -1;
            this.finishCurrency.amount *= -1;
        }

        if (isInMonth) {                	
	        let monthlyMortgagePayment = (this.finishCurrency.amount * this.annualReturnRate.asMonthly()) * Math.pow(1.0 + this.annualReturnRate.asMonthly(), this.monthsRemainingDynamic)
	        monthlyMortgagePayment /= Math.pow(1.0 + this.annualReturnRate.asMonthly(), this.monthsRemainingDynamic) - 1.0
            let monthlyMortgageInterest = new Currency(this.finishCurrency.amount * this.annualReturnRate.asMonthly());
	        let monthlyMortgagePrincipal = new Currency(monthlyMortgagePayment - monthlyMortgageInterest.amount);            
            --this.monthsRemainingDynamic;
            
            this.finishCurrency.subtract(monthlyMortgagePrincipal);
            this.accumulatedCurrency.add(new Currency(monthlyMortgagePayment));            	
        }

    }

    applyMonth_expenseOrIncome(isInMonth) {

        // the customization here will be which buckets to debit from

        if (isMonthlyExpense(this.instrument) && this.startCurrency.amount > 0) {
            this.startCurrency.amount *= -1;
            this.finishCurrency.amount *= -1;
        }

        if (isMonthlyIncome(this.instrument) && this.startCurrency.amount < 0) {
            this.startCurrency.amount *= -1;
            this.finishCurrency.amount *= -1;
        }

        if (isInMonth) {
            let currentAmount = new Currency(0.0);
            currentAmount = new Currency(this.finishCurrency.amount * this.annualReturnRate.asMonthly());
            this.finishCurrency.add(currentAmount);
            this.accumulatedCurrency.add(this.finishCurrency);               
        }
    }

    inMonth(dateInt) {
        let isStartDate = false;
        let isFinishDate = false;

        if (dateInt.toInt() >= this.startDateInt.toInt()) {
            isStartDate = true;           
        }
        
        if (dateInt.toInt() > this.finishDateInt.toInt()) {
            isFinishDate = true;
        }
        
        return (isStartDate && !isFinishDate);
    }

    applyMonth(currentDateInt) {
        let isInMonth = this.inMonth(currentDateInt);
        
        if (currentDateInt.toInt() == this.startDateInt.toInt())
            this.finishCurrency = new Currency(this.startCurrency.amount);

        let preFinishCurrency = null;
        if (isInMonth)
            preFinishCurrency = new Currency(this.finishCurrency.amount);

        if (isMortgage(this.instrument)) {
            this.applyMonth_mortgage(isInMonth);
        }
        else if (isDebt(this.instrument)) {
            this.applyMonth_debt(isInMonth);
        }
        else if (isMonthlyExpense(this.instrument) || isMonthlyIncome(this.instrument)) {
            this.applyMonth_expenseOrIncome(isInMonth);
        }
        else {
            this.applyMonth_common(isInMonth);
        }

        if (isInMonth) {
            if (isMonthlyExpense(this.instrument) || isMonthlyIncome(this.instrument)) {
                this.monthlyDelta.push(this.finishCurrency.toCurrency())    
            }
            else {
                let postFinishCurrency = new Currency(this.finishCurrency.amount);
                this.monthlyDelta.push(postFinishCurrency.subtract(preFinishCurrency).toCurrency())
            }
            this.monthlyTotal.push(this.finishCurrency.toCurrency());
        }
        else {
            this.monthlyDelta.push('$0.00');
            this.monthlyTotal.push('$0.00');
        }

        return isInMonth;
    }

    monthlyAssetDataToDisplayAssetData(monthsSpan) {
        this.displayAssetData = [];
        for (let ii = monthsSpan.offsetMonths; ii < this.monthlyTotal.length; ii += monthsSpan.combineMonths) {
            this.displayAssetData.push(this.monthlyTotal[ii]);
        }
    }

    monthlyFlowDataToDisplayFlowData(monthsSpan) {
        this.displayFlowData = [];
        for (let ii = monthsSpan.offsetMonths; ii < this.monthlyDelta.length; ii += monthsSpan.combineMonths) {
            this.displayFlowData.push(this.monthlyDelta[ii]);
        }
    }

    getFinishCurrencyForRollup() {
        if (isMortgage(this.instrument) || isDebt(this.instrument))
            return this.accumulatedCurrency;
        else if (isMonthlyExpense(this.instrument) || isMonthlyIncome(this.instrument))
            return this.accumulatedCurrency;
        else
            return this.finishCurrency;
    }

    isPositive() {
        return this.accumulatedCurrency.amount > 0.0;
    }

    isNegative() {
        return this.accumulatedCurrency.amount < 0.0;
    }

    getEmoji() {
        if (this.instrument == sInstruments[0])
            return '🏡';
        else if (this.instrument == 'mortgage')
            return '💸🏡';
        else if (this.instrument == 'taxableEquity')
            return '🧾📈';
        else if (this.instrument == 'taxDeferredEquity')
            return '⏳📈';
        else if (this.instrument == 'taxFreeEquity')
            return '📈';
        else if (this.instrument == 'usBond')
            return '🏛️';
        else if (this.instrument == 'corpBond')
            return '🏛️';
        else if (this.instrument == 'cash')
            return '💰';
        else if (this.instrument == 'monthlyIncome')
            return '💲💰';
        else if (this.instrument == 'monthlyExpense')
            return '💸💰';
    }
}

// Common interface

