/*
    RPG Paper Maker Copyright (C) 2017-2020 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

#ifndef SYSTEMPLUGINCOMMAND_H
#define SYSTEMPLUGINCOMMAND_H

#include <QMetaType>
#include "superlistitem.h"

class SystemPluginCommand : public SuperListItem
{
public:
    SystemPluginCommand();
    virtual ~SystemPluginCommand();
};

Q_DECLARE_METATYPE(SystemPluginCommand)

#endif // SYSTEMPLUGINCOMMAND_H