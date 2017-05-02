// To run:
//FormIt.LoadPlugin("https://deanstein.github.io/PluginPlayground/MoveAllSceneCameras");
//console.log("Test");
//MoveCameras(20);

deanstein = {};
deanstein.MoveCameras = function(deltaZ)
{

console.clear();

//Get all scenes
var scenes = FormIt.Scenes.GetScenes();

/*console.log(scenes);
console.log("--------");
console.log(JSON.stringify(scenes));*/

console.log("Number of Scenes = " + scenes.length);

for (i = 0; i < scenes.length; i++) {

	// Get single scene
	var scene = scenes[i];
	console.log(scene);
	console.log(JSON.stringify(scene));

	// Camera
	var camera = scene.camera;

	console.log("--------");
	console.log(JSON.stringify(camera));

	// Z value
	var Z = camera.posZ;

	console.log("--------");
	console.log(JSON.stringify(Z));

	// Add value to Z
	Z = Z + deltaZ;
	camera.posZ = Z;

	console.log("--------");
	console.log(JSON.stringify(camera));
	}

	FormIt.Scenes.SetScenes(scenes);
}
