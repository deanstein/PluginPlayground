// run toggle
autoRun = false;

if (autoRun)
{
    console.clear();
    requiredEdgeCount = 2;

    // get current history
    nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    console.log("Current history: " + JSON.stringify(nHistoryID));

    // get current selection (TODO: throw an error if not a point)
    currentSelection = FormIt.Selection.GetSelections();
    console.log("Current selection: " + JSON.stringify(currentSelection));

    // get vertexID of the selection
    nVertexType = WSM.nVertexType;
    nVertexID = currentSelection[0]["ids"][0]["Object"];
    console.log("Vertex ID of current selection (point0): " +  JSON.stringify(nVertexID));

    // define the current selection as point0
    console.log("---------- define point0 ----------")
    point0 = WSM.APIGetVertexPoint3dReadOnly(nHistoryID,nVertexID);
    console.log("point0 = " + JSON.stringify(point0));

    pointX0 = point0["x"];
    console.log("pointX0 = " + JSON.stringify(pointX0));
    pointY0 = point0["y"];
    console.log("pointY0 = " + JSON.stringify(pointY0));
    pointZ0 = point0["z"];
    console.log("pointZ0 = " + JSON.stringify(pointZ0));
    console.log("");

    // calculate how many edges are attached to point0
    numberOfEdges = edgeIDArray.length;
    console.log("Number of edges attached to point0: " + numberOfEdges);

    // get edge IDs attached to point0
    nEdgeType = WSM.nEdgeType;
    edgeIDArray = WSM.APIGetObjectsByTypeReadOnly(nHistoryID,nVertexID,nEdgeType,true);
    console.log("Edge IDs attached to point0: " +  JSON.stringify(edgeIDArray));

    // check if the number of edges attached to vertex is equal to the requirement
    if (numberOfEdges == requiredEdgeCount)
        {
            remainingVertexIds = [];

            // for each edge, get the vertex IDs
            for (i = 0; i <= numberOfEdges - 1; i++)
                {
                    nType = WSM.nVertexType;
                    // for each edge, returns an array of vertices
                    getVertexIds = WSM.APIGetObjectsByTypeReadOnly(nHistoryID,edgeIDArray[i],nType,false);
                    console.log("Reading these vertex IDs from edge " + edgeIDArray[i] + ": " + JSON.stringify(getVertexIds));

                    // check if vertex IDs are equal to point0 ID; if they are, push to a new array for add'l processing
                    if (getVertexIds[0] == nVertexID)
                        {
                            remainingVertexIds.push(getVertexIds[1]);
                        }
                    if (getVertexIds[1] == nVertexID)
                        {
                            remainingVertexIds.push(getVertexIds[0]);
                        }
                }
            console.log("Use these remaining points for analysis: " + remainingVertexIds);

            // get IDs for points 1 and 2
            point1Id = remainingVertexIds[0];
            point2Id = remainingVertexIds[1];

            // define point 1
            console.log("---------- define point1 ----------")
            point1 = WSM.APIGetVertexPoint3dReadOnly(nHistoryID,point1Id);
            console.log("point1 = " + JSON.stringify(point1));

            pointX1 = point1["x"];
            console.log("pointX1 = " + JSON.stringify(pointX1));
            pointY1 = point1["y"];
            console.log("pointY1 = " + JSON.stringify(pointY1));
            pointZ1 = point1["z"];
            console.log("pointZ1 = " + JSON.stringify(pointZ1));
            console.log("");

            // define point 2
            console.log("---------- define point2 ----------")
            point2 = WSM.APIGetVertexPoint3dReadOnly(nHistoryID,point2Id);
            console.log("point2 = " + JSON.stringify(point2));

            pointX2 = point2["x"];
            console.log("pointX2 = " + JSON.stringify(pointX2));
            pointY2 = point2["y"];
            console.log("pointY2 = " + JSON.stringify(pointY2));
            pointZ2 = point2["z"];
            console.log("pointZ2 = " + JSON.stringify(pointZ2));
            console.log("");

            // identify delta values
            x1Delta = pointX1 - pointX0;
            y1Delta = pointY1 - pointY0;
            z1Delta = pointZ1 - pointZ0;

            x2Delta = pointX2 - pointX0;
            y2Delta = pointY2 - pointY0;
            z2Delta = pointZ2 - pointZ0;

            // identify d1 denominator
            d1Denominator = Math.pow((Math.pow(x1Delta, 2) + Math.pow(y1Delta, 2) + Math.pow(z1Delta, 2)), 0.5);
            console.log("d1Denominator = " + d1Denominator);

            // calculate d1 vectors
            d1x = x1Delta/d1Denominator;
            console.log("d1x = " + d1x);
            d1y = y1Delta/d1Denominator;
            console.log("d1y = " + d1y);
            d1z = z1Delta/d1Denominator;
            console.log("d1z = " + d1z);
            console.log("");

            // identify d2 denominator
            d2Denominator = Math.pow((Math.pow(x2Delta, 2) + Math.pow(y2Delta, 2) + Math.pow(z2Delta, 2)), 0.5);
            console.log("d2Denominator = " + d2Denominator);

            // calculate d2 vectors
            d2x = x2Delta/d2Denominator;
            console.log("d2x = " + d2x);
            d2y = y2Delta/d2Denominator;
            console.log("d2y = " + d2y);
            d2z = z2Delta/d2Denominator;
            console.log("d2z = " + d2z);
            console.log("");

            // calculate d1 and d2 dot product
            d1d2DotProduct = (d1x * d2x) + (d1y * d2y) + (d1z * d2z);
            console.log("d1d2DotProduct = " + d1d2DotProduct);

            // calculate angle theta
            angleTheta = Math.acos(d1d2DotProduct);
            console.log("angleTheta = " + angleTheta);
            angleThetaDegrees = angleTheta * (180/Math.PI);
            console.log("angleThetaDegrees = " + angleThetaDegrees);
        }
    else 
        {
            console.log("Error, there are too few or too many edges attached at this vertex.")
        }
}