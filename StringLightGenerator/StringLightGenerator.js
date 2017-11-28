deanstein = {};

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

    var preCheckPassed = preCheck();

    function generateStringLightsOnLine()
    {

    }

    if (preCheckPassed)
    {
        generateStringLightsOnLine();
    }


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