(function(Scratch) {
  "use strict";

  const PREFIX = "lilyCanvasLayer";
  const DEFAULT_LAYER_NAME = "layer";

  const blockIconURI = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+cGVuLWljb248L3RpdGxlPjxnIHN0cm9rZT0iIzU3NUU3NSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik04Ljc1MyAzNC42MDJsLTQuMjUgMS43OCAxLjc4My00LjIzN2MxLjIxOC0yLjg5MiAyLjkwNy01LjQyMyA1LjAzLTcuNTM4TDMxLjA2NiA0LjkzYy44NDYtLjg0MiAyLjY1LS40MSA0LjAzMi45NjcgMS4zOCAxLjM3NSAxLjgxNiAzLjE3My45NyA0LjAxNUwxNi4zMTggMjkuNTljLTIuMTIzIDIuMTE2LTQuNjY0IDMuOC03LjU2NSA1LjAxMiIgZmlsbD0iI0ZGRiIvPjxwYXRoIGQ9Ik0yOS40MSA2LjExcy00LjQ1LTIuMzc4LTguMjAyIDUuNzcyYy0xLjczNCAzLjc2Ni00LjM1IDEuNTQ2LTQuMzUgMS41NDYiLz48cGF0aCBkPSJNMzYuNDIgOC44MjVjMCAuNDYzLS4xNC44NzMtLjQzMiAxLjE2NGwtOS4zMzUgOS4zYy4yODItLjI5LjQxLS42NjguNDEtMS4xMiAwLS44NzQtLjUwNy0xLjk2My0xLjQwNi0yLjg2OC0xLjM2Mi0xLjM1OC0zLjE0Ny0xLjgtNC4wMDItLjk5TDMwLjk5IDUuMDFjLjg0NC0uODQgMi42NS0uNDEgNC4wMzUuOTYuODk4LjkwNCAxLjM5NiAxLjk4MiAxLjM5NiAyLjg1NU0xMC41MTUgMzMuNzc0Yy0uNTczLjMwMi0xLjE1Ny41Ny0xLjc2NC44M0w0LjUgMzYuMzgybDEuNzg2LTQuMjM1Yy4yNTgtLjYwNC41My0xLjE4Ni44MzMtMS43NTcuNjkuMTgzIDEuNDQ4LjYyNSAyLjEwOCAxLjI4Mi42Ni42NTggMS4xMDIgMS40MTIgMS4yODcgMi4xMDIiIGZpbGw9IiM0Qzk3RkYiLz48cGF0aCBkPSJNMzYuNDk4IDguNzQ4YzAgLjQ2NC0uMTQuODc0LS40MzMgMS4xNjVsLTE5Ljc0MiAxOS42OGMtMi4xMyAyLjExLTQuNjczIDMuNzkzLTcuNTcyIDUuMDFMNC41IDM2LjM4bC45NzQtMi4zMTYgMS45MjUtLjgwOGMyLjg5OC0xLjIxOCA1LjQ0LTIuOSA3LjU3LTUuMDFsMTkuNzQzLTE5LjY4Yy4yOTItLjI5Mi40MzItLjcwMi40MzItMS4xNjUgMC0uNjQ2LS4yNy0xLjQtLjc4LTIuMTIyLjI1LjE3Mi41LjM3Ny43MzcuNjE0Ljg5OC45MDUgMS4zOTYgMS45ODMgMS4zOTYgMi44NTYiIGZpbGw9IiM1NzVFNzUiIG9wYWNpdHk9Ii4xNSIvPjxwYXRoIGQ9Ik0xOC40NSAxMi44M2MwIC41LS40MDQuOTA1LS45MDQuOTA1cy0uOTA1LS40MDUtLjkwNS0uOTA0YzAtLjUuNDA3LS45MDMuOTA2LS45MDMuNSAwIC45MDQuNDA0LjkwNC45MDR6IiBmaWxsPSIjNTc1RTc1Ii8+PC9nPjwvc3ZnPg==';

  const vm = Scratch.vm;
  const runtime = vm.runtime;
  const renderer = vm.renderer;
  const gl = renderer.gl;

  const cast = Scratch.Cast;
  const Skin = renderer.exports.Skin;

  class CanvasLayer extends Skin {
    constructor(id, renderer, name) {
      super(id, renderer);
      this.layerName = name;

      this.canvas = document.createElement("canvas");
      this.canvas.width = runtime.stageWidth;
      this.canvas.height = runtime.stageHeight;
      this.ctx = this.canvas.getContext("2d");
      this.ctx.translate(240, 180);

      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

      this._texture = texture;
      this._rotationCenter = [
        this.canvas.width / 2,
        this.canvas.height / 2
      ];
    }

    dispose() {
      if (this._texture) {
        this._renderer.gl.deleteTexture(this._texture);
        this._texture = null;
      }
      super.dispose();
    }

    clear() {
      const width = this.canvas.width;
      const height = this.canvas.height;
      this.ctx.clearRect(
        width / -2,
        height / -2,
        width,
        height
      );
      this.redraw();
    }

    redraw() {
      this.setContent(this.canvas);
      this.layerDirty();
    }

    layerDirty() {
      renderer.dirty = true;
      runtime.requestRedraw();
    }

    get size() {
      const width = this.canvas.width;
      const height = this.canvas.height;
      return [
        width,
        height
      ];
    }

    getTexture(scale) {
      return this._texture || super.getTexture();
    }

    setContent(textureData) {
      const gl = this._renderer.gl;
      gl.bindTexture(gl.TEXTURE_2D, this._texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas);
      this.emitWasAltered();
    }
  }

  class Extension {
    constructor() {
      this.layers = Object.create(null);
      this.layerOrder = renderer._layerGroups;
      this.editingContext = undefined;
      renderer.canvasLayers = this.layers;

      // Fill Tool
      this.fillColor = "#0088ff";
      this.fillSaturation = undefined;
      this.fillBrightness = undefined;
      this.fillOpacity = 100;
      this.fillEnabled = true;

      // Line Tool
      this.lineColor = "#000000";
      this.lineSaturation = undefined;
      this.lineBrightness = undefined;
      this.lineOpacity = 100;
      this.lineWidth = 4;
      this.lineEnabled = true;

      runtime.on("PROJECT_STOP_ALL", () => {
        this.deleteAllLayers();
      });

      runtime.on("STAGE_SIZE_CHANGED", (width, height) => {
        this._updateLayerDimensions(width, height);
      });

      const drawOriginal = renderer.draw;
      renderer.draw = function() {
        if (this.dirty)
          for (const layer in renderer.canvasLayers) {
            renderer.canvasLayers[layer].redraw();
          }
        drawOriginal.call(this);
      }
    }

    getInfo() {
      return {
        id: "lmsCanvas",
        name: "Canvas",
        blockIconURI,
        //color1: "#8f70fc",
        blocks: [{
            opcode: "createNewLayer",
            blockType: Scratch.BlockType.COMMAND,
            text: "create layer named [NAME]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_LAYER_NAME
              },
            },
          },
          {
            opcode: "deleteLayer",
            blockType: Scratch.BlockType.COMMAND,
            text: "delete layer [NAME]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_LAYER_NAME
              },
            }
          },
          {
            opcode: "deleteAllLayers",
            blockType: Scratch.BlockType.COMMAND,
            text: "delete all layers",
          },
          {
            opcode: "getCreatedLayers",
            blockType: Scratch.BlockType.REPORTER,
            text: "created layers",
          },
          "---",
          {
            opcode: "setContext",
            blockType: Scratch.BlockType.COMMAND,
            text: "set context to layer [NAME]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_LAYER_NAME
              },
            }
          },
          {
            opcode: "getContext",
            blockType: Scratch.BlockType.REPORTER,
            text: "current context",
          },
          this._label("Tool"),
          {
            opcode: "setColor",
            blockType: Scratch.BlockType.COMMAND,
            text: "set [TYPE] color to [COLOR]",
            arguments: {
              TYPE: {
                menu: "colorType",
              },
              COLOR: {
                type: Scratch.ArgumentType.COLOR,
              },
            },
          },
          {
            opcode: "getColor",
            blockType: Scratch.BlockType.REPORTER,
            text: "[TYPE] color",
            arguments: {
              TYPE: {
                menu: "colorType",
              },
            }
          },
          {
            opcode: "setLineWidth",
            blockType: Scratch.BlockType.COMMAND,
            text: "set line width to [WIDTH]",
            arguments: {
              WIDTH: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 10,
              },
            },
          },
          {
            opcode: "getLineAttribute",
            blockType: Scratch.BlockType.REPORTER,
            text: "[ATTRIBUTE] of line",
            arguments: {
              ATTRIBUTE: {
                menu: "lineAttribute",
              },
            }
          },
          this._label("Draw"),
          {
            opcode: "clearLayer",
            blockType: Scratch.BlockType.COMMAND,
            text: "erase all",
          },
          {
            opcode: "startPath",
            blockType: Scratch.BlockType.COMMAND,
            text: "start path",
          },
          {
            opcode: "endPath",
            blockType: Scratch.BlockType.COMMAND,
            text: "end path",
          },
          {
            opcode: "finishPath",
            blockType: Scratch.BlockType.COMMAND,
            text: "[TOOL] path",
            arguments: {
              TOOL: {
                menu: "pathTool"
              }
            }
          },
          "---",
          {
            opcode: "drawDot",
            blockType: Scratch.BlockType.COMMAND,
            text: "draw dot at x: [X] y: [Y]",
            arguments: {
              X: {
                type: Scratch.ArgumentType.NUMBER,
              },
              Y: {
                type: Scratch.ArgumentType.NUMBER,
              }
            }
          },
          {
            opcode: "drawLine",
            blockType: Scratch.BlockType.COMMAND,
            text: "draw line from x: [X1] y: [Y1] to x: [X2] y: [Y2]",
            arguments: {
              X1: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "-100"
              },
              Y1: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "-100"
              },
              X2: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "100"
              },
              Y2: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "100"
              },
            }
          },
          {
            opcode: "drawRectangle",
            blockType: Scratch.BlockType.COMMAND,
            text: "draw rectangle from x: [X1] y: [Y1] to x: [X2] y: [Y2]",
            arguments: {
              X1: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "-100"
              },
              Y1: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "-100"
              },
              X2: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "100"
              },
              Y2: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "100"
              },
            }
          },
          this._label("Layers"),
          {
            opcode: "incrementLayer",
            blockType: Scratch.BlockType.COMMAND,
            text: "move layer [NAME] [DIRECTION] [STEPS] layers",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_LAYER_NAME
              },
              DIRECTION: {
                menu: "direction"
              },
              STEPS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
            },
          },
          {
            opcode: "moveLayerTo",
            blockType: Scratch.BlockType.COMMAND,
            text: "move layer [NAME] to [LAYER]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_LAYER_NAME
              },
              LAYER: {
                menu: "layer"
              },
            },
          },
          {
            opcode: "moveLayerRelative",
            blockType: Scratch.BlockType.COMMAND,
            text: "move layer [NAME] [RELATIVE] [TARGET]",
            arguments: {
              NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "path1",
              },
              RELATIVE: {
                menu: "relative"
              },
              TARGET: {
                menu: "scratchLayers"
              },
            },
          },
        ],
        menus: {
          colorType: {
            acceptReporters: true,
            items: [
              "fill",
              "line"
            ],
          },
          toggle: {
            acceptReporters: true,
            items: [
              "enabled",
              "disabled"
            ],
          },
          lineAttribute: {
            acceptReporters: true,
            items: [
              "color",
              "saturation",
              "brightness",
              "opacity",
              "width"
            ]
          },
          direction: {
            acceptReporters: false,
            items: [
              "forward",
              "backward"
            ]
          },
          layer: {
            acceptReporters: false,
            items: [
              "front",
              "back"
            ]
          },
          relative: {
            acceptReporters: false,
            items: [
              "in front of",
              "behind"
            ]
          },
          scratchLayers: {
            acceptReporters: true,
            items: [
              "stage",
              "video layer",
              "pen layer",
              "all sprites",
              {
                text: "this sprite",
                value: "_myself_"
              },
            ]
          },
          pathTool: {
            acceptReporters: true,
            items: [
              "fill",
              "outline",
              "fill and outline",
            ]
          },
        }
      };
    }

    createNewLayer(args, util) {
      const name = cast.toString(args.NAME);
      if (name === "" || this.layers[name]) return;

      this._registerNewLayer(name);
    }

    deleteLayer(args, util) {
      const name = cast.toString(args.NAME);
      if (name === "" || !this.layers[name]) return;

      if (this.layers[name] === this.editingContext) {
        this.editingContext = undefined;
      }

      this.layers[name].dispose();
      delete this.layers[name];

      renderer.dirty = true;
      runtime.requestRedraw();
    }

    deleteAllLayers(args, util) {
      for (const layer in this.layers) {
        this.layers[layer].dispose();
        delete this.layers[layer];
      }

      renderer.dirty = true;
      runtime.requestRedraw();

      this.editingContext = undefined;
    }

    getCreatedLayers(args, util) {
      return JSON.stringify(Object.keys(this.layers));
    }

    setColor(args, util) {
      if (args.TYPE == "fill") {
        this.fillColor = args.COLOR;
      } else {
        this.lineColor = args.COLOR;
      }
    }

    getColor(args, util) {
      if (args.TYPE == "fill") {
        return this.fillColor;
      } else {
        return this.lineColor;
      }
    }

    setLineWidth(args) {
      let width = cast.toNumber(args.WIDTH);
      if (width < 1) width = 1;

      this.lineWidth = width;
    }

    getLineWidth(args) {
      return this.lineWidth;
    }

    getLineAttribute() {
      return "this does nothing yet lol";
    }

    clearLayer(args, util) {
      const layer = this.editingContext;
      if (!layer) return;

      layer.clear();
    }

    setContext(args, util) {
      const name = cast.toString(args.NAME);
      if (name === "" || !this.layers[name]) return;

      this.editingContext = this.layers[name];
    }

    getContext(args, util) {
      if (!this.editingContext) return "";

      return this.editingContext.layerName;
    }

    startPath(args, util) {
      const target = util.target;
      target.canvasPath = {
        enabled: true,
        path: [],
      };

      const originalTargetMoved = target.onTargetMoved;
      target.onTargetMoved = (...args) => {
        this._onTargetMoved(...args);

        if (originalTargetMoved) {
          originalTargetMoved(...args);
        }

        return;
      }

      target.canvasPath.path.push({
        x: target.x,
        y: target.y,
      });
    }

    endPath(args, util) {
      const target = util.target;
      const canvasPath = target.canvasPath;
      if (!canvasPath?.enabled) return;

      canvasPath.enabled = false;
    }

    finishPath(args, util) {
      const layer = this.editingContext;
      if (!layer) return;
      const ctx = layer.ctx;

      const target = util.target;
      const canvasPath = target.canvasPath;
      if (!canvasPath) return;

      canvasPath.enabled = false;
      const path = canvasPath.path;
      if (path.length < 1) return;

      ctx.beginPath();
      for (const position of path) {
        ctx.lineTo(position.x, position.y * -1);
      }

      ctx.fillStyle = `rgb(${Scratch.Cast.toRgbColorList(this.fillColor).join(",")})`;
      ctx.strokeStyle = `rgb(${Scratch.Cast.toRgbColorList(this.lineColor).join(",")})`;
      ctx.lineWidth = this.lineWidth;
      ctx.lineCap = "round";

      const tool = Scratch.Cast.toString(args.TOOL);
      console.log(tool);
      if (tool == "fill") {
        ctx.fill();
      } else if (tool == "outline") {
        ctx.stroke();
      } else {
        ctx.fill();
        ctx.stroke();
      }

      layer.redraw();
    }

    drawDot(args, util) {
      const layer = this.editingContext;
      if (!layer) return;
      const ctx = layer.ctx;

      const x = cast.toNumber(args.X);
      const y = cast.toNumber(args.Y * -1);

      ctx.beginPath();
      ctx.arc(x, y, this.lineWidth / 2, 0, 2 * Math.PI);
      ctx.fillStyle = `rgb(${Scratch.Cast.toRgbColorList(this.lineColor).join(",")})`;
      ctx.fill();

      layer.redraw();
    }

    drawLine(args, util) {
      const layer = this.editingContext;
      if (!layer) return;
      const ctx = layer.ctx;

      const x1 = cast.toNumber(args.X1);
      const x2 = cast.toNumber(args.X2);
      const y1 = cast.toNumber(args.Y1) * -1;
      const y2 = cast.toNumber(args.Y2) * -1;

      ctx.lineWidth = this.lineWidth;
      ctx.lineCap = "round";
      ctx.strokeStyle = `rgb(${Scratch.Cast.toRgbColorList(this.lineColor).join(",")})`;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      layer.redraw();
    }

    drawRectangle(args, util) {
      const layer = this.editingContext;
      if (!layer) return;
      const ctx = layer.ctx;

      const minX = Math.min(cast.toNumber(args.X1), cast.toNumber(args.X2));
      const maxX = Math.max(cast.toNumber(args.X1), cast.toNumber(args.X2));
      const minY = Math.min(cast.toNumber(args.Y1) * -1, cast.toNumber(args.Y2) * -1);
      const maxY = Math.max(cast.toNumber(args.Y1) * -1, cast.toNumber(args.Y2) * -1);

      ctx.fillStyle = `rgb(${Scratch.Cast.toRgbColorList(this.fillColor).join(",")})`;
      ctx.strokeStyle = `rgb(${Scratch.Cast.toRgbColorList(this.lineColor).join(",")})`;
      ctx.lineWidth = this.lineWidth;

      ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
      if (this.lineWidth > 0) ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
      layer.redraw();
    }

    incrementLayer(args, util) {
      runtime.emitCompileError(util.target, "you silly goose :3");
    }

    moveLayerTo(args, util) {
      runtime.emitCompileError(util.target, "you silly goose :3");
    }

    moveLayerRelative() {
      runtime.emitCompileError(util.target, "you silly goose :3");
    }

    /**
     * Utility Functions
     */

    _onTargetMoved(target, oldX, oldY, isForce) {
      const newX = target.x;
      const newY = target.y;
      if (newX === oldX && newY === oldY || isForce) return;

      const canvasPath = target.canvasPath;
      if (!canvasPath?.enabled) return;

      const path = canvasPath.path;
      path.push({
        x: newX,
        y: newY,
      });
    }

    _label(text) {
      return {
        blockType: Scratch.BlockType.LABEL,
        text,
      }
    }

    _updateLayerDimensions(width, height) {
      for (const layer in this.layers) {
        const canvas = this.layers[layer].canvas;
        canvas.width = width;
        canvas.height = height;
      }

      renderer.dirty = true;
      runtime.requestRedraw();

      this.editingContext = undefined;
    }

    _registerNewLayer(name) {
      const drawableName = `${PREFIX}_${name}`;

      const drawList = renderer._drawList.slice();

      const newOrder = renderer._groupOrdering.slice();
      newOrder.unshift(drawableName);
      renderer.setLayerGroupOrdering(newOrder);

      const skinId = renderer._nextSkinId++;
      const skin = new CanvasLayer(skinId, renderer, name);
      renderer._allSkins[skinId] = skin;
      this.layers[name] = skin;

      let drawableId = renderer.createDrawable(drawableName);
      renderer.updateDrawableSkinId(drawableId, skinId);

      skin.redraw();

      const front = renderer._drawList.length;
      drawList.splice(front, 0, skinId);
      renderer._drawList = drawList;

      renderer.dirty = true;
      runtime.requestRedraw();

      if (!this.editingContext) this.editingContext = this.layers[name];
    }
  }

  // Allow other extensions to access global values/functions
  runtime.ext_turbowarp_canvaslayers = new Extension();

  Scratch.extensions.register(runtime.ext_turbowarp_canvaslayers);
})(Scratch);