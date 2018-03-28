console.clear();

// define the path all the files live in
var filePath = "E:/_cloud/Box Sync/_FormIT/Customer Support/A+I/";

// define the file names you want to convert
var fileNames = ["box1.sat", "box2.sat", "box3.sat", "box4.sat"];

// get current history
var nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();

// create an empty array to capture the changed data
var changedDataIDArray = [];

// for each of the files listed above, import them
for (var i = 0; i <= fileNames.length - 1; i++)
{
    var finalPath = filePath + fileNames[i];
    FormIt.ImportFile(finalPath, false);

    // find the bodies that were added so they can be merged
    var changedData = WSM.APIGetCreatedChangedAndDeletedInActiveDeltaReadOnly(nHistoryID, 1);
    // get the IDs of the created bodies
    var changedDataIDs = changedData["created"];
    //console.log("Changed data IDs: " + changedDataIDs);

    // for each of the IDs that were just imported, push their IDs to a new array
    for (var j = 0; j < changedDataIDs.length; j++)
    {
        changedDataIDArray.push(changedDataIDs[j]);
    }
}
console.log("changedDataIDArray: " + changedDataIDArray);

// create a temporary array to remove the first items
var changedDataIDArrayTemp = [];

// create an array with the first two objects removed
for (j = 2; j < changedDataIDArray.length; j++)
{
    changedDataIDArrayTemp.push(changedDataIDArray[j]);
}
console.log("changedDataIDArrayTemp: " + changedDataIDArrayTemp);

// join the geometry that was just imported
WSM.APIUnite(nHistoryID, changedDataIDArray[0], changedDataIDArray[1], changedDataIDArrayTemp);