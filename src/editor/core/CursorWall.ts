/*
    RPG Paper Maker Copyright (C) 2017-2023 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

import * as THREE from 'three';
import { Scene } from '../Editor';
import { Position, Project } from '.';

class CursorWall {
	public lines!: THREE.LineSegments;
	public material!: THREE.LineBasicMaterial;
	public isVisible = false;
	public positionStart: Position | null = null;
	public positionEnd: Position | null = null;
	public isMouseDown = false;

	initialize() {
		this.material = new THREE.LineBasicMaterial({
			color: 0xffffff,
			opacity: 1,
		});
		const geometry = new THREE.BufferGeometry();
		this.lines = new THREE.LineSegments(geometry, this.material);
		this.lines.renderOrder = 3;
	}

	needsUpdate(position: Position) {
		if (this.isMouseDown) {
			return this.positionEnd === null || !this.positionEnd.equals(position);
		} else {
			return this.positionStart === null || !this.positionStart.equals(position);
		}
	}

	arePositionsAligned() {
		return (
			!this.isMouseDown ||
			(this.positionStart &&
				this.positionEnd &&
				(this.positionStart.x === this.positionEnd.x || this.positionStart.z === this.positionEnd.z))
		);
	}

	onMouseDown() {
		this.isMouseDown = true;
	}

	onMouseUp() {
		this.isMouseDown = false;
		this.positionEnd = null;
	}

	update(position: Position) {
		if (this.isMouseDown) {
			this.positionEnd = position.clone();
		} else {
			this.positionStart = position.clone();
		}
		const points = [];
		const additionVector = new THREE.Vector3(0, Project.getSquareSize() * 3, 0);
		if (this.positionStart) {
			const vStartA = this.positionStart.toVector3(false);
			const vStartB = vStartA.clone().add(additionVector);
			points.push(vStartA);
			points.push(vStartB);
		}
		if (this.positionEnd) {
			const vEndA = this.positionEnd.toVector3(false);
			const vEndB = vEndA.clone().add(additionVector);
			points.push(vEndA);
			points.push(vEndB);
		}
		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		this.lines.geometry = geometry;
		this.material.color = new THREE.Color(this.arePositionsAligned() ? 0xffffff : 0xff0000);
		if (!this.isVisible) {
			Scene.Map.current?.scene.add(this.lines);
			this.isVisible = true;
		}
	}

	remove() {
		if (this.isVisible) {
			Scene.Map.current?.scene.remove(this.lines);
			this.isVisible = false;
		}
	}
}

export { CursorWall };
