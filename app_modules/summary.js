function summary_setStartDate(startDateInt) {
    let summaryStartDateElement = document.getElementById("summaryStartDate");
    summaryStartDateElement.value = startDateInt.toHTML();
}

function summary_setStartValue(startCurrency) {
    let summaryStartValueElement = document.getElementById("summaryStartValue");
    summaryStartValueElement.value = startCurrency.toHTML();
}

function summary_setFinishDate(finishDateInt) {
    let summaryFinishDateElement = document.getElementById("summaryFinishDate");
    summaryFinishDateElement.value = finishDateInt.toHTML();
}

function summary_setAccruedMonths(accruedMonths) {
    let summaryAccruedMonthsElement = document.getElementById("summaryAccruedMonths");
    summaryAccruedMonthsElement.value = accruedMonths.toString();
}

function summary_setFinishValue(finishCurrency) {
    let summaryFinishValueElement = document.getElementById("summaryFinishValue");
    summaryFinishValueElement.value = finishCurrency.toHTML();
}

function summary_setAccumulatedValue(accumulatedCurrency) {
    let summaryAccumulatedValueElement = document.getElementById("summaryAccumulatedValue");
    summaryAccumulatedValueElement.value = accumulatedCurrency.toHTML();
    summary_setBackgroundColor(accumulatedCurrency);
}

function summary_setBackgroundColor(accumulatedCurrency) {
    let summaryFormElement = document.getElementById('rollup');
    if (accumulatedCurrency.amount > 0)
        summaryFormElement.style.backgroundColor = positiveBackgroundColor;
    else if (accumulatedCurrency.amount < 0)
        summaryFormElement.style.backgroundColor = negativeBackgroundColor;
    else
        summaryFormElement.style.backdropFilter = 'white';
}