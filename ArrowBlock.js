// this extension and the patch are licensed under LGPLv3 & MIT license.
(function (Scratch) {
  // patch works in turbowarp, penguinmod, gandi ide + ccw, and scratch
  const state = {
    unsandboxed: Scratch.extensions.unsandboxed,
    GandiIDE: false,
    Scratch: false,
    TurboWarp: false,
    vm: null,
    ScratchBlocks: null,
  };
  state.GandiIDE = Scratch.extensions.register.toString().includes('gandiExtObj');
  if (typeof state.unsandboxed === 'boolean' && !state.unsandboxed) {
    throw new Error(`"Custom ScratchBlocks Shape Test" must be ran unsandboxed.`);
  }
  const extId = '0znzwCustomBlockArgs';
  if (document.getElementById('app')) {
    // simple Scratch support
    (window.ScratchZ = class {
      constructor() {
        (this.c_gbw = 'gui_blocks-wrapper'), (this.__rc = '__reactContainer'), (this.__rii = '__reactInternalInstance$');
        const t = window.Scratch || {};
        (this.BlockType = t?.BlockType || {
          BOOLEAN: 'Boolean',
          BUTTON: 'button',
          LABEL: 'label',
          COMMAND: 'command',
          CONDITIONAL: 'conditional',
          EVENT: 'event',
          HAT: 'hat',
          LOOP: 'loop',
          REPORTER: 'reporter',
          XML: 'xml',
        }),
          (this.ArgumentType = t?.ArgumentType || {
            ANGLE: 'angle',
            BOOLEAN: 'Boolean',
            COLOR: 'color',
            NUMBER: 'number',
            STRING: 'string',
            MATRIX: 'matrix',
            NOTE: 'note',
            IMAGE: 'image',
            COSTUME: 'costume',
            SOUND: 'sound',
          }),
          (this.TargetType = t?.TargetType || { SPRITE: 'sprite', STAGE: 'stage' });
      }
      get on_projectPage() {
        return 'object' == typeof this.ReduxState?.scratchGui;
      }
      get on_homePage() {
        return 'object' == typeof this.ReduxState?.splash;
      }
      get on_profilePage() {
        return !!app?.profileModel?.getId?.();
      }
      get on_messagesPage() {
        return 'string' == typeof this.ReduxState?.messages?.status?.clear && !this.on_homePage;
      }
      get gbWrapper() {
        return document.querySelector(`[class^="${this.c_gbw}"]`);
      }
      get containerKey() {
        return (Object.keys(app) || []).find((t) => t.startsWith(this.__rc));
      }
      get instanceKey() {
        return Object.keys(this.gbWrapper || {}).find((t) => t.startsWith(this.__rii));
      }
      get ReduxState() {
        return app[this.containerKey]?.child?.stateNode?.store?.getState?.();
      }
      get vm() {
        return window.vm || this.ReduxState?.scratchGui?.vm;
      }
      get Blocks() {
        if ('object' == typeof window?.ScratchBlocks) return window.ScratchBlocks;
        const t = Object.entries(this.gbWrapper || {}).find((t) => t[0].startsWith(this.__rii))?.[1];
        if (!t) return;
        let e = t;
        for (; e && !e?.stateNode?.ScratchBlocks; ) e = e.child;
        return e.stateNode.ScratchBlocks;
      }
    }),
      (window.ScratchZ = new window.ScratchZ());
    if (typeof ScratchZ.ReduxState?.scratchGui?.tw === 'object') state.TurboWarp = true;
    else state.Scratch = true;
    state.vm = ScratchZ.vm;
    state.ScratchBlocks = ScratchZ.Blocks;
  }
  if (typeof (window.chibi ?? window.eureka) === 'object') console.log('Hello eureka!!');

  /**
   * Please dont modify, redistribute or open source this file, it is not ready for production, please keep it closed source.
   * Registers a custom block+argument shape.
   * @argument {String} argName_ Name of the argument.
   * @argument {String} argId_ Internal shape id of the argument. (boolean: 1, reporter: 2, square: 3)
   * @argument {Object} paths_ Paths object with all the needed paths for the block.
   * @argument {Object} paddings_ Paddings object with all the needed paddings for the block.
   * @argument {Array} types_ Valid types for this argument.
   * @argument {ScratchBlocks||Blockly} ScratchBlocks instance.
   * @argument {Scratch} Scratch object passed to extensions.
   * This is licensed under LGPLv3 & mit license
   */
  const registerScratchBlocksShape = function (argName_, argId_, paths_, paddings_, types_, Blockly, Scratch) {
    /**! All code by Ashime { https://github.com/Ashimee }               */
    /**! Do not ask me how to make the paths, I honestly have no idea :I */
    /**! This is licensed under LGPLv3 & mit license                     */
    /**! AND DO NOT REMOVE THIS COMMENT                                  */
    const argPath_ = paths_.argumentPath(Blockly.BlockSvg.GRID_UNIT);
    const blockPath_L = paths_.leftBlockPath;
    const blockPath_R = paths_.rightBlockPath;
    const { ArgumentType, BlockType } = Scratch;
    let argName_L = argName_.toLowerCase();
    const argName_U = argName_.toUpperCase();
    const argName_T = `${argName_U.at(0)}${argName_L.substr(1, Infinity)}`;
    // This fixed some issues, I dont know how or why but it fixed them.
    argName_L = argName_T;
    BlockType[argName_U] = argName_T;
    ArgumentType[argName_U] = argName_L;
    types_ = types_ ?? [];
    if (!Array.isArray(types_)) types_ = [];
    types_.push(argName_T);
    const OUTPUT_SHAPE_ARGNAME_NUM = argId_;
    const OUTPUT_SHAPE_ARGNAME_STR = `OUTPUT_SHAPE_${argName_U}`;
    const INPUT_SHAPE_ARGNAME_NUM = argId_;
    const INPUT_SHAPE_ARGNAME_STR = `INPUT_SHAPE_${argName_U}`;
    const output_argname_str = `output_${argName_L}`;
    Blockly[OUTPUT_SHAPE_ARGNAME_STR] = OUTPUT_SHAPE_ARGNAME_NUM;
    Blockly.Extensions.register(output_argname_str, function () {
      this.setInputsInline(true);
      this.setOutputShape(OUTPUT_SHAPE_ARGNAME_NUM);
      this.setOutput(true, argName_T);
    });
    /**
     * SVG path for an empty argName_U input shape.
     * @const
     */
    Blockly.BlockSvg[INPUT_SHAPE_ARGNAME_STR] = argPath_;

    const INPUT_SHAPE_ARGNAME_WIDTH_STR = `INPUT_SHAPE_${argName_U}_WIDTH`;
    const INPUT_SHAPE_ARGNAME_WIDTH_NUM = 12 * Blockly.BlockSvg.GRID_UNIT;
    /**
     * Width of empty object input shape.
     * @const
     */
    Blockly.BlockSvg[INPUT_SHAPE_ARGNAME_WIDTH_STR] = INPUT_SHAPE_ARGNAME_WIDTH_NUM;

    function updatePadToGu(pad) {
      for (const key of Object.keys(pad)) {
        pad[key] = pad[key] * Blockly.BlockSvg.GRID_UNIT;
      }
      return pad;
    }
    for (const key of Object.keys(Blockly.BlockSvg.SHAPE_IN_SHAPE_PADDING)) {
      const padObj = Blockly.BlockSvg.SHAPE_IN_SHAPE_PADDING[key];
      padObj[argId_.toString()] = paddings_[key];
    }
    Blockly.BlockSvg.SHAPE_IN_SHAPE_PADDING[argId_.toString()] = updatePadToGu(paddings_[argId_]);
    const computeInputWidth_ = Blockly.BlockSvg.prototype.computeInputWidth_;
    Blockly.BlockSvg.prototype.computeInputWidth_ = function (input) {
      if (input.type == Blockly.INPUT_VALUE && (!input.connection || !input.connection.isConnected())) {
        if (input.connection.getOutputShape() == OUTPUT_SHAPE_ARGNAME_NUM) return INPUT_SHAPE_ARGNAME_WIDTH_NUM;
      }
      return computeInputWidth_.call(this, input);
    };
    const renderClassify_ = Blockly.BlockSvg.prototype.renderClassify_;
    Blockly.BlockSvg.prototype.renderClassify_ = function () {
      const res = renderClassify_.call(this);
      let shapes = this.svgGroup_.getAttribute('data-shapes').split(' ');
      if (this.edgeShape_ == OUTPUT_SHAPE_ARGNAME_NUM) {
        shapes.push(argName_L);
      }
      this.svgGroup_.setAttribute('data-shapes', shapes.join(' '));
      return res;
    };
    const getInputShapeInfo_ = Blockly.BlockSvg.getInputShapeInfo_;
    Blockly.BlockSvg.getInputShapeInfo_ = function (shape) {
      const res = getInputShapeInfo_.call(this, shape);
      if (shape == OUTPUT_SHAPE_ARGNAME_NUM) {
        res.inputShapePath = argPath_;
        res.inputShapeWidth = INPUT_SHAPE_ARGNAME_WIDTH_NUM;
        res.inputShapeArgType = argName_L;
        res.path = argPath_;
        res.width = INPUT_SHAPE_ARGNAME_WIDTH_NUM;
        res.argType = argName_L;
      }
      return res;
    };
    const getOutputShape = Blockly.Connection.prototype.getOutputShape;
    Blockly.Connection.prototype.getOutputShape = function () {
      if (this.check_ && this.check_.indexOf(argName_T) !== -1) {
        return OUTPUT_SHAPE_ARGNAME_NUM;
      }
      return getOutputShape.call(this);
    };
    const renderDraw_ = Blockly.BlockSvg.prototype.renderDraw_;
    Blockly.BlockSvg.prototype.renderDraw_ = function (iconWidth, inputRows) {
      const res = renderDraw_.call(this, iconWidth, inputRows);
      if (this.outputConnection) {
        var shape = this.getOutputShape();
        if (shape !== Blockly.OUTPUT_SHAPE_SQUARE) {
          this.edgeShapeWidth_ = inputRows.bottomEdge / 2;
          this.edgeShape_ = shape;
          this.squareTopLeftCorner_ = true;
        }
      }
      var steps = [];

      this.renderDrawTop_(steps, inputRows.rightEdge);
      var cursorY = this.renderDrawRight_(steps, inputRows, iconWidth);
      this.renderDrawBottom_(steps, cursorY);
      this.renderDrawLeft_(steps);

      var pathString = steps.join(' ');
      this.svgPath_.setAttribute('d', pathString);

      if (this.RTL) {
        this.svgPath_.setAttribute('transform', 'scale(-1 1)');
      }
    };
    const renderDrawLeft_ = Blockly.BlockSvg.prototype.renderDrawLeft_;
    Blockly.BlockSvg.prototype.renderDrawLeft_ = function (steps) {
      renderDrawLeft_.call(this, steps);
      if (this.edgeShape_ == OUTPUT_SHAPE_ARGNAME_NUM) {
        const path = blockPath_L(this.edgeShapeWidth_);
        steps.pop(steps.length - 1);
        steps.push(path);
      }
    };
    const drawEdgeShapeRight_ = Blockly.BlockSvg.prototype.drawEdgeShapeRight_;
    Blockly.BlockSvg.prototype.drawEdgeShapeRight_ = function (steps) {
      drawEdgeShapeRight_.call(this, steps);
      if (this.edgeShape_ && this.edgeShape_ == OUTPUT_SHAPE_ARGNAME_NUM) {
        const path = blockPath_R(this.edgeShapeWidth_);
        steps.push(path);
      }
    };
    vm.runtime.CustomArgumentTypeMap = vm.runtime.CustomArgumentTypeMap ?? {};
    vm.runtime.CustomArgumentTypeMap[argName_L] = {
      check: types_,
    };
    /**
     * Escape a string to be safe to use in XML content.
     * CC-BY-SA: hgoebl
     * https://stackoverflow.com/questions/7918868/
     * how-to-escape-xml-entities-in-javascript
     * @param {!string | !Array.<string>} unsafe Unsafe string.
     * @return {string} XML-escaped string, for use within an XML tag.
     */
    vm.runtime.xmlEscape = function (unsafe) {
      if (typeof unsafe !== 'string') {
        if (Array.isArray(unsafe)) {
          // This happens when we have hacked blocks from 2.0
          // See #1030
          unsafe = String(unsafe);
        } else {
          console.error('Unexpected input recieved in replaceUnsafeChars');
          return unsafe;
        }
      }
      return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case '<':
            return '&lt;';
          case '>':
            return '&gt;';
          case '&':
            return '&amp;';
          case "'":
            return '&apos;';
          case '"':
            return '&quot;';
        }
      });
    };
    const _convertPlaceholders = vm.runtime._convertPlaceholders;
    vm.runtime._convertPlaceholders = function (context, match, placeholder) {
      const res = _convertPlaceholders.call(this, context, match, placeholder);
      // Determine whether the argument type is one of the known standard field types
      const argInfo = context.blockInfo.arguments[placeholder] || null;
      const argTypeInfo = this.CustomArgumentTypeMap[argInfo.type] || null;
      if (!argInfo || !argTypeInfo) return res;
      const argsName = `args${context.outLineNum}`;
      const argNum = context.argsMap[placeholder] - 1;
      let FinalArgInfo = context.blockJSON[argsName][argNum];
      FinalArgInfo = { ...FinalArgInfo, ...argTypeInfo };
      context.blockJSON[argsName][argNum] = FinalArgInfo;
      return res;
    }.bind(vm.runtime);
    const _convertBlockForScratchBlocks = vm.runtime._convertBlockForScratchBlocks;
    vm.runtime._convertBlockForScratchBlocks = function (blockInfo, categoryInfo) {
      const res = _convertBlockForScratchBlocks.call(this, blockInfo, categoryInfo);
      if (blockInfo.blockType == argName_T) {
        res.json.output = argName_T;
        res.json.outputShape = OUTPUT_SHAPE_ARGNAME_NUM;
      }
      return res;
    };
    window['argShapeDebug_' + argName_T] = {
      argName_,
      argId_,
      paths_,
      argName_L,
      argName_U,
      argName_T,
      OUTPUT_SHAPE_ARGNAME_STR,
      OUTPUT_SHAPE_ARGNAME_NUM,
      INPUT_SHAPE_ARGNAME_STR,
      INPUT_SHAPE_ARGNAME_NUM,
      output_argname_str,
      INPUT_SHAPE_ARGNAME_WIDTH_STR,
      INPUT_SHAPE_ARGNAME_WIDTH_NUM,
    };
  };

  const ArgId = 50;
  const ArgIdU = 'Arrow';
  function patch() {
    if (!window.ScratchBlocks) vm.once('afterExecute', patch);
    const _cbfsb = vm.runtime._convertBlockForScratchBlocks.bind(vm.runtime);
    vm.runtime._convertBlockForScratchBlocks = function (blockInfo, categoryInfo) {
      const res = _cbfsb(blockInfo, categoryInfo);
      if (blockInfo.output) res.json.output = blockInfo.output;
      if (blockInfo.outputShape) res.json.outputShape = blockInfo.outputShape;
      return res;
    };
    // Registering the new Argument/Block shape.
    const Blockly = ScratchBlocks;
    // thanks for the paths, thx very much Cubester!!
    const Paths = {
      argumentPath: function (GRID_UNIT) {
        return ('M ' + 4 * GRID_UNIT + ',0 ' +
  ' h ' + 4 * GRID_UNIT +
  ' l ' + 4 * GRID_UNIT + ',' + 4 * GRID_UNIT +
  ' l ' + -4 * GRID_UNIT + ',' + 4 * GRID_UNIT +
  ' h ' + -4 * GRID_UNIT +
  ' l ' + 2 * GRID_UNIT + ' ' + -4 * GRID_UNIT +
  ' l ' + -2 * GRID_UNIT + ' ' + -4 * GRID_UNIT +
  ' z');
      },
      leftBlockPath: function (edgeShapeWidth_) {
        return ('h ' + -edgeShapeWidth_ +
        ' l ' + edgeShapeWidth_ / 2 + ' ' + -edgeShapeWidth_ +
        ' l ' + -edgeShapeWidth_ / 2 + ' ' + -edgeShapeWidth_ +
        ' h ' + edgeShapeWidth_);
      },
      rightBlockPath: function (edgeShapeWidth_) {
        return ('l ' + edgeShapeWidth_ + ' ' + edgeShapeWidth_ +
        ' l ' + -edgeShapeWidth_ + ' ' + edgeShapeWidth_);
      },
    };
    const GetPaddings = (padId) => {
      const paddings = {
        1: 5, // argName_L in Boolean.
        2: 3, // argName_L in Reporter.
        3: 2, // argName_L in Square.
      };
      paddings[padId] = {
        // Outer shape: argName_L.
        0: 5, // Field in argName_L.
        1: 2, // Hexagon in argName_L.
        2: 5, // Round in argName_L.
        3: 5, // Square in argName_L.
      };
      paddings[padId][padId] = 2; // argName_L in argName_L.
      return paddings;
    };
    registerScratchBlocksShape(ArgIdU, ArgId, Paths, GetPaddings(ArgId), [], ScratchBlocks, Scratch);
  }

  // I know the output is always argName_T so i will set it here so I can prevent some errors.
  Scratch.BlockType[ArgIdU] = 'Arrow';
  Scratch.ArgumentType[ArgIdU] = 'Arrow';

  // start state data for the extension
  const extState = {
    getInfo() {
      return {
        id: extId,
        name: 'Custom Block+Argument Shapes',
        color1: '#9999FF',
        blocks: [
          {
            opcode: 'block',
            blockType: Scratch.BlockType.REPORTER,
            text: 'block',
            output: Scratch.ArgumentType[ArgIdU],
            outputShape: ArgId,
          },
          {
            opcode: 'arg',
            blockType: Scratch.BlockType.REPORTER,
            text: 'argument [val]',
            arguments: {
              val: {
                type: Scratch.ArgumentType[ArgIdU],
              },
            },
          },
          {
            opcode: 'arg_block',
            blockType: Scratch.BlockType.REPORTER,
            text: '[val]',
            arguments: {
              val: {
                type: Scratch.ArgumentType[ArgIdU],
              },
            },
            output: Scratch.ArgumentType[ArgIdU],
            outputShape: ArgId,
          },
          {
            opcode: 'arg_block_text',
            blockType: Scratch.BlockType.REPORTER,
            text: 'yoo [val] it works',
            arguments: {
              val: {
                type: Scratch.ArgumentType[ArgIdU],
              },
            },
            output: Scratch.ArgumentType[ArgIdU],
            outputShape: ArgId,
          },
        ],
        menus: {},
      };
    },
    fns: [
      function arg(args) {
        return args.val;
      },
      function block() {
        return;
      },
      function arg_block(args) {
        return args.val;
      },
      function arg_block_test(args) {
        return args.val;
      },
    ],
  };
  // end state data for objects extension

  class ext {
    constructor(runtime) {
      // GandiIDE is special needs.
      if (state.GandiIDE) {
        // thanks FurryR for this hack to get the vm.
        this.runtime = runtime;
        let virtualMachine = undefined;
        if (this.runtime._events['QUESTION'] instanceof Array) {
          for (const value of this.runtime._events['QUESTION']) {
            const v = this.hijack(value);
            if (v?.props?.vm) {
              virtualMachine = v?.props?.vm;
              break;
            }
          }
        } else if (this.runtime._events['QUESTION']) {
          virtualMachine = this.hijack(this.runtime._events['QUESTION'])?.props?.vm;
        }
        if (!virtualMachine) throw new Error('Cannot get Virtual Machine instance.');
        state.vm = virtualMachine;
        state.ScratchBlocks = state.vm.runtime.scratchBlocks;
      }
      // Exposing the stuff
      Scratch.vm = state.vm;
      if (typeof window.vm !== 'object') window.vm = state.vm;
      if (typeof window.ScratchBlocks !== 'object') window.ScratchBlocks = state.ScratchBlocks;
      // Patching!
      patch();
    }
    getInfo() {
      return extState.getInfo.apply(this);
    }
    // internal utilitys (GandiIDE)
    hijack(fn) {
      const _orig = Function.prototype.apply;
      Function.prototype.apply = function (thisArg) {
        return thisArg;
      };
      const result = fn();
      Function.prototype.apply = _orig;
      return result;
    }
  }
  for (const fn of extState.fns) {
    ext.prototype[fn.name] = fn.bind(ext.prototype);
  }

  if (!state.GandiIDE) Scratch.extensions.register(new ext());
  else {
    window.tempExt = {
      Extension: ext,
      info: {
        name: 'hcn.extensionName',
        description: 'hcn.description',
        extensionId: extId,
        featured: true,
        disabled: false,
        collaborator: 'only for hcn test',
      },
      l10n: {
        'zh-cn': {
          'hcn.extensionName': '',
          'hcn.description': '',
        },
        en: {
          'hcn.extensionName': '',
          'hcn.description': '',
        },
      },
    };
  }
})(Scratch);
