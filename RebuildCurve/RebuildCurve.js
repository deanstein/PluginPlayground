deanstein = {};

deanstein.RebuildCurve = function(args)
{

    console.clear();

    // get current history
    var nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    console.log("Current history: " + JSON.stringify(nHistoryID));

    // get current selection
    var currentSelection = FormIt.Selection.GetSelections();
    //console.log("Current selection: " + JSON.stringify(currentSelection));

    // report how many items in the selection
    var currentSelectionLength = currentSelection.length;
    console.log("Number of objects in selection: " + currentSelectionLength);

    if (currentSelection.length === 0)
    {
        console.log("Select a line, arc, circle, or spline to begin.");
        return;
    }

    var typeArray = new Array();
    var nObjectIDArray = new Array();
    var nVertexIDArray = new Array();
    var bIsEdgeTypeArray = new Array();
    var siblingArray = new Array();
    var bIsSameSiblingArray = new Array();
    var arcCircleAnalysisArray = new Array();    
    var bIsOnCircleArray = new Array();
    var bIsOnSplineArray = new Array();

    function getSelectionInfo()
    {

        // for each edge in the selection, get helpful information
        for (var j = 0; j < currentSelection.length; j++)
        {
            // if you're not in the Main History, need to calculate the depth to extract the correct history data
            var historyDepth = (currentSelection[j]["ids"].length) - 1;

            // get objectID of the current selection, then push the results into an array
            var nObjectID = currentSelection[j]["ids"][historyDepth]["Object"];
            //console.log("Selection ID: " + nObjectID);
            nObjectIDArray.push(nObjectID);
            //console.log("ObjectID array: " + nObjectIDArray);

            // get object type of the current selection, then push the results into an array
            var nType =  WSM.APIGetObjectTypeReadOnly(nHistoryID, nObjectID);
            //console.log("Object type: " + nType);
            typeArray.push(nType);
            //console.log("Object type array: " + typeArray);

            // get vertexIDs of the current selection, then push the results into an array
            var nVertexID = WSM.APIGetObjectsByTypeReadOnly(nHistoryID, nObjectID, WSM.nVertexType, false);
            //console.log("nVertex ID: " + nVertexID);
            nVertexIDArray.push(nVertexID);
            //console.log("VertexID array: " + nVertexIDArray);


            function getArcCircleAnalysis() 
            {
                // test selection for arc/circle attributes, then push the results into array
                var arcCircleAnalysis = WSM.APIIsEdgeOnCircleReadOnly(nHistoryID, nObjectID);
                //console.log("Report results of arc/circle analysis: " + JSON.stringify(arcCircleAnalysis));
                var bIsOnCircle = arcCircleAnalysis["bHasCircleAttribute"];
                //console.log("Is selection part of a circle? " + arcCircleAnalysis["bHasCircleAttribute"]);
                bIsOnCircleArray.push(bIsOnCircle);
                arcCircleAnalysisArray.push(arcCircleAnalysis);
                return arcCircleAnalysis;
            }

            var arcCircleAnalysis = getArcCircleAnalysis();

            function getSplineAnalysis()
            {
                // test selection for spline attributes, then push the results into an array
                var splineAnalysis = WSM.APIIsEdgeOnSplineReadOnly(nHistoryID, nObjectID);
                var bIsOnSpline = splineAnalysis["bHasSplineAttribute"];
                bIsOnSplineArray.push(bIsOnSpline);
            }

            var splineAnalysis = getSplineAnalysis();

            // determine which siblings the current edge has, then push the results into an array
            var currentSiblings = "[" + arcCircleAnalysis["aAllCircleSiblings"] + "]";
            //console.log("Current sibling IDs: " + currentSiblings);
            siblingArray.push(currentSiblings);

        }
    }

    getSelectionInfo();

    // define generic function to test each item in the array, compare for equality, and return a new array containing boolean values
    function testForIdentical(array, bArray, message) 
    {
        for (var k = 0; k < array.length - 1; k++)
        {
            if (array[k] === array[k+1])
            {
                bArray.push(true);
            }
            if (array[k] != array[k+1])
            {
                bArray.push(false);
            }
        }
        //console.log(message + bArray);
    }

    // define generic function that returns true only if all booleans evaluated are true
    function booleanReduce(array)
    {
        function isTrue(bool) 
        {
            if (bool === true) 
            {
                return true;
            }
            else 
            {
                return false;
            }
        }
        
        if (array.every(isTrue))
        {
            return true;
        }
        else 
        {
            return false;
        }
    }

    // run pre-checks to determine whether we can proceed with the given selection set
    function preCheck() 
    {
        console.log("\nStart selection precheck... \n");

        // creates an array of boolean values depending on whether the selection contains edges
        function defineValidType()
        {
            // the valid edge type is defined in WSM as the number 7
            var validType = 7;
            for (var m = 0; m < typeArray.length; m++)
            {
                if (typeArray[m] === validType)
                {
                    bIsEdgeTypeArray.push(true);
                }
                else 
                {
                    bIsEdgeTypeArray.push(false);
                }
            }
            //console.log("Is valid array: " + bIsEdgeTypeArray);
        }

        defineValidType();

        // TEST if selection contains only edges
        var bIsSelectionEdgeTypeOnly = booleanReduce(bIsEdgeTypeArray);
        console.log("TEST: Is selection set edges only? " + bIsSelectionEdgeTypeOnly);

        if (bIsSelectionEdgeTypeOnly === false)
        {
            console.log("Can't continue: The selection set contains a mix of objects or incompatible objects. Try selecting only a single curve or line.");
        }

        // run the test for contiguity
        testForIdentical(siblingArray, bIsSameSiblingArray, "Is same sibling results: ");

        // TEST if the selected edges are contiguous
        var bIsSelectionContiguous = booleanReduce(bIsSameSiblingArray);
        console.log("TEST: Is selection set contiguous? " + bIsSelectionContiguous);

        
        if (bIsSelectionContiguous === false)
        {
            console.log("Can't continue: The selection set contains multiple edges. Try selecting only a single curve or line.");
        }

        if (bIsSelectionEdgeTypeOnly && bIsSelectionContiguous) 
        {
            var preCheckPassed = true;
            console.log("\nPrecheck passed! \n");
        }
        else
        {
            var preCheckPassed = false;
            console.log("\nPrecheck failed. \n");
        }

        return preCheckPassed;
        console.log(preCheckPassed);
    }

    var preCheckPassed = preCheck();

    // returns the type of operation to proceed with
    function operationType(preCheckPassed) 
    {
        // TEST if the entire selection has the circle attribute
        var bIsArcCircleType = booleanReduce(bIsOnCircleArray);

        // TEST if the entire selection has the spline attribute
        var bIsSplineType = booleanReduce(bIsOnSplineArray);

        if (bIsArcCircleType === true)
        {
            var operationType = "arcCircle";
        }

        else if (bIsSplineType === true)
        {
            var operationType = "spline";
        }

        else
        {
            var operationType = "line";
        }

        console.log("Operation type: " + operationType);
        return operationType;
    }

    if (preCheckPassed === true)
    {
        var operationType = operationType();
    }

    function rebuildCurve(operationType)
    {
        if (operationType === "arcCircle")
        {
            console.log("\nBegin rebuild of arc or circle...\n");

            // get the first index of the arc/circle analysis, which should be sufficient because we've already proven the arrays are identical by this point
            var arcCircleAnalysis = arcCircleAnalysisArray[0];
            //console.log("Arc/circle analysis to use as reference: " + JSON.stringify(arcCircleAnalysis));

            var edgeCount = currentSelection.length;
            console.log("Edges selected: " + edgeCount);

            // get the ID of the first vertex of the first edge in the arraay
            var arcStartPosID = nVertexIDArray[0][0];
            console.log("Start point vertexID: " + arcStartPosID);

            // get the point3D equivalent
            var arcStartPos = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, arcStartPosID);
            console.log("Start point point3D: " + JSON.stringify(arcStartPos));

            // get the ID of the last vertex of the last edge in the array
            var arcEndPosID = nVertexIDArray[edgeCount - 1][1];
            console.log("End point vertexID: " + arcEndPosID);

            // get the point3D equivalent
            var arcEndPos = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, arcEndPosID);
            console.log("End point point3D: " + JSON.stringify(arcEndPos));

            function getMidPointAtFacetedCurve()
            {
                // check if the current edge count is odd or even, then get the midpoint
                // if the edge count is even, simply take the point that naturally sits at the midpoint of the faceted arc
                if ((edgeCount % 2) === 0)
                {
                    console.log("\nGetting midpoint based on even segment count...\n");
                    var midPointEdgeIndex = edgeCount / 2 - 1;
                    var midPointID = nVertexIDArray[midPointEdgeIndex][1];
                    var midPointAtFacetedCurve = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, midPointID);
                    console.log("Midpoint based on even segment count: " + JSON.stringify(midPointAtFacetedCurve));
                }
                // or if the edge count is odd, calculate the midpoint of the middle segment
                else
                {
                    console.log("\nGetting midpoint based on odd segment count...\n");
                    var midPointEdgeIndex = Math.ceil(edgeCount / 2 - 1);
                    console.log("midPointEdgeIndex: " + midPointEdgeIndex);

                    // get the first point on the midpoint edge
                    var midPointEdgePoint0ID = nVertexIDArray[midPointEdgeIndex][0];
                    var midPointEdgePoint0 = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, midPointEdgePoint0ID);
                    var midPointEdgePoint0x = midPointEdgePoint0["x"];
                    var midPointEdgePoint0y = midPointEdgePoint0["y"];
                    var midPointEdgePoint0z = midPointEdgePoint0["z"];

                    // get the last point on the midpoint edge
                    var midPointEdgePoint1ID = nVertexIDArray[midPointEdgeIndex][1];
                    var midPointEdgePoint1 = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, midPointEdgePoint1ID);
                    var midPointEdgePoint1x = midPointEdgePoint1["x"];
                    var midPointEdgePoint1y = midPointEdgePoint1["y"];
                    var midPointEdgePoint1z = midPointEdgePoint1["z"];
                    //console.log("Got an x value?" + midPointEdgePoint1x);

                    // generic function to get the midpoint between two points defined by an array [x,y,z]
                    function getMidPointBetweenTwoPoints(x0,y0,z0, x1,y1,z1)
                    {
                        var x = (x0 + x1) / 2;
                        var y = (y0 + y1) / 2;
                        var z = (z0 + z1) / 2;

                        var midPoint = new Array(x, y, z);
                        // returns [x,y,z]
                        return midPoint;
                        console.log(midPoint);
                    }

                    var midPoint = getMidPointBetweenTwoPoints(midPointEdgePoint0x, midPointEdgePoint0y, midPointEdgePoint0z, midPointEdgePoint1x, midPointEdgePoint1y, midPointEdgePoint1z);
                    var midPointAtFacetedCurve =  WSM.Geom.Point3d(midPoint[0], midPoint[1], midPoint[2]);
                    
                    // optionally draw a debug vertex that will appear when the midpoint is not coincident with the new curve
                    var drawDebugPoint = false;
                    if (drawDebugPoint === true)
                    {
                        WSM.APICreateVertex(nHistoryID, midPointAtFacetedCurve);

                    }
                    console.log("Midpoint based on odd segment count: " + JSON.stringify(midPointAtFacetedCurve));

                }
                return midPointAtFacetedCurve;
                console.log("Midpoint at faceted curve: " + JSON.stringify(midPointAtFacetedCurve));
            }

            var midPointAtFacetedCurve = getMidPointAtFacetedCurve();

            var accuracyORcount = args.facetCount;
            var bReadOnly = false;
            var trans;
            var nMinimumNumberOfFacets = accuracyORcount;

            // var radius = arcCircleAnalysis["radius"];
            // console.log("Radius of circle: " + JSON.stringify(radius));
            // var pi = 3.1415926535897932384626433832795;
            // var circumference = radius * 2 * pi;
            // console.log("Circumference of circle: " + JSON.stringify(circumference));

            // if delete is checked, delete the original edges
            var bDelete = true;
            for (var n = 0; n < nObjectIDArray.length; n++)
            {
                if (bDelete === true) 
                {
                    WSM.APIDeleteObject(nHistoryID, nObjectIDArray[n]);
                }
            }

            // execute the rebuild
            WSM.APICreateCircleOrArcFromPoints(nHistoryID, arcStartPos, arcEndPos, midPointAtFacetedCurve, accuracyORcount, bReadOnly, trans, nMinimumNumberOfFacets);
            console.log("\nCreated a new curve.");

        }
        else if (operationType === "spline")
        {
            console.log("\nRebuilding splines is not yet supported.");
        }
        else if (operationType === "line")
        {
            console.log("\nRebuilding lines is not yet supported");
        }
    }

    FormIt.UndoManagement.BeginState();

    // execute the rebuild
    rebuildCurve(operationType);

    FormIt.UndoManagement.EndState("Rebuild Curve");

}



deanstein.ExplodeCurve = function()
{

    FormIt.UndoManagement.BeginState();

    console.clear();
    
    // get current history
    var nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    console.log("Current history: " + JSON.stringify(nHistoryID));

    // get current selection
    var currentSelection = FormIt.Selection.GetSelections();
    //console.log("Current selection: " + JSON.stringify(currentSelection));

    // report how many items in the selection
    var currentSelectionLength = currentSelection.length;
    console.log("Number of objects in selection: " + currentSelectionLength);

    if (currentSelection.length === 0)
    {
        console.log("Select a line, arc, circle, or spline to explode.");
        return;
    }

    // for each edge in the selection, get the vertexIDs and mark them not smooth
    for (var e = 0; e < currentSelection.length; e++)
    {
        // if you're not in the Main History, need to calculate the depth to extract the correct history data
        var historyDepth = (currentSelection[e]["ids"].length) - 1;

        var nObjectID = currentSelection[e]["ids"][historyDepth]["Object"];

        // get vertexIDs of the current selection, then push the results into an array
        var nVertexID = WSM.APIGetObjectsByTypeReadOnly(nHistoryID, nObjectID, WSM.nVertexType, false);
        console.log("nVertex ID: " + nVertexID);

        WSM.APISetEdgesOrVerticesMarkedSmooth(nHistoryID, nVertexID, false);
    }
    console.log("Exploded the curve.");

    FormIt.UndoManagement.EndState("Explode Curve");
}



deanstein.CreateArcCircle = function(args)
{
    var edgeLength = args.edgeLength;
    var facetCount = args.facetCount;
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
    "edgeLength": parseFloat(document.a.edgeLength.value),
    "facetCount": parseFloat(document.a.facetCount.value)
    }

    console.log("deanstein.RebuildCurve");
    console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the function
    // defined above with the given args.  This is needed to communicate
    // between the web JS enging process and the FormIt process.
    window.FormItInterface.CallMethod("deanstein.RebuildCurve", args);
}

deanstein.SubmitExplode = function(argsExplode)
{

    var argsExplode =
    {

    }
    console.log("deanstein.RebuildCurve");
    console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the function
    // defined above with the given args.  This is needed to communicate
    // between the web JS enging process and the FormIt process.
    window.FormItInterface.CallMethod("deanstein.ExplodeCurve", argsExplode);
}