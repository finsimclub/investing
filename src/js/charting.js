const stackedBarChartConfig = {
    type: 'bar',
    data: null,
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Financial Simulation Charted'
        },
      },
      responsive: true,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true
        }
      }
    }
  };

const stackedBarChartData = {
    labels: '',
    datasets: []
};

const stackedBarChartDataSet = {
    label: null,
    data: null
 };

const assetStackedBarChartExclusions = ['monthlyExpense', 'monthlyIncome'];

const lineChartConfig = {
  type: 'line',
  data: null,
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Cash Flow Chart'
      }
    }
  },
};

const lineChartData = {
  labels: '',
  datasets: []
};

const lineChartDataSet = {
  label: null,
  data: null
  //borderColor: Utils.CHART_COLORS.red,
  //backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
};

const flowLineChartExclusions = ['home','mortgage'];

var charting_jsonAssetsChartData = null;
var charting_jsonFlowsChartData = null;

function charting_buildMonthsSpan(firstDateInt, lastDateInt) {
  let totalMonths = util_totalMonths(firstDateInt, lastDateInt);
  let combineMonths = 1;
  let offsetMonths = 0;
  if (totalMonths > 36 && totalMonths <= 96) {
    combineMonths = 3;
    if (firstDateInt.month == 2 || firstDateInt.month == 5 || firstDateInt.month == 8 || firstDateInt.month == 11)
      offsetMonths = 2;
    else if (firstDateInt.month == 3 || firstDateInt.month == 6 || firstDateInt.month == 9 || firstDateInt.month == 12)
      offsetMonths = 1;
  }
  else if (totalMonths > 96 && totalMonths <= 264) {
    combineMonths = 6;
    if (firstDateInt.month > 1 && firstDateInt.month < 7)
      offsetMonths = 7 - firstDateInt.month;
    else (firstDateInt.month > 7 && firstDateInt.month < 13)
      offsetMonths = 13 - firstDateInt.month;
  }
  else if (totalMonths > 264) {
    combineMonths = 12;
    if (firstDateInt.month > 1)
      offsetMonths = 13 - firstDateInt.month;
  }

  return new MonthsSpan(totalMonths, combineMonths, offsetMonths);
}

function charting_buildDisplayData(firstDateInt, lastDateInt, modelAssets) {
    let monthsSpan = charting_buildMonthsSpan(firstDateInt, lastDateInt);
    for (modelAsset of modelAssets) {
      modelAsset.monthlyAssetDataToDisplayAssetData(monthsSpan);
      modelAsset.monthlyFlowDataToDisplayFlowData(monthsSpan);
    }    
}

function charting_buildDisplayLabels(firstDateInt, lastDateInt) {
  let monthsSpan = charting_buildMonthsSpan(firstDateInt, lastDateInt);
  let runnerDateInt = new DateInt(firstDateInt.toInt());
  runnerDateInt.addMonths(monthsSpan.offsetMonths);
  let labels = [];
  while (runnerDateInt.toInt() <= lastDateInt.toInt()) {
    let label = '';
    
    if (monthsSpan.combineMonths == 3) {
      if (runnerDateInt.month == 1) {
        label = 'Q1 ';
      }
      else if (runnerDateInt.month == 4) {
        label = 'Q2 ';
      }
      else if (runnerDateInt.month == 7) {
        label = 'Q3 '; 
      }
      else {
        console.assert(runnerDateInt.month == 10, 'runnerDateInt.month != 10 for Q4');
        label = 'Q4 ';
      }
      label += runnerDateInt.year.toString();
    }
    
    else if (monthsSpan.combineMonths == 6) {
      if (runnerDateInt.month == 1) {
        label = 'H1 ';
      }
      else {
        console.assert(runnerDateInt.month == 7, 'runnerDateInt.month != 7 for H2');
        label = 'H2 ';
      }
      label += runnerDateInt.year.toString();
    }
    
    else if (monthsSpan.combineMonths == 12) {
      console.assert(runnerDateInt.month == 1, 'runnerDateInt.month != 1 for Y');
      label = (runnerDateInt.year -1).toString();
    }

    else { // monthsSpan.combineMonths == 1
      console.assert(monthsSpan.combineMonths == 1, 'monthsSpan.combineMonths != 1 for Monthly');
      label = runnerDateInt.toString();
    }

    labels.push(label);      

    runnerDateInt.addMonths(monthsSpan.combineMonths);
  }

  return labels;
}

function charting_buildDisplayAssetsFromModelAssets(firstDateInt, lastDateInt, modelAssets) {
  if (firstDateInt == null) {
    console.log('charting_buildDisplayAssetsFromModelAssets - null firstDateInt provided');
    return null;
  }  
  else if (lastDateInt == null) {
    console.log('charting_buildDisplayAssetsFromModelAssets - null lastDateInt provided');
    return null;
  }
  
  let chartingAssetConfig = JSON.parse(JSON.stringify(stackedBarChartConfig));
  let chartingAssetData = JSON.parse(JSON.stringify(stackedBarChartData));

  let labels = charting_buildDisplayLabels(firstDateInt, lastDateInt);
  chartingAssetData.labels = labels;

    for (const modelAsset of modelAssets) {
        if (assetStackedBarChartExclusions.includes(modelAsset.instrument))
            continue;

        let chartingAssetDataSet = JSON.parse(JSON.stringify(stackedBarChartDataSet));

        chartingAssetDataSet.label = modelAsset.displayName;
        chartingAssetDataSet.data = modelAsset.displayAssetData;
        if (highlightDisplayName != null) {
            if (highlightDisplayName == modelAsset.displayName)
                chartingAssetDataSet.backgroundColor = colorRange[modelAsset.colorId];
            else
                chartingAssetDataSet.backgroundColor = 'whitesmoke'; 
        }
        else {
          chartingAssetDataSet.backgroundColor = colorRange[modelAsset.colorId];       
        }
        chartingAssetData.datasets.push(chartingAssetDataSet);
    }

    chartingAssetConfig.data = chartingAssetData;
    return chartingAssetConfig;
}

function charting_buildDisplayFlowsFromModelAssets(firstDateInt, lastDateInt, modelAssets) {
  if (firstDateInt == null) {
    console.log('charting_buildDisplayFlowsFromModelAssets - null firstDateInt provided');
    return null;
  }  
  else if (lastDateInt == null) {
    console.log('charting_buildDisplayFlowsFromModelAssets - null lastDateInt provided');
    return null;
  }
  
  let chartingFlowConfig = JSON.parse(JSON.stringify(lineChartConfig));    
  let chartingFlowData = JSON.parse(JSON.stringify(lineChartData));
  
  let labels = charting_buildDisplayLabels(firstDateInt, lastDateInt);
  chartingFlowData.labels = labels;

  let colorId = 0;
  for (const modelAsset of modelAssets) {
    if (flowLineChartExclusions.includes(modelAsset.instrument))
      continue;

      let chartingFlowDataSet = JSON.parse(JSON.stringify(lineChartDataSet));

      chartingFlowDataSet.label = modelAsset.displayName;
      chartingFlowDataSet.data = modelAsset.displayFlowData;
      if (highlightDisplayName != null) {
          if (highlightDisplayName == modelAsset.displayName)
              chartingFlowDataSet.backgroundColor = colorRange[modelAsset.colorId];
          else
              chartingFlowDataSet.backgroundColor = 'whitesmoke'; 
      }
      else {
        chartingFlowDataSet.backgroundColor = colorRange[modelAsset.colorId];       
      }
      chartingFlowData.datasets.push(chartingFlowDataSet);
  }

  chartingFlowConfig.data = chartingFlowData;
  return chartingFlowConfig;
}

function charting_buildFromModelAssets(modelAssets) {
  if (modelAssets == null || modelAssets.length == 0) {
    console.log('charting_buildFromModelAssets - null or zero length array provided');
    return null;
  }
 
  let firstDateInt = util_firstDateInt(modelAssets);
  let lastDateInt = util_lastDateInt(modelAssets);

  charting_buildDisplayData(firstDateInt, lastDateInt, modelAssets);

  charting_jsonAssetsChartData = charting_buildDisplayAssetsFromModelAssets(firstDateInt, lastDateInt, modelAssets);
  charting_jsonFlowsChartData = charting_buildDisplayFlowsFromModelAssets(firstDateInt, lastDateInt, modelAssets);
}