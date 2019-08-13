import * as React from "react";
import ReactDOM from "react-dom";

const MAX_WIDTH = 1600;

let resources: { img: HTMLImageElement } = {
  img: null
};

function main() {
  const domContainer = document.querySelector("#app");
  resources.img = document.querySelector("#source-image") as HTMLImageElement;
  console.log(`img`, resources.img);
  resources.img.onload = () => {
    console.log("Image loaded!");
    ReactDOM.render(<App />, domContainer);
  };
}

interface State {
  width: number;
  xskip: number;
}

class App extends React.PureComponent<{}, State> {
  canvas: HTMLCanvasElement = null;
  pixels: Uint8ClampedArray;

  constructor(props) {
    super(props);
    this.state = {
      width: 449,
      xskip: 0
    };

    let img = resources.img;
    let cv2 = document.createElement("canvas");
    cv2.width = img.width;
    cv2.height = img.height;
    let ctx2 = cv2.getContext("2d");
    ctx2.drawImage(img, 0, 0);
    const data = ctx2.getImageData(0, 0, img.width, img.height);
    this.pixels = data.data;
  }

  render() {
    return (
      <div>
        <div>
          <input
            type="range"
            min={0}
            max={128}
            value={this.state.xskip}
            onChange={this.onXSkipChange}
          />
          <span>X Skip: {this.state.xskip}px</span>
        </div>
        <div>
          <input
            type="range"
            min={32}
            max={MAX_WIDTH}
            value={this.state.width}
            onChange={this.onRangeChange}
          />
          <span>Width: {this.state.width}px</span>
        </div>
        <canvas ref={this.gotCanvas} width={MAX_WIDTH} height={200} />
        <p>Please, my canvas is up there</p>
      </div>
    );
  }

  onRangeChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      width: ev.currentTarget.valueAsNumber
    });
  };

  onXSkipChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      xskip: ev.currentTarget.valueAsNumber
    });
  };

  gotCanvas = canvas => {
    this.canvas = canvas;
    this.redraw();
  };

  componentDidUpdate() {
    this.redraw();
  }

  redraw() {
    if (!this.canvas) {
      return;
    }

    let ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let x = 0;
    let y = 0;
    let rgba = this.pixels;

    let width = this.state.width;
    let xskip = this.state.xskip;
    console.log(`drawing with width ${width}`);

    let rgb = new Uint8ClampedArray((rgba.length / 4) * 3);
    for (let i = 0; i < rgba.length / 4; i++) {
      rgb[i * 3 + 0] = rgba[i * 4 + 0];
      rgb[i * 3 + 1] = rgba[i * 4 + 1];
      rgb[i * 3 + 2] = rgba[i * 4 + 2];
    }

    let imageData = ctx.createImageData(width, this.canvas.height);
    let destRGBA = imageData.data;

    let counter = 0;
    for (let i = 0; i < rgb.length; i++) {
      x += 1;
      if (x >= width) {
        x -= width;
        y++;
      }

      let [r, g, b] = [
        rgb[i * 3 + 0],
        rgb[i * 3 + 1],
        rgb[i * 3 + 2],
      ];

      let offset = (x + y * width) * 4;
      destRGBA[offset] = r;
      destRGBA[offset + 1] = g;
      destRGBA[offset + 2] = b;
      destRGBA[offset + 3] = 255;

            if (r > 128) {
             destRGBA[offset + 0] = 255;
destRGBA[offset + 1] = 0;
  destRGBA[offset + 2] = 0;
      destRGBA[offset + 3] = 255;
    } else if (g > 128) {
    destRGBA[offset + 0] = 0; 
  destRGBA[offset + 1] = 255;
    destRGB[offset + 2] = 0;
  destRGBA[offset + 3] = 255;
} else if (b > 128) {
   destRGBA[offset + 0] = 0;
        destRGBA[offset + 1] = 0;
        destRGBA[offset + 2] = 255;
        destRGBA[offset + 3] = 0;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }
}

document.addEventListener("DOMContentLoaded", main);
