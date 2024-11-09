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

const stackedChartingData = {
    labels: '',
    datasets: []
};

const stackedChartingDataSet = {
    label: null,
    data: null
    //backgroundColor: 0x000011
 };

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
      modelAsset.monthlyDataToDisplayData(monthsSpan);
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

function charting_buildFromModelAssets(modelAssets) {
    if (modelAssets == null || modelAssets.length == 0)
      return null;
    
    let chartingConfig = JSON.parse(JSON.stringify(stackedBarChartConfig));    
    let chartingData = JSON.parse(JSON.stringify(stackedChartingData));

    let firstDateInt = util_firstDateInt(modelAssets);
    let lastDateInt = util_lastDateInt(modelAssets);
    charting_buildDisplayData(firstDateInt, lastDateInt, modelAssets); // stored as modelAsset.displayData

    let labels = charting_buildDisplayLabels(firstDateInt, lastDateInt);
    chartingData.labels = labels;

    let colorId = 0;
    for (const modelAsset of modelAssets) {
        let chartingDataSet = JSON.parse(JSON.stringify(stackedChartingDataSet));
        chartingDataSet.label = modelAsset.displayName;
        chartingDataSet.data = modelAsset.displayData;
        if (highlightDisplayName != null) {
            if (highlightDisplayName == modelAsset.displayName)
                chartingDataSet.backgroundColor = colorRange[modelAsset.colorId];
            else
                chartingDataSet.backgroundColor = 'whitesmoke'; 
        }
        else {
          chartingDataSet.backgroundColor = colorRange[modelAsset.colorId];       
        }
        chartingData.datasets.push(chartingDataSet);
    }

    chartingConfig.data = chartingData;
    return chartingConfig;
}