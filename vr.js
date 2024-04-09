(function (Scratch) {
  "use strict";
  const SESSION_TYPE = "immersive-vr";

  const Cast = Scratch.Cast;

  // WebXR unfortunately does not give us Euler angles easily
  // so lets do it ourselves
  // thanks to twoerner94 for quaternion-to-euler on npm
  function quaternionToEuler(quat) {
    const q0 = quat[0];
    const q1 = quat[1];
    const q2 = quat[2];
    const q3 = quat[3];

    const Rx = Math.atan2(2 * (q0 * q1 + q2 * q3), 1 - 2 * (q1 * q1 + q2 * q2));
    const Ry = Math.asin(2 * (q0 * q2 - q3 * q1));
    const Rz = Math.atan2(2 * (q0 * q3 + q1 * q2), 1 - 2 * (q2 * q2 + q3 * q3));

    const euler = [Rx, Ry, Rz];

    return euler;
  }

  function toRad(deg) {
    return deg * (Math.PI / 180);
  }
  function toDeg(rad) {
    return rad * (180 / Math.PI);
  }

  /**
   * Class of 2025 and 26
   * @constructor
   */
  class jgVr {
    constructor(runtime) {
      /**
       * The runtime instantiating this block package.
       * @type {runtime}
       */
      this.runtime = Scratch.vm.runtime;
      this.open = false;
      this.session = null;

      this.view = null;
      this.localSpace = null;

      /**
       * If true, VR sessions will begin split
       * If false, VR sessions will begin with no split
       */
      this.splitState = false;

      this.controllerIds = {};
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
      return {
        id: "jgVr",
        name: "Virtual Reality",
        color1: "#3888cf",
        color2: "#2f72ad",
        blocks: [
          // CORE
          {
            opcode: "isSupported",
            text: "is vr supported?",
            blockType: Scratch.BlockType.BOOLEAN,
            disableMonitor: true,
          },
          {
            opcode: "createSession",
            text: "create vr session",
            blockType: Scratch.BlockType.COMMAND,
          },
          {
            opcode: "closeSession",
            text: "close vr session",
            blockType: Scratch.BlockType.COMMAND,
          },
          {
            opcode: "isOpened",
            text: "is vr open?",
            blockType: Scratch.BlockType.BOOLEAN,
            disableMonitor: true,
          },
          "---", // SCREEN SPLITTING SETTINGS
          {
            opcode: "enableDisableSplitting",
            text: "turn auto-splitting [ONOFF]",
            blockType: Scratch.BlockType.COMMAND,
            arguments: {
              ONOFF: {
                type: Scratch.ArgumentType.STRING,
                menu: "onoff",
              },
            },
          },
          {
            opcode: "splittingOffset",
            text: "set auto-split offset to [PX] pixels",
            blockType: Scratch.BlockType.COMMAND,
            arguments: {
              PX: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 40,
              },
            },
          },
          {
            opcode: "placement169",
            text: "[SIDE] x placement",
            blockType: Scratch.BlockType.REPORTER,
            disableMonitor: true,
            arguments: {
              SIDE: {
                type: Scratch.ArgumentType.STRING,
                menu: "side",
              },
            },
          },
          "---", // HEADSET POSITION
          {
            opcode: "positionReset",
            text: "when position reset",
            blockType: Scratch.BlockType.HAT,
            isEdgeActivated: false,
          },
          {
            opcode: "headsetPosition",
            text: "headset position [VECTOR3]",
            blockType: Scratch.BlockType.REPORTER,
            disableMonitor: true,
            arguments: {
              VECTOR3: {
                type: Scratch.ArgumentType.STRING,
                menu: "vector3",
              },
            },
          },
          {
            opcode: "headsetRotation",
            text: "headset rotation [VECTOR3]",
            blockType: Scratch.BlockType.REPORTER,
            disableMonitor: true,
            arguments: {
              VECTOR3: {
                type: Scratch.ArgumentType.STRING,
                menu: "vector3",
              },
            },
          },
          "---", // CONTROLLER INPUT
          {
            opcode: "controllerPosition",
            text: "#[COUNT] controller's position [VECTOR3]",
            blockType: Scratch.BlockType.REPORTER,
            disableMonitor: true,
            arguments: {
              COUNT: {
                type: Scratch.ArgumentType.STRING,
                menu: "side",
              },
              VECTOR3: {
                type: Scratch.ArgumentType.STRING,
                menu: "vector3",
              },
            },
          },
          {
            opcode: "controllerRotation",
            text: "#[COUNT] controller's rotation [VECTOR3]",
            blockType: Scratch.BlockType.REPORTER,
            disableMonitor: true,
            arguments: {
              COUNT: {
                type: Scratch.ArgumentType.STRING,
                menu: "side",
              },
              VECTOR3: {
                type: Scratch.ArgumentType.STRING,
                menu: "vector3",
              },
            },
          },
        ],
        menus: {
          vector3: {
            acceptReporters: true,
            items: ["x", "y", "z"].map((item) => ({ text: item, value: item })),
          },
          count: {
            acceptReporters: true,
            items: ["1", "2"].map((item) => ({ text: item, value: item })),
          },
          side: {
            acceptReporters: false,
            items: ["left", "right"].map((item) => ({
              text: item,
              value: item,
            })),
          },
          onoff: {
            acceptReporters: false,
            items: ["on", "off"].map((item) => ({ text: item, value: item })),
          },
        },
      };
    }

    // menus
    _isVector3Menu(option) {
      const normalized = Cast.toString(option).toLowerCase().trim();
      return ["x", "y", "z"].includes(normalized);
    }
    _onOffBoolean(onoff) {
      const normalized = Cast.toString(onoff).toLowerCase().trim();
      return normalized === "on";
    }

    // util
    _getCanvas() {
      if (!this.runtime) return;
      if (!this.runtime.renderer) return;
      return this.runtime.renderer.canvas;
    }
    _getContext() {
      if (!this.runtime) return;
      if (!this.runtime.renderer) return;
      return this.runtime.renderer.gl;
    }
    _getRenderer() {
      if (!this.runtime) return;
      return this.runtime.renderer;
    }

    _disposeImmersive() {
      this.session = null;
      const gl = this._getContext();
      if (!gl) return;
      // bind frame buffer to canvas
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      // reset renderer info
      const renderer = this._getRenderer();
      if (!renderer) return;
      renderer.xrEnabled = false;
      renderer.xrSplitting = false;
      renderer.xrLayer = null;
    }

    _makeSquare() {
      const width = Scratch.Cast.toNumber(Scratch.vm.runtime.stageWidth);
      const height = Scratch.Cast.toNumber(Scratch.vm.runtime.stageHeight);
      if (width > height) {
        Scratch.vm.setStageSize(width, width);
      } else {
        Scratch.vm.setStageSize(height, height);
      }
    }

    async _createImmersive() {
      if (!("xr" in navigator)) return false;
      const gl = this._getContext();
      if (!gl) return;
      const renderer = this._getRenderer();
      if (!renderer) return;

      //Make the resolution square so the player has the best experience.
      this._makeSquare();

      await gl.makeXRCompatible();
      const session = await navigator.xr.requestSession(SESSION_TYPE);
      this.session = session;
      this.open = true;

      renderer.xrEnabled = true;
      renderer.xrSplitting = this.splitState;

      // we need to make sure stuff is back to normal once the vr session is done
      // but this isnt always triggered by the close session block
      // the user can also close it themselves, so we need to handle that
      // this is also triggered by the close session block btw so we dont need
      // to repeat
      session.addEventListener("end", () => {
        this.open = false;
        this._disposeImmersive();
      });

      // set render state to use a new layer for the vr session
      // renderer will handle this
      const layer = new XRWebGLLayer(session, gl, {
        alpha: true,
        stencil: true,
        antialias: false,
      });
      session.updateRenderState({
        baseLayer: layer,
      });
      renderer.xrLayer = layer;
      // for debugging & other extensions, never used by the renderer
      renderer._xrSession = session;

      // setup render loop
      const drawFrame = (_, frame) => {
        // breaks the loop once the session has ended
        if (!this.open) return;
        // get view info
        const viewerPose = frame.getViewerPose(this.localSpace);

        //Make sure 100% that there is a viewerpose. if there isn't we aren't tracking. so don't do anything.
        if (viewerPose) {
          const transform = viewerPose.transform;
          // set view info
          this.view = {
            position: [
              transform.position.x,
              transform.position.y,
              transform.position.z,
            ],
            quaternion: [
              transform.orientation.w,
              transform.orientation.y,
              transform.orientation.x,
              transform.orientation.z,
            ],
          };
        }

        //Get inputs and loop through the sources
        const inputSources = this.session.inputSources;
        if (inputSources) {
          let extras = 1;
          for (
            let controllerID = 0;
            controllerID < inputSources.length;
            controllerID++
          ) {
            const controller = inputSources[controllerID];
            if (controller.gripSpace) {
              //Skip controller if there is no transform or grip pose.
              const gripPose = frame.getPose(
                controller.targetRaySpace,
                this.localSpace
              );
              if (!gripPose) continue;
              const transform = gripPose.transform;
              if (!transform) continue;

              if (controller.handedness != "none") {
                this.controllerIds[controller.handedness] = {
                  position: [
                    transform.position.x,
                    transform.position.y,
                    transform.position.z,
                  ],
                  quaternion: [
                    transform.orientation.w,
                    transform.orientation.y,
                    transform.orientation.x,
                    transform.orientation.z,
                  ],
                };
              }
              //Just incase we want to add extra controllers in the future.
              else {
                //Might use this funcitonality later.
                this.controllerIds["extra " + extras] = {
                  position: [
                    transform.position.x,
                    transform.position.y,
                    transform.position.z,
                  ],
                  quaternion: [
                    transform.orientation.w,
                    transform.orientation.y,
                    transform.orientation.x,
                    transform.orientation.z,
                  ],
                };
                extras += 1;
              }
            }
          }
        }
        // force renderer to draw a new frame
        // otherwise we would only actually draw outside of this loop
        // which just ends up showing nothing
        // since rendering only happens in session.requestAnimationFrame
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        renderer.dirty = true;
        renderer.draw();
        // loop again
        session.requestAnimationFrame(drawFrame);
      };
      session.requestAnimationFrame(drawFrame);

      // reference space
      session.requestReferenceSpace("local").then((space) => {
        this.localSpace = space;
        // Added the hat!
        space.addEventListener("reset", () => {
          this.runtime.startHats("jgVr_positionReset");
        });
      });

      return session;
    }

    positionReset() {
      return true;
    }

    // blocks
    isSupported() {
      if (!("xr" in navigator)) return false;
      return navigator.xr.isSessionSupported(SESSION_TYPE);
    }
    isOpened() {
      return this.open;
    }

    createSession() {
      if (this.open) return;
      if (this.session) return;
      return this._createImmersive();
    }
    closeSession() {
      this.open = false;
      if (!this.session) return;
      return this.session.end();
    }

    // splitting blocks
    enableDisableSplitting(args) {
      const renderer = this._getRenderer();
      if (!renderer) return;

      const boolean = this._onOffBoolean(args.ONOFF);
      this.splitState = boolean;
      // setting xrSplitting outside of XR mode WILL work
      // so prevent this by just checking if we ARE in XR rendering mode
      if (!renderer.xrEnabled) return;
      renderer.xrSplitting = this.splitState;
    }
    splittingOffset(args) {
      const renderer = this._getRenderer();
      if (!renderer) return;

      // pixels should be negative
      // otherwise we push away from the center
      const pixels = Cast.toNumber(args.PX);
      renderer.xrSplitOffset = 0 - pixels;
    }

    // inputs
    headsetPosition(args) {
      if (!this.open) return 0;
      if (!this.session) return 0;
      if (!this.view) return 0;
      const vector3 = Cast.toString(args.VECTOR3).toLowerCase().trim();
      if (!this._isVector3Menu(vector3)) return 0;
      const axisArray = ["x", "y", "z"];
      const idx = axisArray.indexOf(vector3);
      return this.view.position[idx] * 100;
    }
    headsetRotation(args) {
      if (!this.open) return 0;
      if (!this.session) return 0;
      if (!this.view) return 0;
      const vector3 = Cast.toString(args.VECTOR3).toLowerCase().trim();
      if (!this._isVector3Menu(vector3)) return 0;
      const axisArray = ["x", "y", "z"];
      const idx = axisArray.indexOf(vector3);
      const quaternion = this.view.quaternion;
      const euler = quaternionToEuler(quaternion);
      return toDeg(euler[idx]);
    }

    _findController(controllerHand) {
      for (
        let controllerID = 0;
        controllerID < this.session.inputSources.length;
        controllerID++
      ) {
        const controller = this.session.inputSources[controllerID];

        if (controller.handedness == controllerHand) {
          this.controllerIds[controllerHand] = controllerID;
          return controllerID;
        }
      }
    }

    controllerPosition(args) {
      if (!this.open) return 0;
      if (!this.session) return 0;
      if (!this.view) return 0;

      let controllerID = this.controllerIds[args.COUNT];
      if (!controllerID) throw "controller doesn't exist.";

      const vector3 = Cast.toString(args.VECTOR3).toLowerCase().trim();
      if (!this._isVector3Menu(vector3)) return 0;
      const axisArray = ["x", "y", "z"];
      const idx = axisArray.indexOf(vector3);
      return controllerID.position[idx] * 100;
    }

    controllerRotation(args) {
      if (!this.open) return 0;
      if (!this.session) return 0;
      if (!this.view) return 0;

      let controllerID = this.controllerIds[args.COUNT];
      if (!controllerID) throw "controller doesn't exist.";

      const vector3 = Cast.toString(args.VECTOR3).toLowerCase().trim();
      if (!this._isVector3Menu(vector3)) return 0;
      const axisArray = ["x", "y", "z"];
      const idx = axisArray.indexOf(vector3);
      const quaternion = controllerID.quaternion;
      const euler = quaternionToEuler(quaternion);
      return toDeg(euler[idx]);
    }

    // helper
    placement169(args) {
      const side = Cast.toString(args.SIDE).toLowerCase().trim();

      const width = this.runtime.stageWidth;
      const multX = width / 640;

      // this was found with experimentation
      // please tell me if stuff needs to be added for certain cases
      const valueR = (640 / 4 - 40) * multX;
      const valueL = 0 - valueR;

      if (side === "right") {
        return valueR;
      }
      return valueL;
    }
  }

  Scratch.extensions.register(new jgVr());
})(Scratch);
