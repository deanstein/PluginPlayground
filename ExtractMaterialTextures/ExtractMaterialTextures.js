if (typeof deanstein == 'undefined')
{
    deanstein = {};
}

//var img = document.createElement('img');

deanstein.ExtractMaterialTextures = function(args)
{
    console.clear();

    // get current history
    var nHistoryID = FormIt.GroupEdit.GetEditingHistoryID();
    console.log("Current history: " + JSON.stringify(nHistoryID));

    // get current selection
    var currentSelection = FormIt.Selection.GetSelections();
    console.log("Current selection: " + JSON.stringify(currentSelection));

    // get the texture data
    var textureData = WSM.APIGetTextureDataReadOnly(0,13);
    console.log("texture data: " + textureData);

    var bitmapData = textureData.bitmap;
    console.log("bitmap data: " + bitmapData);

    var img = document.getElementById("img");
    img.src = bitmapData;
    window.document.body.appendChild(img);
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
}
