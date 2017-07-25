console.clear();

// get current history
nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
console.log("Current history: " + JSON.stringify(nHistoryID));


// get current selection
currentSelection = FormIt.Selection.GetSelections();
console.log("Current selection: " + JSON.stringify(currentSelection));

// get vertexID of the selection
nVertexType = WSM.nVertexType;
nVertexID = currentSelection[0]["ids"][0]["Object"];
console.log("Vertex ID of current selection: " +  JSON.stringify(nVertexID));

// define point0
point0 = WSM.APIGetVertexPoint3dReadOnly(nHistoryID,nVertexID);
console.log("Point 0 = " + JSON.stringify(nVertexID));

// get edges attached to this vertex
nEdgeType = WSM.nEdgeType;
getEdgeIDs = WSM.APIGetObjectsByTypeReadOnly(nHistoryID,nVertexID,nEdgeType,true);
console.log("Edge IDs attached to this vertex: " +  JSON.stringify(getEdgeIDs));


/*// hard-coded for now. TODO: throw an error if more than 2 are selected
numberOfObjectsSelected = 2;

getCurrentSelectionObjectValue = function(numberOfObjectsSelected) 
{
    for (i = 0; i <= numberOfObjectsSelected - 1; i++) 
        {
        currentSelectionObjectValue = currentSelection[i]["ids"][0]["Object"];
        //return currentSelectionObjectValue;
        console.log("Current selection object value for index #" + i + ": " + JSON.stringify(currentSelectionObjectValue));

        // get current EdgeIDs
        nEdgeID = currentSelectionObjectValue;

        // get edge points
        getPoints = WSM.APIGetEdgePointsReadOnly(nHistoryID, nEdgeID);
        console.log("Reading these points from index #" + i + ": " +  JSON.stringify(getPoints));

        // get edge vertex IDs
        nType = WSM.nVertexType;
        getVertexIDs = WSM.APIGetObjectsByTypeReadOnly(nHistoryID,nEdgeID,nType,false);
        console.log("Reading these vertex IDs from index #" + i + ": " +  JSON.stringify(getVertexIDs));


        }

    // test two sets of points to determine if they are equal
    //WSM.Utils.ObjectIDsAreEqual(id1, id2);
}

getCurrentSelectionObjectValue(numberOfObjectsSelected);*/

FormIt.Selection.ClearSelections();