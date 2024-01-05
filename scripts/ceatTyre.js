
const Scene = require('Scene');

// Use export keyword to make a symbol available in scripting debug console
export const Diagnostics = require('Diagnostics');
(async function () {  // Enables async/await in JS [part 1]

  // To access scene objects
  const [directionalLight] = await Promise.all([
    Scene.root.findFirst('directionalLight0')
  ]);

  // To access class properties
  // const directionalLightIntensity = directionalLight.intensity;

  // To log messages to the console
  // Diagnostics.log('Console message logged from the script.');

})(); // Enables async/await in JS [part 2]
