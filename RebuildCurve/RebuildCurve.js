deanstein = {};

deanstein.RebuildCurve = function(args)
{

    console.clear();

    // get current history
    var nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    console.log("Current history: " + JSON.stringify(nHistoryID));

    // get current selection
    var currentSelection = FormIt.Selection.GetSelections();
    // console.log("Current selection: " + JSON.stringify(currentSelection));

    // report how many items in the selection
    var currentSelectionLength = currentSelection.length;
    console.log("Number of objects in selection: " + currentSelectionLength);

    if (currentSelection.length === 0)
    {
        console.log("\nSelect a line, arc, circle, or spline to begin.");
        return;
    }

    var typeArray = [];
    var nObjectIDArray = [];
    var nVertexIDArray = [];
    var point3DArray = [];
    var bIsEdgeTypeArray = [];
    var edgeLengthArray = [];
    var siblingArray = [];
    var bIsSameSiblingArray = [];
    var arcCircleAnalysisArray = [];
    var bIsOnCircleArray = [];
    var bIsOnSplineArray = [];

    function getSelectionInfo()
    {

        // for each edge in the selection, get info
        for (var j = 0; j < currentSelection.length; j++)
        {
            // if you're not in the Main History, calculate the depth to extract the correct history data
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
            var nVertexIDSet = WSM.APIGetObjectsByTypeReadOnly(nHistoryID, nObjectID, WSM.nVertexType, false);
            //console.log("nVertex ID: " + nVertexIDSet);
            nVertexIDArray.push(nVertexIDSet);
            //console.log("VertexID array: " + nVertexIDArray);

            // convert vertexIDs on each end of the line to point3Ds, then push the results into an array
            var point3D0 = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, nVertexIDArray[j][0]);
            var point3D1 = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, nVertexIDArray[j][1]);
            point3DArray.push(point3D0);
            point3DArray.push(point3D1);
            //console.log("Point3D array: " + JSON.stringify(point3DArray));


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

        // check if all required tests pass
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
            var facetCount = args.facetCount;
            function rebuildArcCircle(facetCount)
            {
                console.log("\nBegin rebuild of arc or circle...\n");

                // get the first index of the arc/circle analysis, which should be sufficient because we've already proven the arrays are identical by this point
                var arcCircleAnalysis = arcCircleAnalysisArray[0];
                //console.log("Arc/circle analysis to use as reference: " + JSON.stringify(arcCircleAnalysis));

                var edgeCount = currentSelection.length;
                console.log("Edges selected: " + edgeCount);

                // flatten the array of Vertex IDs so they're not organized in sets for each edge
                function flatten(nVertexIDArray) 
                {
                    return nVertexIDArray.reduce(function (flat, toFlatten) 
                    {
                        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
                    }, []);
                }

                var nVertexIDArrayFlattened = flatten(nVertexIDArray);
                //console.log("Flattened nVertexID array: " + nVertexIDArrayFlattened);

                var nVertexIDUniqueArray = [];
                var count = 0;
                
                // in the flattened vertex array, determine which values are unique (representing the end points of the arc)
                for (var i = 0; i < nVertexIDArrayFlattened.length; i++)
                {
                    count = 0;
                    for (var j = 0; j < nVertexIDArrayFlattened.length; j++)
                    {
                        if (nVertexIDArrayFlattened[j] === nVertexIDArrayFlattened[i])
                            count++;
                    }
                    if (count === 1)
                        nVertexIDUniqueArray.push(nVertexIDArrayFlattened[i]);
                }
                //console.log("Array of unique vertex IDs: " + nVertexIDUniqueArray);


                // get the ID of the first vertex of the first edge in the arraay
                var arcStartPosID = nVertexIDUniqueArray[0];
                console.log("Start point vertexID: " + arcStartPosID);

                // get the point3D equivalent
                var arcStartPos = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, arcStartPosID);
                console.log("Start point point3D: " + JSON.stringify(arcStartPos));

                // get the ID of the last vertex of the last edge in the array
                var arcEndPosID = nVertexIDUniqueArray[1];
                console.log("End point vertexID: " + arcEndPosID);

                // get the point3D equivalent
                var arcEndPos = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, arcEndPosID);
                console.log("End point point 3D: " + JSON.stringify(arcEndPos));

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

                // // get the third point: a point on or near the midpoint of the arc, at a segment vertex
                // var thirdPointID = nVertexIDArray[Math.ceil(edgeCount / 2)][0];
                // console.log("Third point vertexID: " + JSON.stringify(thirdPointID));

                // // get the point3D equivalent
                // var thirdPointPos = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, thirdPointID);
                // console.log("Third point 3D: " + JSON.stringify(thirdPointPos));

                var radius = arcCircleAnalysis["radius"];
                console.log("Radius of circle: " + JSON.stringify(radius));
                
                var pi = 3.1415926535897932384626433832795;
                var circumference = radius * 2 * pi;
                console.log("Circumference of circle: " + JSON.stringify(circumference));

                function getFacetedArcLength(point3DArray)
                {
                    console.log("\nGetting arc or circle length...\n")
                    // for each edge, measure the distance between the two points
                    for(var p = 0; p < nVertexIDArray.length * 2; p++)
                    {
                        var x0 = point3DArray[p]["x"];
                        var x1 = point3DArray[p + 1]["x"];
                        //console.log("x0 = " + x0 + " and x1 = " + x1);

                        var y0 = point3DArray[p]["y"];
                        var y1 = point3DArray[p + 1]["y"];
                        //console.log("y0 = " + y0 + " and y1 = " + y1);

                        var z0 = point3DArray[p]["z"];
                        var z1 = point3DArray[p + 1]["z"];
                        //console.log("z0 = " + z0 + " and z1 = " + z1);

                        //generic function to get the distance between two points [x,y,z]
                        function getDistanceBetweenTwoPoints(x0,y0,z0, x1,y1,z1)
                        {
                            var distance = Math.sqrt((Math.pow((x1-x0),2)) + (Math.pow((y1-y0),2)) + (Math.pow((z1-z0),2)));
                            //console.log("Distance: " + distance);
                            return distance;
                        }
                        var distanceBetweenTwoPoints = getDistanceBetweenTwoPoints(x0,y0,z0,x1,y1,z1);
                        edgeLengthArray.push(distanceBetweenTwoPoints);
                        //console.log("Edge length array: " + edgeLengthArray);

                        // since each point3D is in a set of 2 (for each end of each line), increase the for variable again
                        p = p + 1;
                    }
                    //console.log("Edge length array: " + edgeLengthArray);

                    var facetedArcLength = 0;

                    for (q = 0; q < edgeLengthArray.length; q++)
                    {
                        var facetedArcLength = facetedArcLength + edgeLengthArray[q];
                    }
                    console.log("Number of edges used to calculate length: " + edgeLengthArray.length);
                    console.log("Existing arc length: " + facetedArcLength);
                    return facetedArcLength;
                }

                var facetedArcLength = getFacetedArcLength(point3DArray);

                var quarterCircleLength = circumference / 4;

                // determine how many quarter-circles this faceted arc represents
                var quarterCircleMultiplier = facetedArcLength / quarterCircleLength;
                console.log("Quarter circle multiplier: " + quarterCircleMultiplier);

                // Number of facets in each 90 degree arc segment; if circle, 4x this amount
                //var accuracyORcount = (quarterCircleMultiplier / 0.25) * (args.facetCount);
                var accuracyORcount = Math.floor(args.facetCount / quarterCircleMultiplier);
                console.log("Effective accuracyORcount: " + accuracyORcount);
                var bReadOnly = false;
                var trans;
                var nMinimumNumberOfFacets = 0;

                // if delete is checked, delete the original edges
                var bDelete = true;
                for (var n = 0; n < nObjectIDArray.length; n++)
                {
                    if (bDelete === true) 
                    {
                        WSM.APIDeleteObject(nHistoryID, nObjectIDArray[n]);
                    }
                }

                if (bDelete === true)
                {
                    console.log("\nDeleted the old curve.");
                }

                // execute the rebuild
                WSM.APICreateCircleOrArcFromPoints(nHistoryID, arcStartPos, arcEndPos, midPointAtFacetedCurve, accuracyORcount, bReadOnly, trans, nMinimumNumberOfFacets);

                // find the geometry that was changed so it can be highlighted and checked
                var changedData = WSM.APIGetCreatedChangedAndDeletedInActiveDeltaReadOnly(nHistoryID, 7);
                //console.log("Changed data : " + JSON.stringify(changedData));

                var newEdgeIDs = changedData["created"];

                // // add the new edges to the selection
                // var newObjectIDArray = {};
 
                // for (var r = 0; r < newEdgeIDs.length; r++)
                // {
                //     newObjectIDArray.History = nHistoryID;
                //     newObjectIDArray.Object = newEdgeIDs[r];
                //     newObjectIDArray.objectName = "ObjectHistoryID";
                //     console.log(JSON.stringify(newObjectIDArray));
                //     FormIt.Selection.AddSelections(newEdgeIDs[r], newObjectIDArray);
                //     console.log("newEdgeIDs at this index: " + newEdgeIDs[r]);
                // }

                var newFacetCount = newEdgeIDs.length;
                //console.log("New edge IDs: " + newEdgeIDs);
                console.log("\nCreated a new curve with " + newFacetCount + " faceted edges.");

                return newFacetCount;
            }

            FormIt.UndoManagement.BeginState();

            newFacetCount = rebuildArcCircle(facetCount);

            FormIt.UndoManagement.EndState("Rebuild Arc/Circle");

            // if the new facet count doesn't match the specified count, re-do the operation with a modified facet count
            if (newFacetCount != facetCount)
            {
                var facetDelta = facetCount - newFacetCount;
                console.log("\nThe resulting facet count deviated from the specified amount. In the future, this will be handled better.");
                //facetCount = facetCount + facetDelta;

                //FormIt.UndoManagement.Undo(nHistoryID);              
                //rebuildArcCircle(facetCount);
            }

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

    // execute the rebuild
    rebuildCurve(operationType);

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
        var edgeCount = currentSelection.length;

        // if you're not in the Main History, need to calculate the depth to extract the correct history data
        var historyDepth = (currentSelection[e]["ids"].length) - 1;

        var nObjectID = currentSelection[e]["ids"][historyDepth]["Object"];

        // get vertexIDs of the current selection, then push the results into an array
        var nVertexID = WSM.APIGetObjectsByTypeReadOnly(nHistoryID, nObjectID, WSM.nVertexType, false);
        //console.log("nVertex ID: " + nVertexID);

        WSM.APISetEdgesOrVerticesMarkedSmooth(nHistoryID, nVertexID, false);
    }
    console.log("\nExploded the curve into " + edgeCount + " discrete edges.");

    FormIt.UndoManagement.EndState("Explode Curve");
}



// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
deanstein.Submit = function()
{
    var args = 
    {
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