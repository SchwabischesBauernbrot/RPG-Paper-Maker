/*
    RPG Paper Maker Copyright (C) 2017-2023 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

export enum LocalForage {
	Projects = 'projects',
	EngineSettings = 'engineSettings',
}

export enum Object3DExtension {
	None,
	OBJ,
	GLTF,
}

export enum PreviewerType {
	Objects,
	Shaders,
}

export enum ModelType {
	Base,
	EffectPeriod,
}

export enum ElementMapKind {
	None,
	Floors,
	Autotiles,
	Water,
	SpritesFace,
	SpritesFix,
	SpritesDouble,
	SpritesQuadra,
	SpritesWall,
	Object,
	Object3D,
	Mountains,
}

export enum Direction {
	South,
	West,
	North,
	East,
	SouthWest,
	SouthEast,
	NorthWest,
	NorthEast,
	Up,
	Down,
	None,
}