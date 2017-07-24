console.clear();

// get current history
nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
console.log("Current history, raw: " + JSON.stringify(nHistoryID));


// get current selection
currentSelection = FormIt.Selection.GetSelections();
console.log("Current selection, raw: " + JSON.stringify(currentSelection));

numberOfObjectsSelected = 2;

getCurrentSelectionObjectValue = function(numberOfObjectsSelected) 
{
    for (i = 0; i <= numberOfObjectsSelected - 1; i++) 
        {
        currentSelectionObjectValue = currentSelection[i]["ids"][0]["Object"];
        //return currentSelectionObjectValue;
        console.log("Current selection #" + i + " index's objeect value: " + JSON.stringify(currentSelectionObjectValue));

        // get current EdgeIDs
        nEdgeID = currentSelectionObjectValue;

        // get edge points, start point first
        getPoints = WSM.APIGetEdgePointsReadOnly(nHistoryID, nEdgeID);
        console.log("Reading these points from index #" + i + JSON.stringify(getPoints));
        }
}

getCurrentSelectionObjectValue(numberOfObjectsSelected);



FormIt.Selection.ClearSelections();