/*
    RPG Paper Maker Copyright (C) 2017-2023 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

class ArrayUtils {
	static contains<T>(array: any[], value: T) {
		return array.indexOf(value) !== -1;
	}

	static removeAt(array: any[], index: number) {
		array.splice(index, 1);
	}

	static removeElement<T>(array: T[], value: T) {
		const index = array.indexOf(value);
		if (index !== -1) {
			this.removeAt(array, index);
			return true;
		}
		return false;
	}
}

export { ArrayUtils };