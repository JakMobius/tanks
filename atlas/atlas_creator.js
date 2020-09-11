
const fs = require('fs');
const Canvas = require('canvas')
const path = require("path")
const readdirdeep = require("../src/utils/readdirdeep")
const atlaspack = require('atlaspack')

global.Image = Canvas.Image

let canvases = [];
let ctx = [];
let atlases = [];

const initial_size = 2048;
let size = 2048;

while(size > 0) {

	let canvas = Canvas.createCanvas(size, size);
	let c = canvas.getContext('2d');
	let atlas = atlaspack(canvas);

	atlas.tilepad = true

	canvases.push(canvas)
	ctx.push(c)
	size >>= 1
	atlases.push(atlas)
}

let i = 0;
let images = [];
const json = {};

readdirdeep("./textures").then((list) => {
	for(let file of list) {
		if(!file.endsWith(".png")) {
			continue
		}

		const img = new Image();
	    img.id = String(i++);

		img.onload = function() {

	        const l = file.split(".");
	        l.pop()

			images.push([l.join("."), img])
		};

		img.src = path.resolve(__dirname, 'textures', file)
	}

	images = images.sort(function(img1, img2) {
		return img1[1].width * img1[1].height - img2[1].width * img2[1].height
	})

	console.log("Finished reading images")

	for (let i = images.length - 1; i >= 0; i--) {
		let img = images[i]

		let mipsize = initial_size
		let j = 0
		let scale = 1

		while(canvases[j]) {
			console.log("Writing image " + img[0] + "x" + mipsize)
			let c = ctx[j]
			let canvas = canvases[j]
			let atlas = atlases[j]

			const atl = atlas.pack({width: img[1].width * scale + 2, height: img[1].height * scale + 2});
		    atlas.tilepad = true
			if(!atl.rect) {
				canvases[j] = null
				console.log("Failed to create mipmapping for " + mipsize + ". Denying")
				break
			}

			if(!json[j])json[j] = {}
			json[j][img[0]] = {
				x: (atl.rect.x + 1) / canvases[j].width,
				y: (atl.rect.y + 1) / canvases[j].height,
				w: (atl.rect.w - 2) / canvases[j].width,
				h: (atl.rect.h - 2) / canvases[j].height
			}

			c.drawImage(img[1], atl.rect.x + 1, atl.rect.y + 1, atl.rect.w - 2, atl.rect.h - 2)
			// Left
			c.drawImage(canvas, atl.rect.x + 1, atl.rect.y + 1, 1, atl.rect.h - 2, atl.rect.x, atl.rect.y + 1, 1, atl.rect.h - 2)
			// Right
			c.drawImage(canvas, atl.rect.x + atl.rect.w - 2, atl.rect.y + 1, 1, atl.rect.h - 2, atl.rect.x + atl.rect.w - 1, atl.rect.y + 1, 1, atl.rect.h - 2)
			// Top
			c.drawImage(canvas, atl.rect.x + 1, atl.rect.y + 1, atl.rect.w - 2, 1, atl.rect.x + 1, atl.rect.y, atl.rect.w - 2, 1)
			// Bottom
			c.drawImage(canvas, atl.rect.x + 1, atl.rect.y + atl.rect.h - 2, atl.rect.w - 2, 1, atl.rect.x + 1, atl.rect.y + atl.rect.h - 1, atl.rect.w - 2, 1)

			// Left-top
			c.drawImage(canvas, atl.rect.x + 1, atl.rect.y + 1, 1, 1, atl.rect.x, atl.rect.y, 1, 1)
			// Right-top
			c.drawImage(canvas, atl.rect.x + atl.rect.w - 2, atl.rect.y + 1, 1, 1, atl.rect.x + atl.rect.w - 1, atl.rect.y, 1, 1)
			// Left-bottom
			c.drawImage(canvas, atl.rect.x + 1, atl.rect.y + atl.rect.h - 2, 1, 1, atl.rect.x, atl.rect.y + atl.rect.h - 1, 1, 1)
			// Right-bottom
			c.drawImage(canvas, atl.rect.x + atl.rect.w - 2, atl.rect.y + atl.rect.h - 2, 1, 1, atl.rect.x + atl.rect.w - 1, atl.rect.y + atl.rect.h - 1, 1, 1)


			mipsize >>= 1
			scale /= 2
			j++
		}
	}

	for(let j = 0; j < canvases.length; j++) {
		if(!canvases[j]) break
		console.log("Writing mipmap level " + j)
		fs.writeFileSync("../src/client/copy/assets/img/atlas-mipmap-level-" + j + ".png", canvases[j].toBuffer());
		fs.writeFileSync("../src/client/copy/assets/img/atlas-mipmap-level-" + j + ".json", JSON.stringify(json[j]));
	}
});