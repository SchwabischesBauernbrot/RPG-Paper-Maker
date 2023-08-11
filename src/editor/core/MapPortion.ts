/*
    RPG Paper Maker Copyright (C) 2017-2023 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

import * as THREE from 'three';
import { Constants } from '../common/Constants';
import { Manager, MapElement, Model, Scene } from '../Editor';
import { CustomGeometry } from './CustomGeometry';
import { Portion } from './Portion';
import { Position } from './Position';
import { Rectangle } from './Rectangle';
import { Serializable } from './Serializable';
import { ElementMapKind } from '../common/Enum';
import { KeyValue } from '../common/Types';
import { Floor } from '../mapElements';
import { Paths } from '../common/Paths';
import { Project } from './Project';

class MapPortion extends Serializable {
	public static readonly JSON_FLOORS = 'floors';

	public globalPortion: Portion;
	public floors: Map<string, MapElement.Floor>;
	public floorsMesh: THREE.Mesh;
	public lastPreviewRemove: [position: Position, element: MapElement.Base | null, kind: ElementMapKind][] = [];

	constructor(globalPortion: Portion) {
		super();
		this.globalPortion = globalPortion;
		this.floors = new Map();
		this.floorsMesh = new THREE.Mesh(new CustomGeometry(), Manager.GL.MATERIAL_EMPTY);
		this.floorsMesh.renderOrder = 0;
	}

	getPath(temp: boolean = false): string {
		if (!Project.current || !Scene.Map.current) {
			return '';
		}
		let path = Paths.join(Project.current.getPathMaps(), Model.Map.generateMapName(Scene.Map.current.id));
		if (temp) {
			path = Paths.join(path, Paths.TEMP);
		}
		return Paths.join(path, this.getFileName());
	}

	getFileName(): string {
		return this.globalPortion.getFileName();
	}

	removeLastPreview() {
		for (const [position, element, kind] of this.lastPreviewRemove) {
			this.updateMapElement(position, element, kind, false, true);
		}
		this.lastPreviewRemove = [];
	}

	add(position: Position, preview: boolean = false) {
		this.removeLastPreview();
		this.updateMapElement(
			position,
			new MapElement.Floor(Scene.Map.currentSelectedTexture),
			ElementMapKind.Floors,
			preview
		);
	}

	updateMapElement(
		position: Position,
		element: MapElement.Base | null,
		kind: ElementMapKind = ElementMapKind.None,
		preview: boolean = false,
		removingPreview: boolean = false
	) {
		if (element !== null) {
			kind = element.kind;
		}
		switch (kind) {
			case ElementMapKind.Floors:
				this.updateFloor(position, element as MapElement.Floor, preview, removingPreview);
				break;
			case ElementMapKind.Autotiles:
				// TODO
				break;
			default:
				break;
		}
	}

	updateFloor(position: Position, floor: MapElement.Floor | null, preview: boolean, removingPreview: boolean) {
		if (floor === null) {
			this.setFloor(position, null, preview, removingPreview);
		} else {
			for (let i = 0; i < floor.texture.width; i++) {
				for (let j = 0; j < floor.texture.height; j++) {
					const newPosition = new Position(position.x + i, position.y, position.yPixels, position.z + j);
					this.setFloor(
						newPosition,
						new Floor(new Rectangle(floor.texture.x + i, floor.texture.y + j, 1, 1)),
						preview,
						removingPreview
					);
				}
			}
		}
	}

	setFloor(
		p: Position,
		floor: MapElement.Floor | null,
		preview: boolean,
		removingPreview: boolean
	): MapElement.Floor | null {
		if (!Scene.Map.current || !p.isInMap(Scene.Map.current.modelMap)) {
			return null;
		}
		const key = p.toKey();
		let changed = false;
		const previous = this.floors.get(key) || null;
		if (floor === null) {
			changed = this.floors.delete(key);
		} else {
			changed = previous ? !previous.equals(floor) : true;
			this.floors.set(key, floor);
		}
		if (changed && Scene.Map.current) {
			Scene.Map.current.addPortionToUpdate(this.globalPortion);
			if (!preview && !removingPreview) {
				Scene.Map.current.addPortionToSave(this.globalPortion);
			}
		}
		if (preview) {
			this.lastPreviewRemove.push([p, previous, ElementMapKind.Floors]);
		}
		return previous;
	}

	remove(position: Position) {
		this.removeLastPreview();
		this.updateMapElement(position, null, ElementMapKind.Floors);
	}

	fillDefaultFloor(map: Model.Map) {
		const rect = new Rectangle(0, 0, 1, 1);
		const p = new Position();
		for (let i = 0; i < Constants.PORTION_SIZE; i++) {
			for (let j = 0; j < Constants.PORTION_SIZE; j++) {
				p.x = this.globalPortion.x * Constants.PORTION_SIZE + i;
				p.y = this.globalPortion.y * Constants.PORTION_SIZE;
				p.z = this.globalPortion.z * Constants.PORTION_SIZE + j;
				if (p.isInMap(map)) {
					this.updateMapElement(p, new MapElement.Floor(rect));
				}
			}
		}
	}

	updateGeometries() {
		this.updateLandsGeometries();
	}

	updateLandsGeometries() {
		this.updateFloorsGeometry();
	}

	updateFloorsGeometry() {
		const material = Scene.Map.current!.materialTileset;
		const { width, height } = Manager.GL.getMaterialTextureSize(material);
		const geometry = new CustomGeometry();
		const layers: [Position, MapElement.Floor][] = [];
		let count = 0;
		let i: number;
		let l: number;
		for (const [positionKey, floor] of this.floors) {
			const p = new Position();
			p.fromKey(positionKey);
			const layer = p.layer;
			if (layer > 0) {
				for (i = 0, l = layers.length; i < l; i++) {
					if (layer <= layers[i][0].layer) {
						layers.splice(i, 0, [p, floor]);
						break;
					}
				}
				if (i === l) {
					layers.push([p, floor]);
				}
			} else {
				floor.updateGeometry(geometry, p, width, height, count);
				count++;
			}
		}

		// Draw layers separatly
		for (i = 0, l = layers.length; i < l; i++) {
			const p = layers[i][0];
			const floor = layers[i][1];
			floor.updateGeometry(geometry, p, width, height, count);
			count++;
		}

		// Update geometry attributes
		geometry.updateAttributes();
		this.floorsMesh.geometry = geometry;
	}

	updateMaterials() {
		this.floorsMesh.material = Scene.Map.current!.materialTileset;
	}

	addToScene() {
		Scene.Map.current!.scene.add(this.floorsMesh);
	}

	update() {
		// TODO
	}

	read(json: any) {
		const tab = json.lands[MapPortion.JSON_FLOORS];
		const p = new Position();
		for (const objHash of tab) {
			p.read(objHash.k);
			this.floors.set(p.toKey(), MapElement.Floor.fromJSON(objHash.v));
		}
	}

	write(json: any) {
		json.lands = {};
		const tab = [];
		const p = new Position();
		for (const [positionKey, floor] of this.floors) {
			const objHash: KeyValue = {};
			const tabKey: number[] = [];
			p.fromKey(positionKey);
			p.write(tabKey);
			const objFloor = {};
			floor.write(objFloor);
			objHash.k = tabKey;
			objHash.v = objFloor;
			tab.push(objHash);
		}
		json.lands[MapPortion.JSON_FLOORS] = tab;
		json.autotiles = [];
		json.moun = { a: [], o: [] };
		json.objs = {
			list: [
				{
					k: [7, 0, 0, 7, 0],
					v: { canBeTriggeredAnotherObject: false, hId: 2, id: 1, name: 'Hero', ooepf: false },
				},
			],
		};
		json.objs3d = { a: [], o: [] };
		json.sprites = { list: [], overflow: [], walls: [] };
	}

	async load() {
		await super.load(true); // Try to read temp files by default
	}
}

export { MapPortion };
