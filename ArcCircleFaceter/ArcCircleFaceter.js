deanstein = {};

deanstein.RebuildArcCircle = function(args)
{

    console.clear();

    // get current history
    var nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    console.log("Current history: " + JSON.stringify(nHistoryID));

    // get current selection
    var currentSelection = FormIt.Selection.GetSelections();
    console.log("Current selection: " + JSON.stringify(currentSelection));
    
    // create a new array to store the vertices in
    var vertexArray = new Array();

    FormIt.UndoManagement.BeginState();
    // for each object selected, get the vertexIDs
    for (var j = 0; j < currentSelection.length; j++)
    {
        // if you're not in the Main History, need to calculate the depth to extract the correct history data
        var historyDepth = (currentSelection[j]["ids"].length) - 1;

        // get objectID of the current selection
        var nObjectID = currentSelection[j]["ids"][historyDepth]["Object"];

        // get the owner of the selection
        var selectionOwner = WSM.APIGetTopLevelOwnersReadOnly(nHistoryID,nObjectID);
        console.log("Selection owner: " + JSON.stringify(selectionOwner[0]));

        // // get the attributes of the selection
        // var selectionAttributes = WSM.APIGetObjectAttributesReadOnly(nHistoryID, selectionOwner[0]);
        // console.log("Selection attributes: " + JSON.stringify(selectionAttributes));

        // get vertexIDs in the current selection
        var nVertexIDs = WSM.APIGetObjectsByTypeReadOnly(nHistoryID,nObjectID,WSM.nVertexType,false);
        for (var i = 0; i < nVertexIDs.length; i++)
        {
            var nVertexID = nVertexIDs[i];
            vertexArray.push(nVertexID);
        }

    }

    console.log("Vertex array: " +  JSON.stringify(vertexArray));

    FormIt.UndoManagement.EndState("Rebuild Curve");

}

deanstein.CreateArcCircle = function(args)
{
    var radius = args.radius;
    var posCenter = args.posCenter;
    var arcLengthParameter = args.arcLengthParameter;
    var edgeLength = args.edgeLength;
    console.clear();

    // Get the current history
    var nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    console.log("Current history: " + nHistoryID);

    // USER: set radius
    //var radius = 50;

    // split the input string
    var posCenterSplit = posCenter.split(',');
    console.log("posCenterSplit: " + posCenterSplit[0]);

    // USER: optionally set origin
    //var posCenter = "10,10,10";
    var posCenterPoint = WSM.Geom.Point3d(parseFloat(posCenterSplit[0]),parseFloat(posCenterSplit[1]),parseFloat(posCenterSplit[2]));
    //console.log("posCenter = " + posCenter);

    var xAxis = WSM.Geom.Vector3d(1,0,0);
    var yAxis = WSM.Geom.Vector3d(0,1,0);
    var dStartParam = 0;

    // USER: set arc length out of 1. 0.25 = quarter circle, 0.5 = half circle, 1.0 = circle
    //var arcLengthParameter = 0.5;
    var arcLengthParameterPercentage = arcLengthParameter * 100;

    // USER: set desired edge length for faceting
    //var edgeLength = 3;

    var pi = 3.1415926535897932384626433832795;
    var circumference = radius * 2 * pi;
    var effectiveArcLength = circumference * arcLengthParameter;
    var dEndParam = arcLengthParameter * (2 * pi);

    // Number of facets in each 90 degree arc segment; if circle, 4x this amount
    var accuracyORcount = Math.ceil(circumference / (4 * edgeLength));
    var numberOfFacets = (arcLengthParameter / 0.25) * (accuracyORcount);

    // Report what was created
    console.log("Created an arc representing " + arcLengthParameterPercentage.toFixed(2) + "% of a circle with radius of " + radius + ", arc length of " + effectiveArcLength.toFixed(2) + ", and " + numberOfFacets + " facets inside History ID " + nHistoryID + ".");

    WSM.APICreateCircleOrArc(nHistoryID, radius, posCenterPoint, xAxis, yAxis, dStartParam, dEndParam, accuracyORcount);
}

// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
deanstein.Submit = function()
{
    var args = 
    {
    "radius": parseFloat(document.a.radius.value),
    "posCenter": document.a.posCenter.value,
    "arcLengthParameter": parseFloat(document.a.arcLengthParameter.value),
    "edgeLength": parseFloat(document.a.edgeLength.value)
    }

    console.log("deanstein.RebuildArcCircle");
    console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the function
    // defined above with the given args.  This is needed to communicate
    // between the web JS enging process and the FormIt process.
    window.FormItInterface.CallMethod("deanstein.RebuildArcCircle", args);
}