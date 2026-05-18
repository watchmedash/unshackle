/* global PIXI */
function createHud(app) {
  const layer = new PIXI.Container();
  app.stage.addChild(layer);

  // ── Info panel ───────────────────────────────────────────────────────────
  const panel = new PIXI.Graphics();
  panel.beginFill(0x000000, 1);
  panel.drawRoundedRect(0, 0, 1080, 96, 0);
  panel.endFill();
  layer.addChild(panel);

  const infoStyle = {
    fontSize: 22,
    fill: 0xffffff,
    fontWeight: 'bold',
    fontFamily: 'Arial Rounded MT Bold, Arial Black, Arial, sans-serif',
    stroke: 0x000000,
    strokeThickness: 4,
  };

  const line1 = ['Like = grow', 'Comment = grow', 'Follow = grow more'];
  const line2 = ['Share = grow more', 'Gift = heal', 'Kill = grow fast'];

  [line1, line2].forEach((items, row) => {
    const spacing = 1060 / items.length;
    items.forEach((text, i) => {
      const t = new PIXI.Text(text, infoStyle);
      t.anchor.set(0.5, 0.5);
      t.x = spacing * i + spacing / 2 + 10;
      t.y = 26 + row * 44;
      layer.addChild(t);
    });
  });

  // ── Player count ─────────────────────────────────────────────────────────
  const countLabel = new PIXI.Text('0 players', {
    fontSize: 22,
    fill: 0x336688,
    fontWeight: 'bold',
    fontFamily: 'Arial Rounded MT Bold, Arial Black, Arial, sans-serif',
    stroke: 0xffffff,
    strokeThickness: 4,
  });
  countLabel.anchor.set(1, 0);
  countLabel.x = 1072;
  countLabel.y = 106;
  layer.addChild(countLabel);

  function update(playerCount) {
    countLabel.text = `${playerCount} players`;
  }

  return { update };
}
