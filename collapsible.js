(function (Scratch) {
  "use strict";
  if (!Scratch.extensions.unsandboxed) throw new Error("SPadvControl2 Extension must run unsandboxed!");

  const vm = Scratch.vm;
  const runtime = vm.runtime;

  class SPadvControl2 {
    getInfo() {
      return {
        id: "SPadvControl2",
        name: "Test",
        blocks: [
          {
            opcode: "test",
            blockType: Scratch.BlockType.CONDITIONAL,
            text: ["(compressed) if [CON] then", "else"],
            extensions: ["colours_control"],
            branchCount: 2,
            arguments: {
              CON: { type: Scratch.ArgumentType.BOOLEAN }
            },
          },
          {
            func: "compress",
            blockType: Scratch.BlockType.BUTTON,
            text: "Compress Last Selected Block"
          },
        ],
      };
    }

    compress() {
      if (ScratchBlocks.selected) {
        const block = ScratchBlocks.selected;
        const inputs = block.inputList;
        for (let i = 0; i < inputs.length; i++) {
          if (inputs[i].name.includes("SUBSTACK")) {
            if (inputs[i].visible_) inputs[i].setVisible(false);
            else inputs[i].setVisible(true);
          }
        }
        ScratchBlocks.mainWorkspace.render();
      }
    }

    test(args, util) {
      const myID = util.thread.isCompiled ? util.thread.peekStack() : util.thread.peekStackFrame().op.id;
      const threadBlock = util.thread.blockContainer.getBlock(myID);
      if (!threadBlock) return;
      if (util.thread.stackClick && threadBlock.parent === null) {
        const block = ScratchBlocks.mainWorkspace.getBlockById(myID);
        const inputs = block.inputList;
        for (let i = 0; i < inputs.length; i++) {
          if (inputs[i].name.includes("SUBSTACK")) {
            if (inputs[i].visible_) inputs[i].setVisible(false);
            else inputs[i].setVisible(true);
          }
        }
        ScratchBlocks.mainWorkspace.render();
      } else {
        if (Scratch.Cast.toBoolean(args.CON)) util.startBranch(1, false);
        else util.startBranch(2, false);
      }
    }
  }

  Scratch.extensions.register(new SPadvControl2());
})(Scratch);