/*
    RPG Paper Maker Copyright (C) 2017-2022 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

import React from 'react';
import Menu from './menu/Menu';
import MenuItem from './menu/MenuItem';
import SubMenu from './menu/SubMenu';
import { BiSolidRectangle } from 'react-icons/bi';

function MapEditorMenuBar() {
	const handleFloor = () => {};

	return (
		<>
			<Menu horizontal>
				<SubMenu icon={<BiSolidRectangle />}>
					<MenuItem onClick={handleFloor}>Floor</MenuItem>
				</SubMenu>
				<SubMenu icon='sprite-face.png'>
					<MenuItem onClick={handleFloor} disabled>
						Floor
					</MenuItem>
				</SubMenu>
				<SubMenu icon='mountain.png'>
					<MenuItem onClick={handleFloor} disabled>
						Floor
					</MenuItem>
				</SubMenu>
				<SubMenu icon='object.png'>
					<MenuItem onClick={handleFloor} disabled>
						Floor
					</MenuItem>
				</SubMenu>
				<SubMenu icon='ev.png'>
					<MenuItem onClick={handleFloor} disabled>
						Floor
					</MenuItem>
				</SubMenu>
				<SubMenu icon='view.png'>
					<MenuItem onClick={handleFloor} disabled>
						Floor
					</MenuItem>
				</SubMenu>
			</Menu>
		</>
	);
}

export default MapEditorMenuBar;
