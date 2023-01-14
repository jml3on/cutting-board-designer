

var textures = {
	'maple': "/assets/images/hard-maple.jpg",
	'purpleheart': "/assets/images/purpleheart.jpg",
	'walnut': "/assets/images/black-walnut.jpg",
	'jatoba': "/assets/images/jatoba.jpg",
	'mahogany': "/assets/images/mahogany.jpg",
	'yellowheart': "/assets/images/yellowheart.jpg",
	'cherry': "/assets/images/cherry.jpg",
	'padauk': "/assets/images/padauk.jpg",
	'white-oak': "/assets/images/white-oak.jpg",
};

function Strip(width, length, sprite, wood) {
	this.width = width;
	this.length = length;
	this.sprite = sprite;
	this.wood = wood;
	this.tiles = new Array();
}

Strip.prototype.setWidth = function (width) {
	this.width = width;
	this.sprite.width = width;
}

function Board(scope, longGrain, endGrain, spec, scale) {
	this.scope = scope;
	this.longGrain = longGrain;
	this.endGrain = endGrain;
	this.lumberLength = spec.lumberLength;
	this.lumberThickness = spec.lumberThickness;
	this.boardThickness = spec.boardThickness;
	this.bladeKerf = spec.bladeKerf;
	this.strips = spec.strips;
	this.scale = scale ? scale : 30;
	
	this.lastSelectedIndex = -1;
	this.scope.stripWidth = undefined;
	this.scope.selectedStrips = false;
	// Pre-populate demo board.
	var l = spec.strips.length;
	this.strips = new Array();
	for (var i = 0; i < l; i++) {
		this.addStrip(spec.strips[i].width, spec.lumberLength,
			spec.strips[i].wood);
	}
	scope.lumberThickness = spec.lumberThickness;
	scope.lumberLength = spec.lumberLength;
	scope.bladeKerf = spec.bladeKerf;
	scope.boardThickness = spec.boardThickness;
	scope.selectedStrips = 0;
	this.redraw();
	scope.boardWidth = this.boardWidth;
	scope.boardLength = this.boardLength;
}

Board.prototype.getSpec = function () {
	var spec = {
		'lumberLength': this.lumberLength,
		'lumberThickness': this.lumberThickness,
		'boardThickness': this.boardThickness,
		'bladeKerf': this.bladeKerf,
		'strips': new Array(),
	}
	for (var i = 0; i < this.strips.length; i++) {
		spec.strips.push({
			'width': this.strips[i].width,
			'wood': this.strips[i].wood,
		});
	}
	return spec;
}

function isMultiSelect(mouseEvent) {
	return mouseEvent.metaKey || mouseEvent.ctrlKey;
}

function isExtendSelect(mouseEvent) {
	return mouseEvent.shiftKey;
}

var selectStrip = function (board, strip, event) {
	var clickedIndex = board.indexOf(strip);
	if (isExtendSelect(event) && board.lastSelectedIndex >= 0) {
		var start = Math.min(clickedIndex, board.lastSelectedIndex);
		var stop = Math.max(clickedIndex, board.lastSelectedIndex);
		for (var i = start; i <= stop; i++) {
			board.strips[i].selected = true;
		}
	} else {
		if (!isMultiSelect(event)) {
			// In single select mode, unselect any other strip than
			// the clicked one.  The clicked one will simply toggle.
			for (var i in board.strips) {
				if (strip != board.strips[i]) {
					board.strips[i].selected = false;
				}
			}
		}
		strip.selected = !strip.selected;
	}
	board.lastSelectedIndex = clickedIndex;

	var selectedWidth;
	var selectedWood = undefined;
	var selectedStrips = false;
	for (i = 0; i < board.strips.length; i++) {
		var s = board.strips[i];
		if (s.selected) {
			selectedStrips = true;
			if (!selectedWidth) {
				selectedWidth = s.width;
			} else {
				if (selectedWidth != s.width) {
					selectedWidth = "";
				}
			}
			if (!selectedWood) {
				selectedWood = s.wood;
		}/* else {
				if (selectedWood != s.wood) {
					selectedWood = "";
				}
			}*/
		}
	}
	if (selectedWood) {
		board.scope.selectedWood = selectedWood;
	}
	board.scope.stripWidth = selectedWidth;
	board.scope.selectedStrips = selectedStrips;
	board.renderLongGrain();
	board.renderEndGrain();
}

Board.prototype.indexOf = function (strip) {
	for (var s = 0; s < this.strips.length; s++) {
		if (strip == this.strips[s]) {
			return s;
		}
	}
	return undefined;
}

Board.prototype.addStrip = function (width, length, wood) {
	var sprite = undefined;
	if (this.longGrain) {
		var sprite = new Sprite(this.longGrain, textures[wood],
			length, width, this.scale);
	}
	var strip = new Strip(width, length, sprite, wood);
	this.strips.push(strip);
	strip.selected = false;

	//Don't build sprite if there is no container.
	if (this.longGrain == undefined) return;

	sprite.element.draggable = true;
	sprite.strip = strip;
	// capture a local reference for the closure.
	var board = this;
	var scope = this.scope;
	sprite.element.onclick = function (event) {
		scope.$apply(function () {
			selectStrip(board, strip, event);
		});
	}
	sprite.element.ondragstart = function (event) {
		scope.$apply(function () {
			strip.dragging = true;
			sprite.element.style.opacity = 0.4;
			board.sourceIndex = board.indexOf(strip);
			event.dataTransfer.setData("binary", "" + board.sourceIndex);
			event.dataTransfer.dropEffect = 'move';
			// force selection of moving strip
			strip.selected = false;
			selectStrip(board, strip, event);
		});
	}
	sprite.element.ondragend = function (event) {
		scope.$apply(function () {
			strip.dragging = false;
			sprite.element.style.opacity = 1;
		});
	}
	sprite.element.ondragenter = function (event) {
		scope.$apply(function () {
			event.dataTransfer.dropEffect = 'move';
			var sourceIndex = board.sourceIndex;
			var targetIndex = board.indexOf(strip);
			if (sourceIndex == targetIndex) return;
			var source = board.strips[sourceIndex];
			var target = board.strips[targetIndex];
			board.strips[sourceIndex] = target;
			board.strips[targetIndex] = source;
			board.sourceIndex = targetIndex;
			board.redraw();
			board.scope.boardModified = true;
		});
	}

	return strip;
}

Board.prototype.deleteSelectedStrips = function () {
	for (var i = 0; i < this.strips.length;) {
		var strip = this.strips[i];
		if (strip.selected) {
			this.strips.splice(i, 1);
			strip.sprite.destroy();

			while (strip.tiles.length > 0) {
				var tile = strip.tiles.pop();
				tile.destroy();
			}
		} else {
			i++;
		}
	}
	this.lastSelectedIndex = -1;
	this.scope.stripWidth = undefined;
	this.scope.selectedStrips = false;
}

Board.prototype.setSelectedStripWidth = function (width) {
	for (var i in this.strips) {
		var strip = this.strips[i];
		if (strip.selected) {
			strip.width = width;
		}
	}
}

Board.prototype.computeSlices = function () {
	var width = 0;
	var numSlices = Math.floor((this.lumberLength + this.bladeKerf) /
		(this.boardThickness + this.bladeKerf));
	for (s = 0; s < this.strips.length; s++) {
		var strip = this.strips[s];
		for (var i in strip.tiles) {
			var tile = strip.tiles[i];
			tile.height = strip.width;
		}
		// Add missing slices.
		if (this.endGrain) {
			for (var i = strip.tiles.length; i < numSlices; i++) {
				var sprite = new Sprite(this.endGrain,
					textures[strip.wood],
					this.boardThickness,
					strip.width,
					this.scale);
				sprite.x = 2 * i;
				sprite.y = this.y + 10;
				strip.tiles.push(sprite);
			}
			// Remove extra slices.
			for (var i = strip.tiles.length; i > numSlices; i--) {
				var tile = strip.tiles.pop();
				tile.destroy();
			}
		}
	}
	this.numSlices = numSlices;
	this.boardLength = numSlices * this.lumberThickness;
}

Board.prototype.getWidth = function () {
	var width = 0;
	for (var s = 0; s < this.strips.length; s++) {
		width += this.strips[s].width;
	}
	return width;
}

Board.prototype.selectWood = function (wood) {
	for (var s in this.strips) {
		var strip = this.strips[s];
		if (strip.selected) {
			strip.wood = wood;
			strip.sprite.wood = wood;
			strip.sprite.texture = textures[strip.wood];
			this.scope.boardModified = true;
		}
	}
	this.redraw();
}

var originX = 0;
var originY = 0;
Board.prototype.renderLongGrain = function () {
	if (!this.longGrain) return;
	var y = originY;
	for (var i = 0; i < this.strips.length; i++) {
		var strip = this.strips[i];
		strip.sprite.texture = textures[strip.wood];
		strip.sprite.x = originX;
		strip.sprite.y = y;
		strip.sprite.selected = strip.selected;
		strip.sprite.width = this.lumberLength;
		strip.sprite.height = strip.width;
		strip.sprite.label = strip.wood + " - " + strip.width + '"';
		strip.sprite.redraw();
		y += strip.width;
	}
}

Board.prototype.renderEndGrain = function () {
	var boardWidth = this.getWidth();
	var startY = originY; //+ boardWidth + 1;
	var stripY = 0;
	for (var s = 0; s < this.strips.length; s++) {
		var strip = this.strips[s];
		var xPos = originX;
		for (var t = 0; t < strip.tiles.length; t++) {
			var tile = strip.tiles[t];
			tile.texture = textures[strip.wood];
			tile.selected = strip.selected;
			tile.width = this.lumberThickness;
			tile.x = xPos;
			xPos += tile.width;
			if (t % 2 == 0) {
				tile.y = startY + stripY;
			} else {
				tile.y = startY + boardWidth - stripY - strip.width;
			}
			tile.redraw();
		}
		stripY += strip.width;
	}
}

Board.prototype.redraw = function () {
	this.computeSlices();
	this.renderLongGrain();
	this.renderEndGrain();
	this.boardWidth = this.getWidth();
}
