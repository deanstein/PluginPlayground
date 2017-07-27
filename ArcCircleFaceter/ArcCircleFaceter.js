deanstein = {};

deanstein.CreateArcCircle = function(args)
{
    var radius = args.Radius;
    var posCenter = args.OriginPoint;
    var arcLengthParameter = args.ArcLength;
    var edgeLength = args.FacetEdgeLength;
    console.clear();

    // Get the current history
    var nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();

    // USER: set radius
    var radius = 50;

    // USER: optionally set origin
    var posCenter = WSM.Geom.Point3d(0,0,0);

    var xAxis = WSM.Geom.Vector3d(1,0,0);
    var yAxis = WSM.Geom.Vector3d(0,1,0);
    var dStartParam = 0;

    // USER: set arc length out of 1. 0.25 = quarter circle, 0.5 = half circle, 1.0 = circle
    var arcLengthParameter = 0.5;
    var arcLengthParameterPercentage = arcLengthParameter * 100;

    // USER: set desired edge length for faceting
    var edgeLength = 3;

    var pi = 3.1415926535897932384626433832795;
    var circumference = radius * 2 * pi;
    var effectiveArcLength = circumference * arcLengthParameter;
    var dEndParam = arcLengthParameter * (2 * pi);

    // Number of facets in each 90 degree arc segment; if circle, 4x this amount
    var accuracyORcount = Math.ceil(circumference / (4 * edgeLength));
    var numberOfFacets = (arcLengthParameter / 0.25) * (accuracyORcount);

    // Report what was created
    console.log("Created an arc representing " + arcLengthParameterPercentage.toFixed(2) + "% of a circle with radius of " + radius + ", arc length of " + effectiveArcLength.toFixed(2) + ", and " + numberOfFacets + " facets inside History ID " + nHistoryID + ".");

    WSM.APICreateCircleOrArc(nHistoryID, radius, posCenter, xAxis, yAxis, dStartParam, dEndParam, accuracyORcount);
}

// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
deanstein.Submit = function()
{
    var args = 
    {
    "Radius": parseFloat(document.a.radius.value),
    "OriginPoint": parseFloat(document.a.posCenter.value),
    "ArcLength": parseFloat(document.a.arcLengthParameter.value),
    "FacetEdgeLength": parseFLoat(document.activeElement.edgeLength.value);
    }

    console.log("deanstein.CreateArcCircle");
    console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the MoveCameras function
    // defined above with the given args.  This is needed to communicate
    // between the web JS enging process and the FormIt process.
    window.FormItInterface.CallMethod("deanstein.CreateArcCircle", JSON.stringify(args));
}