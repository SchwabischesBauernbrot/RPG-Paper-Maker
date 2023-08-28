/*
    RPG Paper Maker Copyright (C) 2017-2023 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	RootState,
	addProject,
	setCurrentProjectName,
	setLoading,
	setOpenLoading,
	setProjectMenuIndex,
	setUndoRedoIndex,
	triggerImportProject,
	triggerNewProject,
	triggerOpenProject,
	triggerPlay,
	triggerSave,
	triggerTreeMap,
} from '../store';
import DialogNewProject from './dialogs/DialogNewProject';
import Menu from './Menu';
import MenuItem from './MenuItem';
import MenuSub from './MenuSub';
import { LocalFile } from '../core/LocalFile';
import { Manager, Scene } from '../Editor';
import { Project } from '../core/Project';
import { AiOutlineFileAdd, AiOutlineFolderOpen, AiOutlineZoomIn, AiOutlineZoomOut } from 'react-icons/ai';
import { BiSave, BiExport, BiImport } from 'react-icons/bi';
import { BsPlay } from 'react-icons/bs';
import { MdClose, MdOutlineWallpaper } from 'react-icons/md';
import { IoIosUndo, IoIosRedo, IoMdArrowBack } from 'react-icons/io';
import { FiMap } from 'react-icons/fi';
import { Paths } from '../common/Paths';
import Dialog from './dialogs/Dialog';
import FooterYesNo from './dialogs/footers/FooterYesNo';
import Toolbar from './Toolbar';
import '../styles/MainMenu.css';
import { LocalForage } from '../common/Enum';
import { RxHamburgerMenu } from 'react-icons/rx';
import { LuFolders } from 'react-icons/lu';

function MainMenuBar() {
	const [isDialogNewProjectOpen, setIsDialogNewProjectOpen] = useState(false);
	const [isDialogWarningImportOpen, setIsDialogWarningImportOpen] = useState(false);
	const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
	const [hamburgerStates, setHamburgerStates] = useState<number[]>([]);

	const importFileInputRef = useRef<HTMLInputElement>(null);

	const dispatch = useDispatch();

	const currentTreeMapTag = useSelector((state: RootState) => state.mapEditor.currentTreeMapTag);
	const currentProjectName = useSelector((state: RootState) => state.projects.current);
	const triggers = useSelector((state: RootState) => state.triggers.mainBar);
	const projectNames = useSelector((state: RootState) => state.projects.list).map(({ name, location }) => name);
	const undoRedoIndex = useSelector((state: RootState) => state.mapEditor.undoRedo.index);
	const undoRedoLength = useSelector((state: RootState) => state.mapEditor.undoRedo.length);
	const projectMenuIndex = useSelector((state: RootState) => state.projects.menuIndex);

	const isProjectOpened = currentProjectName !== '';

	const isInMap = isProjectOpened && !!Scene.Map.current;

	const canUndo = () => isInMap && undoRedoIndex > -1;

	const canRedo = () => isInMap && undoRedoIndex < undoRedoLength - 1;

	const updateProjectMenuIndex = (index: number) => {
		dispatch(setProjectMenuIndex(index));
	};

	const handleKeyDown = async (event: KeyboardEvent) => {
		if (isProjectOpened) {
			const states = {
				alt: event.altKey,
				ctrl: event.ctrlKey,
				meta: event.metaKey,
				shift: event.shiftKey,
			};
			const key = event.key.toUpperCase();
			if (states.ctrl && key === 'S' && isInMap) {
				event.preventDefault();
				await handleSave();
				return false;
			} else if (states.ctrl && states.shift && key === 'Z' && canRedo()) {
				event.preventDefault();
				handleRedo();
				return false;
			} else if (states.ctrl && !states.shift && key === 'Z' && canUndo()) {
				event.preventDefault();
				handleUndo();
				return false;
			}
		}
	};

	const handleNewProject = () => {
		setIsDialogNewProjectOpen(true);
	};

	const handleAcceptNewProject = async (data: Record<string, any>) => {
		dispatch(addProject({ name: data.projectName, location: '' }));
		setIsDialogNewProjectOpen(false);
		await handleOpenProject(data.projectName);
	};

	const handleRejectNewProject = () => {
		setIsDialogNewProjectOpen(false);
	};

	const handleOpenProject = async (name: string) => {
		dispatch(setOpenLoading(true));
		dispatch(setCurrentProjectName(name));
		Project.current = new Project(name);
		await Project.current.load();
		dispatch(setOpenLoading(false));
	};

	const handleSave = async () => {
		if (currentTreeMapTag) {
			await currentTreeMapTag.saveFiles();
			Project.current?.treeMaps.save();
			dispatch(triggerTreeMap());
		}
	};

	const handleImport = () => {
		importFileInputRef.current?.click();
	};

	const handleImportFileChange = async () => {
		if (!importFileInputRef.current) {
			return;
		}
		const file = Array.from(importFileInputRef.current.files || [])[0];
		const projectName = file.name.substring(0, file.name.length - 4);
		if (projectNames.indexOf(projectName) === -1) {
			importFileInputRef.current.value = '';
			dispatch(setLoading(true));
			await LocalFile.loadZip(file, LocalForage.Projects);
			dispatch(addProject({ name: projectName, location: '' }));
			await handleOpenProject(projectName);
		} else {
			setIsDialogWarningImportOpen(true);
		}
	};

	const handleAcceptImport = async () => {
		if (!importFileInputRef.current) {
			return;
		}
		setIsDialogWarningImportOpen(false);
		dispatch(setLoading(true));
		const file = Array.from(importFileInputRef.current.files || [])[0];
		importFileInputRef.current.value = '';
		const projectName = file.name.substring(0, file.name.length - 4);
		await LocalFile.removeFolder(Paths.join(LocalForage.Projects, projectName));
		await LocalFile.loadZip(file, LocalForage.Projects);
		dispatch(addProject({ name: projectName, location: '' }));
		await handleOpenProject(projectName);
	};

	const handleRejectImport = () => {
		setIsDialogWarningImportOpen(false);
		if (importFileInputRef.current) {
			importFileInputRef.current.value = '';
		}
	};

	const handleExport = async () => {
		await LocalFile.downloadZip(Paths.join(LocalForage.Projects, currentProjectName));
	};

	const handleCloseProject = () => {
		if (Scene.Map.current) {
			Scene.Map.current.close();
			Scene.Map.current = null;
		}
		Project.current = null;
		dispatch(setCurrentProjectName(''));
	};

	const handleUndo = () => {
		Manager.UndoRedo.undo();
		dispatch(setUndoRedoIndex(undoRedoIndex - 1));
	};

	const handleRedo = () => {
		Manager.UndoRedo.redo();
		dispatch(setUndoRedoIndex(undoRedoIndex + 1));
	};

	const handleZoomIn = () => {
		if (Scene.Map.current) {
			Scene.Map.current.zoomIn();
		}
	};

	const handleZoomOut = () => {
		if (Scene.Map.current) {
			Scene.Map.current.zoomOut();
		}
	};

	const handlePlay = () => {
		window.open(window.location.origin + '/play/' + currentProjectName, '_blank')?.focus();
	};

	const handleClickHamburgerBack = () => {
		setHamburgerStates((value) => {
			const newList = [...value];
			newList.pop();
			return newList;
		});
	};

	const handleClickHamburger = () => {
		setIsHamburgerOpen((value) => !value);
		setHamburgerStates([]);
	};

	// Triggers handling
	useEffect(() => {
		if (triggers.newProject) {
			dispatch(triggerNewProject(false));
			handleNewProject();
		} else if (triggers.importProject) {
			dispatch(triggerImportProject(false));
			handleImport();
		} else if (triggers.openProject) {
			dispatch(triggerOpenProject(''));
			handleOpenProject(triggers.openProject).catch(console.error);
		} else if (triggers.save) {
			dispatch(triggerSave(false));
			handleSave();
		} else if (triggers.play) {
			dispatch(triggerPlay(false));
			handlePlay();
		}
	});

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
		// eslint-disable-next-line
	});

	const items: any = [
		{
			title: 'File',
			children: [
				{ title: 'New Project...', icon: <AiOutlineFileAdd />, onClick: handleNewProject },
				{
					title: 'Open existing project...',
					icon: <AiOutlineFolderOpen />,
					children: projectNames.map((name) => ({ title: name, onClick: () => handleOpenProject(name) })),
				},
				{
					title: (
						<>
							Import project...
							<input
								ref={importFileInputRef}
								type='file'
								hidden
								onChange={handleImportFileChange}
								accept='.zip'
							/>
						</>
					),
					icon: <BiImport />,
					onClick: handleImport,
				},
				{
					title: 'Export',
					icon: <BiExport />,
					disabled: !isProjectOpened,
					onClick: handleExport,
				},
				{
					title: 'Save',
					icon: <BiSave />,
					disabled: !isInMap,
					onClick: handleSave,
				},
				{
					title: 'Close',
					icon: <MdClose />,
					disabled: !isProjectOpened,
					onClick: handleCloseProject,
				},
			],
		},
		{
			title: 'Edition',
			children: [
				{
					title: 'Undo',
					icon: <IoIosUndo />,
					disabled: !canUndo(),
					onClick: handleUndo,
				},
				{
					title: 'Redo',
					icon: <IoIosRedo />,
					disabled: !canRedo(),
					onClick: handleRedo,
				},
				{
					title: 'Zoom in',
					icon: <AiOutlineZoomIn />,
					disabled: !isInMap,
					onClick: handleZoomIn,
				},
				{
					title: 'Zoom out',
					icon: <AiOutlineZoomOut />,
					disabled: !isInMap,
					onClick: handleZoomOut,
				},
			],
		},
		{
			title: 'Management',
			disabled: true,
		},
		{
			title: 'Special elements',
			disabled: true,
		},
		{
			title: 'Options',
			disabled: true,
		},
		{
			title: 'Display',
			disabled: true,
		},
		{
			title: 'Test',
			children: [
				{
					title: 'Play',
					icon: <BsPlay />,
					disabled: !isProjectOpened,
					onClick: handlePlay,
				},
			],
		},
		{
			title: 'Help',
			disabled: true,
		},
	];

	const getMenuHamburger = () => {
		let list = items;
		for (let state of hamburgerStates) {
			list = list[state].children;
		}
		return (
			<Menu>
				{list.map((item: any, index: number) => {
					const handleClick = () => {
						if (item.onClick) {
							item.onClick();
							setIsHamburgerOpen(false);
							setHamburgerStates([]);
						} else {
							setHamburgerStates((value) => [...value, index]);
						}
					};
					return (
						<MenuItem key={index} icon={item.icon} disabled={item.disabled} onClick={handleClick}>
							{item.title}
						</MenuItem>
					);
				})}
			</Menu>
		);
	};

	const getMenuDesktop = (list: any[]) =>
		list.map((item: any, index: number) => {
			if (item.children) {
				return (
					<MenuSub key={index} title={item.title}>
						{getMenuDesktop(item.children)}
					</MenuSub>
				);
			}
			return (
				<MenuItem key={index} icon={item.icon} disabled={item.disabled} onClick={item.onClick}>
					{item.title}
				</MenuItem>
			);
		});

	return (
		<>
			<div className='flex-center-vertically'>
				<img className='main-menu-bar-logo' src={'./favicon.ico'} alt='logo' />
				{isProjectOpened && (
					<div className='mobile-only'>
						<Menu
							horizontal
							isActivable
							activeIndex={projectMenuIndex}
							setActiveIndex={updateProjectMenuIndex}
						>
							<MenuItem icon={<LuFolders />}></MenuItem>
							<MenuItem icon={<MdOutlineWallpaper />}></MenuItem>
							<MenuItem icon={<FiMap />}></MenuItem>
						</Menu>
					</div>
				)}
				<div className='mobile-hidden'>
					<Menu horizontal>{getMenuDesktop(items)}</Menu>
				</div>
				<div className='flex-one' />
				{hamburgerStates.length > 0 && (
					<div className='main-menu-hamburger' onClick={handleClickHamburgerBack}>
						<IoMdArrowBack />
					</div>
				)}
				<div className='main-menu-hamburger' onClick={handleClickHamburger}>
					<RxHamburgerMenu />
				</div>
				{isHamburgerOpen && (
					<div className='relative'>
						<div className='main-menu-hamburger-open menu-sub-content'>{getMenuHamburger()}</div>
					</div>
				)}
			</div>
			<Toolbar />
			<DialogNewProject
				isOpen={isDialogNewProjectOpen}
				onAccept={handleAcceptNewProject}
				onReject={handleRejectNewProject}
			/>
			<Dialog
				title='Warning'
				isOpen={isDialogWarningImportOpen}
				footer={<FooterYesNo onNo={handleRejectImport} onYes={handleAcceptImport} />}
				onClose={handleRejectImport}
			>
				<p>This project name already exists. Would you like to replace it?</p>
			</Dialog>
		</>
	);
}

export default MainMenuBar;
