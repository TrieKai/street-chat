import { Sprite, SpriteMaterial, CanvasTexture } from "three";

export class TextSprite {
  private sprite: Sprite;
  private static readonly FONT_SIZE = 32;
  private static readonly PADDING = 20; // Padding around the text

  constructor(text: string, chatroomId: string) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;

    // Set the font for measurement
    context.font = `Bold ${TextSprite.FONT_SIZE}px Arial`;

    // Measure the text
    const metrics = context.measureText(text);
    const textWidth = metrics.width;
    const textHeight = TextSprite.FONT_SIZE;

    // Set the canvas size, including padding
    canvas.width = textWidth + TextSprite.PADDING * 2;
    canvas.height = textHeight + TextSprite.PADDING * 2;

    // Reset the font, because the canvas reset will clear the font settings
    context.font = `Bold ${TextSprite.FONT_SIZE}px Arial`;

    // Draw the background
    context.fillStyle = "rgba(0, 0, 0, 0.5)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the text
    context.fillStyle = "white";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    // Create a texture from the canvas
    const texture = new CanvasTexture(canvas);
    const material = new SpriteMaterial({ map: texture });
    this.sprite = new Sprite(material);

    // Set the sprite's scale to maintain the aspect ratio
    // while keeping it centered
    const scale = 0.5; // Base scale factor
    this.sprite.scale.set((canvas.width / canvas.height) * scale, scale, 1);

    this.sprite.userData.chatroomId = chatroomId;
  }

  public getSprite(): Sprite {
    return this.sprite;
  }

  public setPosition(x: number, y: number, z: number): void {
    this.sprite.position.set(x, y, z + 1);
  }

  public dispose(): void {
    if (this.sprite.material.map) {
      this.sprite.material.map.dispose();
    }
    this.sprite.material.dispose();
  }
}
