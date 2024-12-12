function chronometer_applyMonths(modelAssets) {
    if (modelAssets != null && modelAssets.length > 0) {
        for (modelAsset of modelAssets) {
            modelAsset.startMonth();
        }

        const firstDateInt = util_firstDateInt(modelAssets);
        const lastDateInt = util_lastDateInt(modelAssets);

        summary_setStartDate(firstDateInt);
        summary_setFinishDate(lastDateInt);
        let totalMonths = 0;

        let currentDateInt = new DateInt(firstDateInt.toInt());
        while (currentDateInt.toInt() <= lastDateInt.toInt()) {
            totalMonths += chronometer_applyMonth(currentDateInt, modelAssets);
            currentDateInt.next();
        }

        summary_setAccruedMonths(totalMonths);
        summary_computeCAGR()
    }
}

function chronometer_applyMonth(currentDateInt, modelAssets) {
    let startTotal = new Currency(0.0);
    let finishTotal = new Currency(0.0);
    let accumulatedValue = new Currency(0.0);
    let totalMonths = 0;

    for (const modelAsset of modelAssets) {
        if (modelAsset.applyMonth(currentDateInt)) {
            startTotal.add(modelAsset.startCurrency);        
            finishTotal.add(modelAsset.finishCurrency);
            accumulatedValue.add(modelAsset.accumulatedCurrency);
            ++totalMonths;
        }
    };

    for (const modelAsset of modelAssets) {
        if (isMonthlyExpense(modelAsset.instrument) || isMonthlyIncome(modelAsset.instrument)) {
            if (modelAsset.inMonth(currentDateInt)) {
                let fundingSourceAsset = findModelAssetByDisplayName(modelAssets, modelAsset.fundingSource);
                if (fundingSourceAsset) {
                    fundingSourceAsset.finishCurrency.add(modelAsset.finishCurrency);
                }
            }
        }
    }

    summary_setStartValue(startTotal);
    summary_setFinishValue(finishTotal);  
    summary_setAccumulatedValue(accumulatedValue);

    return totalMonths;
}