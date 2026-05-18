/* global PIXI */
function createEffects(app) {
  const layer = new PIXI.Container();
  app.stage.addChild(layer);

  // eslint-disable-next-line no-unused-vars
  function play(_fx) {}

  return { play };
}
