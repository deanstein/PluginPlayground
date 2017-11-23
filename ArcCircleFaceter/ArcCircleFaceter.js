deanstein = {};

deanstein.RebuildArcCircle = function(args)
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

    var arcCircleAnalysisArray = new Array();
    var typeArray = new Array();
    var bIsEdgeTypeArray = new Array();
    var siblingArray = new Array();
    var bIsSameSiblingArray = new Array();
    var bIsOnCircleArray = new Array();
    var bIsOnSplineArray = new Array();

    function getSelectionInfo()
    {
        // for each edge in the selection, get helpful information
        for (var j = 0; j < currentSelection.length; j++)
        {
            // if you're not in the Main History, need to calculate the depth to extract the correct history data
            var historyDepth = (currentSelection[j]["ids"].length) - 1;

            // get objectID of the current selection
            var nObjectID = currentSelection[j]["ids"][historyDepth]["Object"];
            //console.log("Selection ID: " + nObjectID);

            // get object type of the current selection, then push the results into an array
            var nType =  WSM.APIGetObjectTypeReadOnly(nHistoryID, nObjectID);
            //console.log("Object type: " + nType);
            typeArray.push(nType);
            //console.log("Object type array: " + typeArray);

            function getArcCircleAnalysis() 
            {
                // test selection for arc/circle attributes, then push the results into array
                var arcCircleAnalysis = WSM.APIIsEdgeOnCircleReadOnly(nHistoryID, nObjectID);
                //console.log("Report results of arc/circle analysis: " + JSON.stringify(arcCircleAnalysis));
                var bIsOnCircle = arcCircleAnalysis["bHasCircleAttribute"];
                //console.log("Is selection part of a circle? " + arcCircleAnalysis["bHasCircleAttribute"]);
                bIsOnCircleArray.push(bIsOnCircle);
                //console.log(JSON.stringify(arcCircleAnalysis));
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
            // the valid edge type is defined as the number 7
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

    // run the precheck to define the precheck variable
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

            var arcCircleAnalysis = arcCircleAnalysisArray[0];
            var center = arcCircleAnalysis["center"];
            console.log("Center of circle: " + JSON.stringify(center));

            var xAxis = arcCircleAnalysis["x-axis"];
            console.log("X axis: " + JSON.stringify(xAxis));

        }
        else if (operationType === "spline")
        {
            console.log("\n Rebuilding splines is not yet supported.");
        }
        else if (operationType === "line")
        {
            console.log("\n Rebuilding lines is not yet supported");
        }
    }

    FormIt.UndoManagement.BeginState();

    // execute the rebuild
    rebuildCurve(operationType);

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