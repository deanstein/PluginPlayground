// NOTE!! FormIt runs in one process and the HTML panel runs in another process.
// This is why window.NewFormItInterface.CallMethod is needed to communicate
// between the 2 processes.

// To run:
//FormIt.LoadPlugin("https://deanstein.github.io/PluginPlayground/MoveAllSceneCameras");
//console.log("Test");
//deanstein.MoveCameras(20);

deanstein = {};
deanstein.MoveCameras = function(args)
{

var deltaX = args.MoveX;
var deltaY = args.MoveY;
var deltaZ = args.MoveZ;
console.clear();

//Get all scenes
var scenes = FormIt.Scenes.GetScenes();

/*console.log(scenes);
console.log("--------");
console.log(JSON.stringify(scenes));*/

console.log("Number of Scenes = " + scenes.length);

for (i = 0; i < scenes.length; i++) {

	// Get data for single scene
	var scene = scenes[i];
	console.log(scene);
	console.log(JSON.stringify(scene));

	// Get camera data
	var camera = scene.camera;

	console.log("--------");
	console.log(JSON.stringify(camera));

	// Get X value
	var X = camera.posX;

	console.log("--------");
	console.log("X value: " + (JSON.stringify(X)));

	// Add value to X
	X = X + deltaX;
	camera.posX = X;

	// Get Y value
	var Y = camera.posY;

	console.log("--------");
	console.log("Y value: " + (JSON.stringify(Y)));

	// Add value to Y
	Y = Y + deltaY;
	camera.posY = Y;

	// Get Z value
	var Z = camera.posZ;

	console.log("--------");
	console.log("Z value: " + (JSON.stringify(Z)));

	// Add value to Z
	Z = Z + deltaZ;
	camera.posZ = Z;

	console.log("--------");
	console.log(JSON.stringify(camera));
	}

	FormIt.Scenes.SetScenes(scenes);
}


// Submit runs from the HTML page.  This script gets loaded up in both FormIt's
// JS engine and also in the embedded web JS engine inside the panel.
deanstein.Submit = function()
{
    var args = {
    "MoveX": parseFloat(document.a.X.value),
    "MoveY": parseFloat(document.a.Y.value),
    "MoveZ": parseFloat(document.a.Z.value)
    }
    console.log("deanstein.MoveCameras");
    console.log("args");
    // NOTE: window.FormItInterface.CallMethod will call the CreateBlock function
    // defined above with the given args.  This is needed to communicate
    // between the web JS enging process and the FormIt process.
    window.FormItInterface.CallMethod("deanstein.MoveCameras", JSON.stringify(args));
}
