console.clear();

// get current history
nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
console.log("Current history: " + JSON.stringify(nHistoryID));


// get current selection
currentSelection = FormIt.Selection.GetSelections();
console.log("Current selection: " + JSON.stringify(currentSelection));

// run toggle
runAuto = false;

if (runAuto)
{
    // get vertexID of the selection
    nVertexType = WSM.nVertexType;
    nVertexID = currentSelection[0]["ids"][0]["Object"];
    console.log("Vertex ID of current selection: " +  JSON.stringify(nVertexID));

    // define point0
    point0 = WSM.APIGetVertexPoint3dReadOnly(nHistoryID,nVertexID);
    console.log("Point 0 = " + JSON.stringify(point0));

    pointX0 = point0["x"];
    console.log("Point X0 = " + JSON.stringify(pointX0));
    pointY0 = point0["y"];
    console.log("Point Y0 = " + JSON.stringify(pointY0));
    pointZ0 = point0["z"];
    console.log("Point Z0 = " + JSON.stringify(pointZ0));

    // get edges attached to point0
    nEdgeType = WSM.nEdgeType;
    edgeIDArray = WSM.APIGetObjectsByTypeReadOnly(nHistoryID,nVertexID,nEdgeType,true);
    console.log("Edge IDs attached to this vertex: " +  JSON.stringify(edgeIDArray));

    // TODO: throw an error if more than 2 are selected
    numberOfEdges = getEdgeIDs.length;
    console.log("Number of attached edges: " + numberOfEdges);

    // for each edge, get the vertex IDs
    for (i = 0; i <= numberOfEdges - 1; i++)
        {
        nType = WSM.nVertexType;
        getVertexIDs = WSM.APIGetObjectsByTypeReadOnly(nHistoryID,edgeIDArray[i],nType,false);
        console.log("Reading these vertex IDs from edges: " + JSON.stringify(getVertexIDs));
        edgeVertexArray = ["edge" + i]
        edgeIDi = "edgeID" + i;
        }

    edgeIDArray.foreach(getVertexIDs);
}

/*
getCurrentSelectionObjectValue = function(numberOfObjectsSelected) 
{
    for (i = 0; i <= numberOfEdges - 1; i++) 
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

getCurrentSelectionObjectValue(numberOfObjectsSelected);

FormIt.Selection.ClearSelections();*/