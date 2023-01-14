
Sprite.prototype.redraw = function () {
    var left = this.scale * this.x + 'px';
    if (this.style.left != left) {
        this.style.left = left;
    }
    var top = this.scale * this.y + 'px';
    if (this.style.top != top) {
        this.style.top = top;
    }

    var width = this.scale * this.width + 'px';
    if (this.style.width != width) {
        this.style.width = width;
    }

    var height = this.scale * this.height + 'px';
    if (this.style.height != height) {
        this.style.height = height;
    }
    var background = 'url(' + this.texture + ')';
    if (this.style.background != background) {
        this.style.background = background;
    }
    if (this.label) {
        var html = '<span class="label label-default">' +
            this.label + "</span>";
        if (html != this.element.innerHTML) {
            this.element.innerHTML = html;
        }
    }

    var border = '';
    //    this.style['border-bottom'] = '1px solid black';
    //    this.style['border-right'] = '1px solid black';
    if (this.selected) {
        border = '3px dotted red';
    }
    if (this.style.border != border) {
        this.style.border = border;
    }
}

Sprite.prototype.destroy = function () {
    this.parent.removeChild(this.element);
}

function Sprite(parentElement, texture, width, height, scale) {
    this.scale = scale;
    this.parent = parentElement;
    // create a DOM sprite
    this.element = document.createElement("div");
    // optimized pointer to style object
    this.style = this.element.style;
    this.style.position = 'absolute';

    this.texture = texture;
    this.x = 0;
    this.y = 0;
    this.height = height;
    this.width = width;
    this.redraw();

    this.parent.appendChild(this.element);
}
