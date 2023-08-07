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

class MapPortion extends Serializable {
	public static readonly JSON_FLOORS = 'floors';

	public globalPortion: Portion;
	public floors: Map<string, MapElement.Floor>;
	public floorsMesh: THREE.Mesh;
	public lastPreviewRemove: [position: Position, element: MapElement.Base | null, kind: ElementMapKind] | null = null;

	constructor(globalPortion: Portion) {
		super();
		this.globalPortion = globalPortion;
		this.floors = new Map();
		this.floorsMesh = new THREE.Mesh(new CustomGeometry(), Manager.GL.MATERIAL_EMPTY);
		this.floorsMesh.renderOrder = 0;
	}

	getFileName(): string {
		return this.globalPortion.getFileName();
	}

	removeLastPreview() {
		if (this.lastPreviewRemove !== null) {
			const [position, element, kind] = this.lastPreviewRemove;
			this.setMapElement(position, element, kind);
			this.lastPreviewRemove = null;
		}
	}

	add(position: Position, preview: boolean = false) {
		this.removeLastPreview();
		const element = this.setMapElement(position, new MapElement.Floor(Scene.Map.currentSelectedTexture));
		if (preview) {
			this.lastPreviewRemove = [position, element, ElementMapKind.Floors];
		}
	}

	setMapElement(p: Position, element: MapElement.Base | null, kind: ElementMapKind = ElementMapKind.None) {
		if (element !== null) {
			kind = element.kind;
		}
		switch (kind) {
			case ElementMapKind.Floors:
				return this.setFloor(p, element as MapElement.Floor);
			case ElementMapKind.Autotiles:
				// TODO
				break;
			default:
				break;
		}
		return null;
	}

	setFloor(p: Position, floor: MapElement.Floor | null) {
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
		}
		return previous;
	}

	remove(position: Position) {
		this.removeLastPreview();
		this.setMapElement(position, null, ElementMapKind.Floors);
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
					this.setMapElement(p, new MapElement.Floor(rect));
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
		const geometry = this.floorsMesh.geometry as CustomGeometry;
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
		json[MapPortion.JSON_FLOORS] = tab;
	}
}

export { MapPortion };