deanstein = {};
deanstein.Statistics = function(args)
{
    //args = JSON.parse(args);
    var calcVolume = args.calcVolume;
    //var calcArea = args.calcArea;

    console.clear();

    // get current history
    var nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    console.log("Current history: " + JSON.stringify(nHistoryID));

    // get current selection
    var currentSelection = FormIt.Selection.GetSelections();
    console.log("Current selection: " + JSON.stringify(currentSelection));

    function calculateVolume(currentSelection) 
    {

        var totalVolume = new Array();

        // for each object selected, get the ObjectID and calculate the volume
        for (var j = 0; j < currentSelection.length; j++)
        {

            // if you're not in the Main History, need to calculate the depth to extract the correct history data
            var historyDepth = (currentSelection[j]["ids"].length) - 1;
            console.log("Current history depth: " + historyDepth);

            // get objectID of the current selection
            var nObjectID = currentSelection[j]["ids"][historyDepth]["Object"];
            console.log("Object ID: " + JSON.stringify(nObjectID));

            // calculate the volume of the selection
            var selectedVolume = WSM.APIComputeVolumeReadOnly(nHistoryID, nObjectID);
            console.log("Selected volume: " + JSON.stringify(selectedVolume));

            // add multiple volumes up
            totalVolume.push(selectedVolume);
            console.log("Accumulated volume array: " + JSON.stringify(totalVolume));

        }
    }

    calculateVolume(currentSelection);

}



// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
deanstein.Submit = function()
{
    var args = {
    "calcVolume": document.a.calcVolume.checked
    }

    console.log("deanstein.Statistics");
    console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the function
    // defined above with the given args.  This is needed to communicate
    // between the web JS enging process and the FormIt process.
    window.FormItInterface.CallMethod("deanstein.Statistics", args);
}
