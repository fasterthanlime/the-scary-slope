import * as React from "react";
import ReactDOM from "react-dom";

const MAX_WIDTH = 800;
const SCALE_FACTOR = 10000;

let resources: { src: HTMLImageElement; ref: HTMLImageElement } = {
  src: null,
  ref: null,
};

function main() {
  const domContainer = document.querySelector("#app");

  resources.src = document.querySelector("#src-image") as HTMLImageElement;
  resources.ref = document.querySelector("#ref-image") as HTMLImageElement;

  let loaded = {
    source: false,
    ref: false,
  };

  let maybeload = () => {
    if (loaded.source && loaded.ref) {
      ReactDOM.render(<App />, domContainer);
    }
  };

  resources.src.onload = () => {
    console.log("Src loaded!");
    loaded.source = true;
    maybeload();
  };

  resources.ref.onload = () => {
    console.log("Ref loaded!");
    loaded.ref = true;
    maybeload();
  };
}

interface State {
  width: number;
  scale: number;
  skipx: number;
  alpha: number;
}

class App extends React.PureComponent<{}, State> {
  canvas: HTMLCanvasElement = null;
  constructor(props) {
    super(props);
    this.state = {
      scale: 1 * SCALE_FACTOR,
      width: 417,
      skipx: 32,
      alpha: 0.1,
    };
  }

  render() {
    return (
      <div>
        <div className="controls">
          <div className="group">
            <input
              type="range"
              min={1 * SCALE_FACTOR}
              max={1.2 * SCALE_FACTOR}
              value={this.state.scale}
              onChange={ev =>
                this.setState({ scale: ev.currentTarget.valueAsNumber })
              }
            />
            <span>Scale: {this.state.scale / SCALE_FACTOR}</span>
          </div>
          <div className="group">
            <input
              type="range"
              min={32}
              max={MAX_WIDTH}
              value={this.state.width}
              onChange={ev =>
                this.setState({ width: ev.currentTarget.valueAsNumber })
              }
            />
            <span>Width: {this.state.width}px</span>
          </div>
          <div className="group">
            <input
              type="range"
              min={0}
              max={80}
              value={this.state.skipx}
              onChange={ev =>
                this.setState({ skipx: ev.currentTarget.valueAsNumber })
              }
            />
            <span>Skip X: {this.state.skipx}px</span>
          </div>
          <div className="group">
            <input
              type="range"
              min={0}
              max={100}
              value={this.state.alpha * 100}
              onChange={ev =>
                this.setState({ alpha: ev.currentTarget.valueAsNumber / 100 })
              }
            />
            <span>Alpha: {this.state.alpha}</span>
          </div>
        </div>
        <canvas ref={this.gotCanvas} width={MAX_WIDTH} height={400} />
      </div>
    );
  }

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

    let rgba = null;
    {
      let img = resources.src;
      let scale = this.state.scale / SCALE_FACTOR;
      let sourceCanvas = document.createElement("canvas");
      sourceCanvas.width = img.width * scale;
      sourceCanvas.height = img.height * scale;
      let ctx2 = sourceCanvas.getContext("2d");
      ctx2.save();
      ctx2.scale(scale, scale);
      ctx2.drawImage(img, 0, 0);
      ctx2.restore();
      const data = ctx2.getImageData(
        0,
        0,
        sourceCanvas.width,
        sourceCanvas.height,
      );
      rgba = data.data;
    }

    let refImg = null;
    {
    }

    let ctx = this.canvas.getContext("2d");
    ctx.fillStyle = "rgb(72, 60, 50)";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    let x = 0;
    let y = 0;

    let width = this.state.width;
    let skipx = this.state.skipx;

    let rgb = new Uint8ClampedArray((rgba.length / 4) * 3);
    for (let i = 0; i < rgba.length / 4; i++) {
      rgb[i * 3 + 0] = rgba[i * 4 + 0];
      rgb[i * 3 + 1] = rgba[i * 4 + 1];
      rgb[i * 3 + 2] = rgba[i * 4 + 2];
    }

    let imageData = ctx.createImageData(width, this.canvas.height);
    let destRGBA = imageData.data;

    for (let i = 0; i < rgb.length; i++) {
      x += 1;
      if (x >= width) {
        i += skipx;
        x -= width;
        y++;
      }

      let [r, g, b] = [rgb[i * 3 + 0], rgb[i * 3 + 1], rgb[i * 3 + 2]];
      // let r = rgb[i];

      let offset = (x + y * width) * 4;
      destRGBA[offset] = r;
      destRGBA[offset + 1] = g;
      destRGBA[offset + 2] = b;
      destRGBA[offset + 3] = 255;

      // if (r > 120) {
      //   destRGBA[offset + 0] = 255;
      //   destRGBA[offset + 1] = 0;
      //   destRGBA[offset + 2] = 0;
      //   destRGBA[offset + 3] = 255;
      // }
      // if (g > 128) {
      //   destRGBA[offset + 0] = 0;
      //   destRGBA[offset + 1] = 255;
      //   destRGBA[offset + 2] = 0;
      //   destRGBA[offset + 3] = 255;
      // } else if (b > 128) {
      //   destRGBA[offset + 0] = 0;
      //   destRGBA[offset + 1] = 0;
      //   destRGBA[offset + 2] = 255;
      //   destRGBA[offset + 3] = 0;
      // }
    }
    ctx.putImageData(imageData, 0, 0);

    {
      ctx.save();
      ctx.globalAlpha = this.state.alpha;
      let refScale = width / resources.ref.width;
      ctx.scale(refScale, refScale);
      ctx.drawImage(resources.ref, 0, 0);
      ctx.restore();
    }
  }
}

document.addEventListener("DOMContentLoaded", main);
