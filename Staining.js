(function(Scratch) {
    'use strict';
    if (!Scratch.extensions.unsandboxed) {
        throw new Error(`"Staining" extension must be ran unsandboxed.`);
    }

    const vm = Scratch.vm, runtime = vm.runtime, renderer = runtime.renderer;

    const cvt = {
        imageDataToElement(image) {
            return new Promise((resolve, reject) => {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = image.width;
                tempCanvas.height = image.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.putImageData(image.imageData, 0, 0);
                const tempImage = document.createElement('img');
                tempImage.style.display = 'none';
                document.body.appendChild(tempImage);
                tempImage.onload = function() {
                    resolve(tempImage);
                };
                tempImage.src = tempCanvas.toDataURL();
            });
        },
        async overlayData(imageData1, imageData2, imgd2x, imgd2y, gco) {
            imgd2x = imgd2x ?? 0;
            imgd2y = imgd2y ?? 0;
            gco = gco ?? 'source-over';
            const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
            canvas.width = imageData1.width;
            canvas.height = imageData1.height;
            ctx.putImageData(imageData1.imageData, 0, 0);
            if (imgd2x === 'center') imgd2x = ((imageData1.width / 2) - (imageData2.width / 2));
            if (imgd2y === 'center') imgd2y = ((imageData1.height / 2) - (imageData2.height / 2));
            const tempImage = await cvt.imageDataToElement(imageData2);
            ctx.globalCompositeOperation = gco;
            ctx.drawImage(tempImage, imgd2x, imgd2y);
            tempImage.remove();
            tempImage.src = '';
            ctx.globalCompositeOperation = 'source-over';
            return canvas;
        },
        async overlaySprite(sprite1, imageData, sprite2x, sprite2y, stain) {
            sprite2x = sprite2x ?? 0;
            sprite2y = sprite2y ?? 0;
            stain = stain ?? false;
            const spriteData = renderer.extractDrawableScreenSpace(sprite1.drawableID);
            const image = await cvt.overlayData(spriteData, imageData, sprite2x, sprite2y, (stain ? 'source-atop' : undefined));
            return image;
        },
        async overlaySprites(sprite1, sprite2, sprite2x, sprite2y, stain) {
            sprite2x = sprite2x ?? 0;
            sprite2y = sprite2y ?? 0;
            stain = stain ?? false;
            const spriteData = renderer.extractDrawableScreenSpace(sprite2.drawableID);
            const image = await cvt.overlaySprite(sprite1, spriteData, sprite2x, sprite2y, (stain ? 'source-atop' : undefined));
            return image;
        },
    };
    // @ts-ignore DEBUGGING
    window._cvt = cvt;

    async function _createURLSkin(URL, rotationCenter) {
        let imageData;
        if (await Scratch.canFetch(URL)) {
            imageData = await Scratch.fetch(URL);
        } else {
            return '';
        }
        const contentType = imageData.headers.get('Content-Type');
        if (contentType === 'image/svg+xml') {
            return renderer.createSVGSkin(await imageData.text(), rotationCenter);
        } else if (
            contentType === 'image/png' ||
            contentType === 'image/jpeg' ||
            contentType === 'image/bmp'
        ) {
            // eslint-disable-next-line no-restricted-syntax
            const output = new Image();
            output.src = URL;
            output.crossOrigin = 'anonymous';
            await output.decode();
            return renderer.createBitmapSkin(output);
        }
    }

    const trapped = {};
    // @ts-ignore DEBUGGING
    window.trapped = trapped;
    async function onDrawableSkinUpdate(_swa, ...a) {
        // @ts-ignore
        const trap = trapped[this.id];
        if (!trap) return '';
        if (trap.justDid > 0) {
            if (trap.justDid == 2) trap.justDid = 0;
            trap.skin._silhouette.unlazy();
            return '';
        }
        // @ts-ignore
        const penDrawId = runtime.ext_pen?._penDrawableId;
        switch (trap.mode) {
            case 'layer':
                switch (trap.data.using) {
                    case 'pen':
                        trap.data.layer = renderer.extractDrawableScreenSpace(penDrawId);
                        trap.canvas = await cvt.overlaySprite(trap.data.sn1, trap.data.layer, trap.data.x, trap.data.y, true);
                        trap.imageData = await trap.canvas.toDataURL();
                        trap.skin = renderer._allSkins[await _createURLSkin(trap.imageData)];
                        trap.skin.new = true;
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
        // @ts-ignore
        const skin = this.skin, _silhouette = skin._silhouette, canvas = trap.canvas;
        this.skin = trap.skin;
        // eslint-disable-next-line no-restricted-syntax
        const tempImage = new Image();
        tempImage.width = canvas.width;
        tempImage.height = canvas.height;
        tempImage.src = trap.imageData;
        await tempImage.decode();
        trap.bmp = tempImage;
        _silhouette.update(trap.bmp);
        // @ts-ignore
        skin.updateSilhouette();
        _silhouette.unlazy();
        trap.justDid++;
        return _swa.call(this, ...a);
    }

    function trapSWA(target) {
        if (trapped[target.drawableID]) return;
        trapped[target.drawableID] = {};
        const self = renderer._allDrawables.find(drawable => drawable.id == target.drawableID);
        const _swa = self._skinWasAltered;
        self._skinWasAltered = function(...a) {
            return onDrawableSkinUpdate.call(this, _swa, ...a);
        };
    }

    class staining {
        getInfo() {
            return {
                id: '0znzwStaining',
                name: 'Staining',
                blocks: [{
                    opcode: 'stainUsingSprite',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'stain [sn1] using sprite [sn2] at x: [x] y: [y]',
                    arguments: {
                        sn1: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'sprites',
                            defaultValue: 'this sprite'
                        },
                        sn2: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'sprites',
                            defaultValue: vm.editingTarget.sprite.name
                        },
                        x: {
                            type: Scratch.ArgumentType.NUMBER,
                            menu: 'offs',
                            defaultValue: 0
                        },
                        y: {
                            type: Scratch.ArgumentType.NUMBER,
                            menu: 'offs',
                            defaultValue: 0
                        }
                    }
                }, {
                    opcode: 'stainUsingLayer',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'stain [sn1] using layer [layer] at x: [x] y: [y]',
                    arguments: {
                        sn1: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'sprites',
                            defaultValue: 'this sprite'
                        },
                        layer: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'layers',
                            defaultValue: 'pen'
                        },
                        x: {
                            type: Scratch.ArgumentType.NUMBER,
                            menu: 'offs',
                            defaultValue: 0
                        },
                        y: {
                            type: Scratch.ArgumentType.NUMBER,
                            menu: 'offs',
                            defaultValue: 0
                        }
                    }
                }, {
                    opcode: 'unstain',
                    blockType: Scratch.BlockType.COMMAND,
                    text: 'un-stain [sn1]',
                    arguments: {
                        sn1: {
                            type: Scratch.ArgumentType.STRING,
                            menu: 'sprites',
                            defaultValue: 'this sprite'
                        }
                    }
                }],
                menus: {
                    sprites: {
                        acceptReporters: true,
                        acceptText: true,
                        items: '_getSprites'
                    },
                    offs: {
                        acceptReporters: true,
                        acceptNumber: true,
                        items: ['center']
                    },
                    layers: {
                        acceptReporters: true,
                        acceptText: true,
                        items: '_layerOptions'
                    }
                }
            };
        }
        _getSprites() {
            const menu = [];
            if (!vm.editingTarget.isStage) menu.push({text: 'this sprite', value: '_myself_'});
            // if (!vm.editingTarget.isStage) menu.push({text: 'Stage', value: '_stage_'});
            for (const target of runtime.targets) {
                if (target.isOriginal && !target.isStage) menu.push({text: target.sprite.name, value: target.sprite.name});
            }
            if (menu.length < 1) menu.push({text: '', value: ''});
            return menu;
        }
        _layerOptions() {
            const menu = ['backdrop'];
            // @ts-ignore
            if (typeof runtime.ext_pen === 'object') menu.splice(0, 0, 'pen');
            return menu;
        }
        unstain({ sn1, justTrap }, util) {
            sn1 = Scratch.Cast.toString(sn1);
            justTrap = justTrap ?? false;
            switch (sn1) {
                case '_myself_':
                    sn1 = util.target;
                    break;
                case '_stage_':
                    sn1 = runtime.getTargetForStage();
                    break;
                default:
                    sn1 = runtime.getSpriteTargetByName(sn1);
                    if (!sn1) return '';
                    break;
            }
            const myDrawableId = sn1.drawableID, myDrawable = renderer._allDrawables[myDrawableId];
            const trap = trapped[myDrawableId];
            if (!trap) return '';
            const trapSkin = trap.skin, trapStartSkin = trap.startSkin;
            if (!justTrap) delete trap[myDrawableId];
            if (!trapStartSkin) return;
            myDrawable._skin = trapStartSkin;
            sn1.updateAllDrawableProperties();
        }
        stainUsingLayer({ sn1, layer, x, y }, util) {
            sn1 = Scratch.Cast.toString(sn1);
            let using = '', initSN1 = sn1;
            switch (sn1) {
                case '_myself_':
                    sn1 = util.target;
                    break;
                case '_stage_':
                    sn1 = runtime.getTargetForStage();
                    break;
                default:
                    sn1 = runtime.getSpriteTargetByName(sn1);
                    if (!sn1) return '';
                    break;
            }
            if (x !== 'center') x = Scratch.Cast.toNumber(x);
            if (y !== 'center') y = Scratch.Cast.toNumber(y);
            // @ts-ignore
            const penDrawId = runtime.ext_pen?._penDrawableId;
            switch (layer) {
                case 'pen':
                    if (!penDrawId || penDrawId === -1) return '';
                    using = 'pen';
                    layer = renderer.extractDrawableScreenSpace(penDrawId);
                    break;
                case 'backdrop':
                    using = 'backdrop';
                    break;
                default:
                    break;
            }
            const myDrawableId = sn1.drawableID, myDrawable = renderer._allDrawables[myDrawableId];
            trapSWA(sn1);
            const trap = trapped[myDrawableId];
            this.unstain({ sn1: initSN1, justTrap: true }, util);
            trap.justDid = false;
            trap.startSkin = myDrawable.skin;
            trap.skin = myDrawable.skin;
            trap.data = {
                sn1, layer, x, y, using
            };
            trap.mode = 'layer';
            sn1.updateAllDrawableProperties();
            trap.skin.emitWasAltered();
        }
        async stainUsingSprite({ sn1, sn2, x, y }, util) {
            trapSWA(util.target);
            // placeholder code
            await new Promise((resolve, reject) => resolve(0));
            return '';
        }
    }
    Scratch.extensions.register(new staining());
})(Scratch);