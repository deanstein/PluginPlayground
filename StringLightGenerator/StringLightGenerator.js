if (typeof deanstein == 'undefined')
{
    deanstein = {};
}

deanstein.GenerateStringLights = function(args)
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
        console.log("\nSelect a line or series of lines to begin.");
        return;
    }

    var typeArray = new Array();
    var nObjectIDArray = new Array();
    var nVertexIDArray = new Array();
    var point3DArray = new Array();
    var bIsEdgeTypeArray = new Array();
    var edgeLengthArray = new Array();
    var arcCircleAnalysisArray = new Array();    
    var bIsOnCircleArray = new Array();
    var bIsOnSplineArray = new Array();
    var siblingArray = new Array();

    // generic function to gather data about the selection and store it in arrays
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

    // execute the get selection routine
    getSelectionInfo();

    // generic function to test each item in the array, compare for equality, and return a new array containing boolean values
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

    // generic function that returns true only if all booleans evaluated are true
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
            console.log("Can't continue: The selection set contains a mix of objects or incompatible objects. Try selecting only curves or lines.");
        }

        // check if all required tests pass
        if (bIsSelectionEdgeTypeOnly) 
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

    // precheck must pass to continue
    var preCheckPassed = preCheck();

    // define how to determine the type of operation to proceed with
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

    // if we prechecked, then define the operation type
    if (preCheckPassed === true)
    {
        var operationType = operationType();
    }

    // if the operation type is a line, we first need to make an arc from scratch
    if (operationType === "line") 
    {
        console.log("\nLine detected.");

        function createCatenaryArcFromLine() 
        {
            console.log("\nCreating a catenary arc from line");
            var arcStartPos = point3DArray[0];
            console.log("Arc start point: " + JSON.stringify(arcStartPos));

            var arcEndPos = point3DArray[1];
            console.log("Arc end point: " + JSON.stringify(arcEndPos));

            var x0 = arcStartPos["x"];
            var y0 = arcStartPos["y"];
            var z0 = arcStartPos["z"];

            var x1 = arcEndPos["x"];
            var y1 = arcEndPos["y"];
            var z1 = arcEndPos["z"];

            // define how to get the midpoint between two points defined by an array [x,y,z]
            function getMidPointBetweenTwoPoints(x0,y0,z0, x1,y1,z1)
            {
                var arcBulge = args.arcBulge;

                // assume gravity is down, and move the two endpoints down by that amount for the purposes of getting a lower midpoint representing the max bulge
                var z0 = z0 - arcBulge;
                var z1 = z1 - arcBulge;

                var x = (x0 + x1) / 2;
                var y = (y0 + y1) / 2;
                var z = (z0 + z1) / 2;

                var midPoint = new Array(x, y, z);
                // returns [x,y,z]
                console.log("Midpoint: " + midPoint);
                return midPoint;
            }

            // get the bulge point
            var midPoint = getMidPointBetweenTwoPoints(x0,y0,z0,x1,y1,z1);

            // create a point 3D at the bulge point
            var thirdPoint = WSM.Geom.Point3d(midPoint[0], midPoint[1], midPoint[2]);
            console.log("Third point: " + JSON.stringify(thirdPoint));

            // create a new arc
            var catenaryArcFromLine = WSM.APICreateCircleOrArcFromPoints(nHistoryID, arcStartPos, arcEndPos, thirdPoint);
            console.log("Created a new arc based on the input line.");

            // find the geometry that was just changed so it can be highlighted and checked
            var changedData = WSM.APIGetCreatedChangedAndDeletedInActiveDeltaReadOnly(nHistoryID, 7);
            //console.log("Changed data : " + JSON.stringify(changedData));

            var newEdgeIDArray = changedData["created"];

            // eliminate the current selection
            FormIt.Selection.ClearSelections();	

            // add the new edges to the selection
            var currentSelection = FormIt.Selection.AddSelections(newEdgeIDArray);
            console.log("\nAdded the new curve to the selection.");

            // get basic info about the new selection

            // report how many items in the selection
            var currentSelectionLength = currentSelection.length;
            console.log("Number of objects in selection: " + currentSelectionLength);

            if (currentSelection.length === 0)
            {
                console.log("\nSelect a line or series of lines to begin.");
                return;
            }

            // re-run the get info on selection routine to populate the arrays with the new curve information
            getSelectionInfo();
            console.log("\nUpdating selection info.");

            // set the target curve to the newly created curve
            var targetCurveVertexIDArray = nVertexIDArray;

            return targetCurveVertexIDArray;
        }

        // define the target curve as this new curve
        var targetCurveVertexIDArray = createCatenaryArcFromLine();
        console.log("Target curve vertex ID array: " + JSON.stringify(targetCurveVertexIDArray));

    }

    // if the operation is an arc or circle, set the target curve to the current selection
    if (operationType === "arcCircle")
    {
        console.log("\nArc or circle detected.");

        // define the target curve as the selected curve
        var targetCurveVertexIDArray = nVertexIDArray;
        consol.log("Target curve vertex ID array: " + JSON.stringify(targetCurveVertexIDArray));
        
    }

    // define how to rebuild the given arc/circle
    function rebuildArcCircle(facetCount, targetCurveVertexIDArray)
    {
        console.log("\nBegin rebuild of arc or circle...");
        console.log("\nGetting information about the current arc or circle...\n");

        // get the first index of the arc/circle analysis, which should be sufficient because we've already proven the arrays are identical by this point
        var arcCircleAnalysis = arcCircleAnalysisArray[0];
        //console.log("Arc/circle analysis to use as reference: " + JSON.stringify(arcCircleAnalysis));

        var edgeCount = currentSelection.length;
        console.log("Edges selected: " + edgeCount);

        // flatten the array of Vertex IDs so they're not organized in sets for each edge
        function flatten(targetCurveVertexIDArray) 
        {
            return targetCurveVertexIDArray.reduce(function (flat, toFlatten) 
            {
                return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
            }, []);
        }

        var nVertexIDArrayFlattened = flatten(targetCurveVertexIDArray);
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

        // if no unique values are found, this is a circle, so mark the circle boolean true and redefine the two end points so all three points are distinct
        if (nVertexIDUniqueArray.length === 0)
        {
            var bCircle = true;
            console.log("Determined this curve is a full circle.\n");
            // get the ID of the second vertex of the first edge in the array
            var arcStartPosID = nVertexIDArrayFlattened[0];
            console.log("Start point vertexID: " + arcStartPosID);

            // get the point3D equivalent
            var arcStartPos = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, arcStartPosID);
            console.log("Start point point3D: " + JSON.stringify(arcStartPos))

            // get the ID of the last vertex of the last edge in the array
            var arcEndPosID = nVertexIDArrayFlattened[nVertexIDArrayFlattened.length - 2];
            console.log("End point vertexID: " + arcEndPosID);

            // get the point3D equivalent
            var arcEndPos = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, arcEndPosID);
            console.log("End point point 3D: " + JSON.stringify(arcEndPos));
        }
        else
        {
            var bCircle = false;
            console.log("Determined this curve is an arc, not a circle.\n");
            // get the ID of the first vertex of the first edge in the array
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
        }

        // get the third point: a point on or near the midpoint of the arc, at a segment vertex
        var thirdPointID = nVertexIDArray[Math.ceil(edgeCount / 2)][0];
        console.log("Third point vertexID: " + JSON.stringify(thirdPointID));

        // get the point3D equivalent
        var thirdPointPos = WSM.APIGetVertexPoint3dReadOnly(nHistoryID, thirdPointID);
        console.log("Third point 3D: " + JSON.stringify(thirdPointPos));

        var radius = arcCircleAnalysis["radius"];
        //console.log("Radius of circle: " + JSON.stringify(radius));

        var center = arcCircleAnalysis["center"];
        console.log("Center of circle or arc: " + JSON.stringify(center));

        var xAxis = arcCircleAnalysis["xaxis"];
        console.log("X axis of circle or arc: " + JSON.stringify(xAxis));

        var normal = arcCircleAnalysis["normal"];
        console.log("Normal of circle or arc: " + JSON.stringify(normal));
        
        var pi = 3.1415926535897932384626433832795;
        var circumference = radius * 2 * pi;
        console.log("Circumference of circle or arc: " + JSON.stringify(circumference));

        function getFacetedArcLength(point3DArray)
        {
            // for each edge, measure the distance between the two points
            for(var p = 0; p < targetCurveVertexIDArray.length * 2; p++)
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

            // debug to ensure all three points are getting the same distance from the center
            function getDistanceToCircleCenter(point0, center)
            {
                var x0 = point0["x"];
                var x1 = center["x"];

                var y0 = point0["y"];
                var y1 = center["y"];

                var z0 = point0["z"];
                var z1 = center["z"];

                return getDistanceBetweenTwoPoints(x0,y0,z0, x1,y1,z1);
            }

            console.log("\nVerifying the calculated radius to compare against the radius reported from the attribute...\n");
            console.log("Radius of circle or arc (from attribute): " + JSON.stringify(radius));
            console.log("Distance from arcStartPos to center (calculated): " + getDistanceToCircleCenter(arcStartPos, center));
            console.log("Distance from arcEndPos to center (calculated): " + getDistanceToCircleCenter(arcEndPos, center));
            console.log("Distance from thirdPointPos to center (calculated): " + getDistanceToCircleCenter(thirdPointPos, center) + "\n");

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
        var accuracyORcount = (Math.floor(args.facetCount / quarterCircleMultiplier));
        console.log("accuracyORcount: " + accuracyORcount);
        console.log("Effective accuracyORcount (x multiplier): " + (Math.ceil(quarterCircleMultiplier * accuracyORcount)));
        console.log("Requested facet count: " + args.facetCount);
        if (Math.ceil(accuracyORcount * quarterCircleMultiplier) < args.facetCount)
        {
            console.log("The requested facet count was higher than the resulting accuracyORcount value, so accuracyORcount was ignored.")
        }
        var bReadOnly = false;
        var trans;
        var nMinimumNumberOfFacets = args.facetCount;

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
        WSM.APICreateCircleOrArcFromPoints(nHistoryID, arcStartPos, arcEndPos, thirdPointPos, accuracyORcount, bReadOnly, trans, nMinimumNumberOfFacets, bCircle);

        // find the geometry that was changed so it can be highlighted and checked
        var changedData = WSM.APIGetCreatedChangedAndDeletedInActiveDeltaReadOnly(nHistoryID, 7);
        //console.log("Changed data : " + JSON.stringify(changedData));

        var newEdgeIDArray = changedData["created"];

        var newFacetCount = newEdgeIDArray.length;
        //console.log("New edge IDs: " + newEdgeIDs);
        console.log("\nCreated a new curve with " + newFacetCount + " faceted edges.");

        return newFacetCount;
    }
    
    // rebuild the arc, if enabled
    var bRebuildArc = true;
    console.log("\nRebuild arc/circle? " + bRebuildArc);
    if (bRebuildArc) 
    {
        var targetCurveEdgeIDArray = rebuildArcCircle();
    }

    // take the final target curve and array string lights along it
    function generateStringLightsAlongArcCircle()
    {      

        // rebuild the catenary curve?
        var bRebuildArc = false;

        if (bRebuildArc)
        {
            FormIt.UndoManagement.BeginState();
            newFacetCount = rebuildArcCircle(facetCount);
            var catenaryArcEdgeIDArray = newEdgeIDArray;
    
            FormIt.UndoManagement.EndState("Rebuild Arc/Circle");
        }

        else 
        {
            var catenaryArcEdgeIDArray = nObjectIDArray;

        }
    }

    // sweep the final target curve to resemble a cable thickness
    function sweepCatenaryArc()
    {
        var aProfile = [];
        var aPath = catenaryArcEdgeIDArray;
        var bRemoveUnusedProfileAndPath = false;
        WSM.APISweep(nHistoryID, aProfile, aPath, bRemoveUnusedProfileAndPath);   
    }

    // if the operation is a spline, we throw an error because this isn't supported yet
    if (operationType === "spline")
    {
        console.log("\nSpline detected.");
        console.log("Splines aren't supported yet, sorry.");
    }

    if (preCheckPassed && (operationType == "line"))
    {
        createCatenaryArcFromLine();
    }

}


// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
deanstein.Submit = function()
{
    var args = 
    {
    "facetCount": parseFloat(document.a.facetCount.value),
    "arcBulge": parseFloat(document.a.arcBulge.value),
    "lightSpacing": parseFloat(document.a.lightSpacing.value)
    }

    console.log("deanstein.GenerateStringLights");
    console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the function
    // defined above with the given args.  This is needed to communicate
    // between the web JS enging process and the FormIt process.
    window.FormItInterface.CallMethod("deanstein.GenerateStringLights", args);
}