/*
    RPG Paper Maker Copyright (C) 2017-2023 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

import { BINDING } from '../common/Enum';
import { Paths } from '../common/Paths';
import { BindingType } from '../common/Types';
import { Utils } from '../common/Utils';
import { Project } from '../core/Project';
import { Serializable } from '../core/Serializable';

class Settings extends Serializable {
	public projectMenuIndex!: number;
	public mapEditorMenuIndex!: number;

	public static readonly bindings: BindingType[] = [
		['projectMenuIndex', 'pmi', 1, BINDING.NUMBER],
		['mapEditorMenuIndex', 'memi', 0, BINDING.NUMBER],
	];

	static getBindings(additionnalBinding: BindingType[]) {
		return [...Settings.bindings, ...additionnalBinding];
	}

	getPath(): string {
		return Paths.join(Project.current!.getPath(), Paths.FILE_SETTINGS);
	}

	read(json: Record<string, any>, additionnalBinding: BindingType[] = []) {
		super.read(json, Settings.getBindings(additionnalBinding));
	}

	write(json: Record<string, any>, additionnalBinding: BindingType[] = []) {
		super.write(json, Settings.getBindings(additionnalBinding));
	}
}

export { Settings };
