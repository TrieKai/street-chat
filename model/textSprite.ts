import { Sprite, SpriteMaterial, CanvasTexture } from "three";

export class TextSprite {
  private sprite: Sprite;

  constructor(text: string) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;

    // Set canvas size
    canvas.width = 256;
    canvas.height = 64;

    // Draw background
    context.fillStyle = "rgba(0, 0, 0, 0.5)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    context.font = "Bold 32px Arial";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    // Create sprite
    const texture = new CanvasTexture(canvas);
    const material = new SpriteMaterial({ map: texture });
    this.sprite = new Sprite(material);

    // Scale sprite
    this.sprite.scale.set(0.5, 0.25, 1);
  }

  public getSprite(): Sprite {
    return this.sprite;
  }

  public setPosition(x: number, y: number, z: number): void {
    this.sprite.position.set(x, y + 1, z); // Position above the cube
  }

  public dispose(): void {
    if (this.sprite.material.map) {
      this.sprite.material.map.dispose();
    }
    this.sprite.material.dispose();
  }
}
