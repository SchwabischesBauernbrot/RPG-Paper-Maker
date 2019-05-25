/*
    RPG Paper Maker Copyright (C) 2017-2019 Marie Laporte

    RPG Paper Maker engine is under LGPL-3 license.

    Commercial license for commercial use of your games:
        https://creativecommons.org/licenses/by-nc/4.0/.

    See more information here: http://rpg-paper-maker.com/index.php/downloads.
*/

#ifndef DIALOGSYSTEMWINDOWSKIN_H
#define DIALOGSYSTEMWINDOWSKIN_H

#include <QDialog>
#include "systemwindowskin.h"
#include "systempicture.h"

// -------------------------------------------------------
//
//  CLASS DialogSystemWindowSkin
//
//  A dialog used for editing the model of a system window skin.
//
// -------------------------------------------------------

namespace Ui {
class DialogSystemWindowSkin;
}

class DialogSystemWindowSkin : public QDialog
{
    Q_OBJECT

public:
    explicit DialogSystemWindowSkin(SystemWindowSkin &windowSkin, QWidget
        *parent = nullptr);
    ~DialogSystemWindowSkin();

private:
    Ui::DialogSystemWindowSkin *ui;
    SystemWindowSkin& m_windowSkin;
    float m_zoom;

    void initialize();
    void updateZoom(int zoom);
    void enableAll(bool b);

    virtual void closeEvent(QCloseEvent *event);

public slots:
    void on_pictureChanged(SystemPicture *picture);
    void on_horizontalSlider_valueChanged(int value);
    void on_comboBoxOptionBackground_currentIndexChanged(int index);
    void on_selecting();
    void on_rectDrawn();
};

#endif // DIALOGSYSTEMWINDOWSKIN_H