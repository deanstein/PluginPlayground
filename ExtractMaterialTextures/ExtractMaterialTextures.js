if (typeof deanstein == 'undefined')
{
    deanstein = {};
}

deanstein.ExtractMaterialTextures = function(args)
{
    console.clear();

    // get current history
    var nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    console.log("Current history: " + JSON.stringify(nHistoryID));

    // get current selection
    var currentSelection = FormIt.Selection.GetSelections();
    console.log("Current selection: " + JSON.stringify(currentSelection));

    // if you're not in the Main History, calculate the depth to extract the correct history data
    var historyDepth = (currentSelection[0]["ids"].length) -1;
    console.log("Current history depth: " + historyDepth);

    // get objectID of the current selection
    var nObjectID = currentSelection[0]["ids"][historyDepth]["Object"];
    console.log("Current selection ID: " + nObjectID);

    // get the material ID for the selection
    var selectionMaterialID = WSM.APIGetObjectMaterialReadOnly(nHistoryID, nObjectID);
    console.log("Current selection material ID: " + selectionMaterialID);

    var selectionMaterialData = WSM.APIGetMaterialDataReadOnly(nHistoryID, selectionMaterialID);
    console.log("Current selection material data: " + JSON.stringify(selectionMaterialData));

    // get the texture data
    var textureData = WSM.APIGetTextureDataReadOnly(nHistoryID, selectionMaterialData.nTextureID);
    //console.log("Current selection texture data: " + JSON.stringify(textureData));

    var bitmapData = textureData.bitmap;
    console.log("bitmap data: " + JSON.stringify(bitmapData));

    return bitmapData;
}

// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
deanstein.Submit = function()
{
    var args = {
    //"radius": parseFloat(document.a.radius.value),
    //"cleanup": document.a.cleanup.checked
    }

    console.log("deanstein.ExtractMaterialTextures");
    console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the function
    // defined above with the given args.  This is needed to communicate
    // between the web JS enging process and the FormIt process.
    window.FormItInterface.CallMethod("deanstein.ExtractMaterialTextures", args);
    FormItInterface.CallMethod("deanstein.ExtractMaterialTextures", args,
        function(bitmapData)
        {
            //debugger;
            var evalBitmapData = eval(bitmapData);
            var data = new Uint8Array(evalBitmapData);
            var blob = new Blob([data], {type: 'image/bmp'});
            var imgURL = URL.createObjectURL(blob);

            var img = document.createElement("img");
            img.src = imgURL;
            window.document.body.appendChild(img);
        });
}
