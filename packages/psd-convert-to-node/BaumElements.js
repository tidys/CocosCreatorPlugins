"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaumPrefabCreator = require("./BaumPrefabCreator");
const _ = require("lodash");
class ElementFactory {
    static Generate(json, parent) {
        let type = json["type"];
        if (type === "Root")
            return new RootElement(json, parent);
        else if (type === "Image")
            return new ImageElement(json, parent);
        else if (type === "Mask")
            return new MaskElement(json, parent);
        else if (type === "Group")
            return new GroupElement(json, parent);
        else if (type === "Text")
            return new TextElement(json, parent);
        else if (type === "Button")
            return new ButtonElement(json, parent);
        else if (type === "List")
            return new ListElement(json, parent);
        else if (type === "Slider")
            return new SliderElement(json, parent);
        else if (type === "Scrollbar")
            return new ScrollbarElement(json, parent);
        else if (type === "Toggle")
            return new ToggleElement(json, parent);
        else
            return new NullElement(json, parent);
    }
}
exports.ElementFactory = ElementFactory;
class Element {
    constructor(json, parent) {
        this.parent = parent;
        this.name = json["name"];
        if ("pivot" in json) {
            this.pivot = json["pivot"];
        }
        if ("stretchxy" in json ||
            "stretchx" in json ||
            (parent != null ? parent.stretchX : false)) {
            this.stretchX = true;
        }
        if ("stretchxy" in json ||
            "stretchy" in json ||
            (parent != null ? parent.stretchY : false)) {
            this.stretchY = true;
        }
        console.log("Element.constructor called!");
    }
    CreateUIGameObject(renderer) {
        let go = new cc.Node(this.name);
        return go;
    }
}
class GroupElement extends Element {
    constructor(json, parent, resetStretch = false) {
        super(json, parent);
        this.elements = new Array();
        let jsonElements = json["elements"];
        for (let jsonElement of jsonElements) {
            let x = this.stretchX;
            let y = this.stretchY;
            if (resetStretch) {
                this.stretchX = false;
                this.stretchY = false;
            }
            this.elements.push(ElementFactory.Generate(jsonElement, this));
            this.stretchX = x;
            this.stretchY = y;
        }
        this.elements.reverse();
        this.areaCache = this.CalcAreaInternal();
        console.log("GroupElement.constructor called!");
    }
    Render(renderer) {
        let go = this.CreateSelf(renderer);
        this.RenderChildren(renderer, go);
        /* FIXME:
        SetStretch(go, renderer);
        SetPivot(go, renderer);
        */
        // go.getComponentInChildren
        return go;
    }
    CreateSelf(renderer) {
        let go = this.CreateUIGameObject(renderer);
        let area = this.CalcArea();
        let anchoredPosition = renderer.CalcPosition(area.Min, area.Size);
        go.setContentSize(area.Size.x, area.Size.y);
        go.setPosition(anchoredPosition);
        return go;
    }
    RenderChildren(renderer, root, callback = null) {
        let scrollbar = null;
        let verticalScrollView = null;
        let horizontalScrollView = null;
        for (let element of this.elements) {
            let go = element.Render(renderer);
            // let rectTransform = go.GetComponent<RectTransform>();
            // let sizeDelta = rectTransform.sizeDelta;
            // FIXME:
            if (go.name === "Image1") {
                console.log(go.name);
            }
            go.setPosition(go.position.sub(root.position));
            root.addChild(go);
            // rectTransform.sizeDelta = sizeDelta;
            if (callback != null)
                callback(go, element);
            if (element instanceof ScrollbarElement) {
                scrollbar = go.getComponent(cc.Scrollbar);
                // scrollbar.direction
                console.log(scrollbar);
            }
            else if (element instanceof ListElement) {
                let scrollView = go.getComponent(cc.ScrollView);
                if (scrollView.vertical) {
                    verticalScrollView = scrollView;
                }
                else if (scrollView.horizontal) {
                    horizontalScrollView = scrollView;
                }
                console.log(scrollView);
            }
        }
        if (scrollbar != null) {
            if (verticalScrollView != null) {
                verticalScrollView.verticalScrollBar = scrollbar;
            }
            if (horizontalScrollView != null && verticalScrollView === null) {
                scrollbar.direction = cc.Scrollbar.Direction.HORIZONTAL;
                horizontalScrollView.horizontalScrollBar = scrollbar;
            }
        }
    }
    CalcAreaInternal() {
        let area = BaumPrefabCreator.Area.None();
        for (let element of this.elements) {
            let _tempCalcArea = element.CalcArea();
            area.Merge(_tempCalcArea);
        }
        return area;
    }
    CalcArea() {
        return this.areaCache;
    }
}
exports.GroupElement = GroupElement;
class RootElement extends GroupElement {
    constructor(json, parent) {
        super(json, parent);
        console.log("RootElement.constructor called!");
    }
    CreateSelf(renderer) {
        let go = this.CreateUIGameObject(renderer);
        this.sizeDelta = renderer.CanvasSize;
        go.setContentSize(this.sizeDelta.x, this.sizeDelta.y);
        let anchoredPosition = cc.Vec2.ZERO;
        return go;
    }
    CalcArea() {
        return new BaumPrefabCreator.Area(this.sizeDelta.mul(-0.5), this.sizeDelta.mul(0.5));
    }
}
exports.RootElement = RootElement;
class ButtonElement extends GroupElement {
    Render(renderer) {
        let go = this.CreateSelf(renderer);
        let lastImage = null;
        this.RenderChildren(renderer, go, (g, element) => {
            if (lastImage == null && element instanceof ImageElement) {
                lastImage = g.getComponent(cc.Sprite);
            }
        });
        let button = go.addComponent(cc.Button);
        button.transition = cc.Button.Transition.COLOR;
        if (lastImage != null) {
            button.target = lastImage.node;
        }
        return go;
    }
}
exports.ButtonElement = ButtonElement;
class ListElement extends GroupElement {
    constructor(json, parent) {
        super(json, parent);
        if ("scroll" in json) {
            this.scroll = json["scroll"];
        }
        console.log("ListElement.constructor called!");
    }
    Render(renderer) {
        let go = this.CreateSelf(renderer);
        let viewport = new cc.Node("Viewport");
        viewport.setContentSize(go.getContentSize());
        viewport.addComponent(cc.Mask);
        viewport.setParent(go);
        let content = new cc.Node("Content");
        content.setParent(viewport);
        this.SetupScroll(go, content);
        this.SetMaskImage(renderer, go, content);
        this.RenderChildren(renderer, go, (itemObject, element) => {
            this.CreateItem(itemObject, element, content);
        });
        // let items = this.CreateItems(renderer, content);
        /* FIXME:
        SetStretch(go, renderer);
        SetPivot(go, renderer);
        */
        return go;
    }
    SetupScroll(go, content) {
        let scrollView = go.addComponent(cc.ScrollView);
        scrollView.content = content;
        if (this.scroll === "vertical") {
            scrollView.vertical = true;
            scrollView.horizontal = false;
        }
        else if (this.scroll === "horizontal") {
            scrollView.vertical = false;
            scrollView.horizontal = true;
        }
    }
    SetMaskImage(renderer, go, content) {
        content.setContentSize(go.getContentSize());
        content.setPosition(cc.Vec2.ZERO);
        let maskImage = go.addComponent(cc.Sprite);
        let dummyMaskImage = this.CreateDummyMaskImage(renderer);
        let dummyMaskImageSprite = dummyMaskImage.getComponent(cc.Sprite);
        maskImage.spriteFrame = dummyMaskImageSprite.spriteFrame;
        maskImage.type = dummyMaskImageSprite.type;
        // go.color = cc.Color.TRANSPARENT;
        // go.opacity = 0;
        dummyMaskImage.destroy();
        return;
    }
    CreateDummyMaskImage(renderer) {
        let maskElement = _.find(this.elements, x => x instanceof ImageElement && x.name === "Area");
        if (typeof maskElement === "undefined") {
            cc.error(this.name + " Area not found");
            throw new Error("loading error");
        }
        _.remove(this.elements, x => x === maskElement);
        let maskImage = maskElement.Render(renderer);
        maskImage.active = false;
        return maskImage;
    }
    CreateItem(itemObject, element, content) {
        let item = null;
        if (element instanceof GroupElement === false) {
            cc.error(this.name + "'s element " + element.name + " is not group");
            throw new Error("loading error");
        }
        item = element;
        let widget = itemObject.addComponent(cc.Widget);
        itemObject.setParent(content);
        if (this.scroll === "vertical") {
            widget.isAlignTop = true;
        }
        console.log(itemObject);
    }
}
exports.ListElement = ListElement;
class SliderElement extends GroupElement {
    Render(renderer) {
        let go = this.CreateSelf(renderer);
        let fillRect = null;
        this.RenderChildren(renderer, go, (g, element) => {
            g.anchorX = 0;
            let widget = g.addComponent(cc.Widget);
            widget.isAlignLeft = true;
            widget.left = 0;
            console.log("test");
            /*
            if (lastImage == null && element instanceof ImageElement) {
              lastImage = g.getComponent(cc.Sprite);
            }
            */
        });
        // let button = go.addComponent(cc.Button);
        return go;
    }
}
exports.SliderElement = SliderElement;
class ScrollbarElement extends GroupElement {
    Render(renderer) {
        let go = this.CreateSelf(renderer);
        let handleRect = null;
        this.RenderChildren(renderer, go, (g, element) => {
            if (handleRect != null || element == null) {
                return;
            }
            if (element.name === "Handle") {
                handleRect = g.getComponent(cc.Sprite);
            }
        });
        let scrollbar = go.addComponent(cc.Scrollbar);
        scrollbar.direction = cc.Scrollbar.Direction.VERTICAL;
        scrollbar.enableAutoHide = false;
        if (handleRect != null) {
            handleRect.type = cc.Sprite.Type.SLICED;
            scrollbar.handle = handleRect;
        }
        return go;
    }
}
exports.ScrollbarElement = ScrollbarElement;
class ToggleElement extends GroupElement {
}
exports.ToggleElement = ToggleElement;
class TextElement extends Element {
    constructor(json, parent) {
        super(json, parent);
        this.message = json["text"];
        this.font = json["font"];
        this.fontSize = +json["size"];
        this.align = json["align"];
        this.type = json["textType"];
        if ("strokeSize" in json) {
            this.enableStroke = true;
            this.strokeSize = +json["strokeSize"];
            let strokeColor = cc.Color.BLACK;
            this.strokeColor = strokeColor.fromHEX("#" + json["strokeColor"]);
        }
        else {
            this.enableStroke = false;
        }
        let color = cc.Color.BLACK;
        this.fontColor = color.fromHEX("#" + json["color"]);
        this.canvasPosition = new cc.Vec2(json["x"], json["y"]);
        this.sizeDelta = new cc.Vec2(json["w"], json["h"]);
        this.virtualHeight = json["vh"];
    }
    Render(renderer) {
        let go = this.CreateUIGameObject(renderer);
        let anchoredPosition = renderer.CalcPosition(this.canvasPosition, this.sizeDelta);
        go.setContentSize(this.sizeDelta.x, this.sizeDelta.y);
        go.setPosition(anchoredPosition);
        let text = go.addComponent(cc.Label);
        text.string = this.message;
        text.verticalAlign = cc.Label.VerticalAlign.CENTER;
        text.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        let font = renderer.GetFont(this.font);
        if (font instanceof cc.TTFFont) {
            text.font = font;
            text.fontSize = Math.round(this.fontSize);
            text.lineHeight = this.virtualHeight;
            go.setContentSize(this.sizeDelta.x, this.virtualHeight);
            if (this.align === "left") {
                text.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
                go.setAnchorPoint(0, 0.5);
                go.setPosition(anchoredPosition.x - this.sizeDelta.x / 2.0, anchoredPosition.y);
            }
            else if (this.align === "center") {
                text.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
                go.setAnchorPoint(0.5, 0.5);
            }
            else if (this.align === "right") {
                text.horizontalAlign = cc.Label.HorizontalAlign.RIGHT;
                go.setAnchorPoint(1, 0.5);
                go.setPosition(anchoredPosition.x + this.sizeDelta.x / 2.0, anchoredPosition.y);
            }
            go.color = this.fontColor;
            if (this.enableStroke) {
                let outline = go.addComponent(cc.LabelOutline);
                outline.color = this.strokeColor;
                outline.width = this.strokeSize;
            }
        }
        else {
            cc.error("[Baum2] font " + this.font + " is not found");
        }
        return go;
    }
    CalcArea() {
        return BaumPrefabCreator.Area.FromPositionAndSize(this.canvasPosition, this.sizeDelta);
    }
}
exports.TextElement = TextElement;
class ImageElement extends Element {
    constructor(json, parent) {
        super(json, parent);
        this.spriteName = json["image"];
        this.canvasPosition = new cc.Vec2(json["x"], json["y"]);
        this.sizeDelta = new cc.Vec2(json["w"], json["h"]);
        this.opacity = json["opacity"];
    }
    Render(renderer) {
        let go = this.CreateUIGameObject(renderer);
        let anchoredPosition = renderer.CalcPosition(this.canvasPosition, this.sizeDelta);
        go.setContentSize(this.sizeDelta.x, this.sizeDelta.y);
        go.setPosition(anchoredPosition);
        // FIXME:
        if (go.name === "Image1") {
            console.log(go.name);
        }
        // FIXME:
        let image = go.addComponent(cc.Sprite);
        image.spriteFrame = renderer.GetSprite(this.spriteName);
        image.type = cc.Sprite.Type.SLICED;
        /*
        if (go.name === "Handle") {
          image.type = cc.Sprite.Type.SLICED;
          image.spriteFrame.insetTop = 20;
          image.spriteFrame.insetBottom = 20;
          // @ts-ignore
          image.spriteFrame._refreshTexture(image.spriteFrame._texture);
          // @ts-ignore
          image.spriteFrame._calculateSlicedUV();
        }
        */
        // TODO: START
        // image.type = Image.Type.Sliced;
        // image.color = new Color(1.0f, 1.0f, 1.0f, opacity / 100.0f);
        // SetStretch(go, renderer);
        // SetPivot(go, renderer);
        // TODO: END
        return go;
    }
    CalcArea() {
        return BaumPrefabCreator.Area.FromPositionAndSize(this.canvasPosition, this.sizeDelta);
    }
}
exports.ImageElement = ImageElement;
class MaskElement extends ImageElement {
}
exports.MaskElement = MaskElement;
class NullElement extends Element {
    Render(renderer) {
        let go = this.CreateUIGameObject(renderer);
        return go;
    }
    CalcArea() {
        return BaumPrefabCreator.Area.None();
    }
}
exports.NullElement = NullElement;
//# sourceMappingURL=BaumElements.js.map