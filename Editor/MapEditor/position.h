/*
    RPG Paper Maker Copyright (C) 2017-2022 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/

#ifndef POSITION_H
#define POSITION_H

#include "position3d.h"
#include "axiskind.h"

// -------------------------------------------------------
//
//  CLASS Position
//
//  A possible position of an element in the map (taking layer
//  into account).
//
// -------------------------------------------------------

class Position : public Position3D
{
public:
    Position();
    Position(const Position3D &pos);
    Position(const Position &pos);
    Position(int x, int y, double y_plus, int z, int layer = 0);
    Position(int x, int y, double y_plus, int z, int layer, double centerX,
        double centerZ, double angleY, double angleX = 0, double angleZ = 0,
        double scaleX = 1, double scaleY = 1, double scaleZ = 1);
    virtual ~Position();

    bool operator==(const Position& other) const;
    bool operator!=(const Position& other) const;

    void setX(int x);
    void setZ(int z);
    void setCoords(int x, int y, double y_plus, int z);
    int layer() const;
    void setLayer(int l);
    double centerX() const;
    void setCenterX(double x);
    void addCenterX(double x);
    double centerZ() const;
    void setCenterZ(double z);
    void addCenterZ(double z);
    double angleY() const;
    void setAngleY(double a);
    void addAngleY(double a);
    double angleX() const;
    void setAngleX(double a);
    void addAngleX(double a);
    double angleZ() const;
    void setAngleZ(double a);
    void addAngleZ(double a);
    double scaleX() const;
    void setScaleX(double scaleX);
    double scaleY() const;
    void setScaleY(double scaleY);
    double scaleZ() const;
    void setScaleZ(double scaleZ);

    static double filterAngle(double a);

    bool isHorizontal() const;
    void setAngle(AxisKind axisKind, double a);
    void addAngle(AxisKind axisKind, double a);
    void setScale(AxisKind axisKind, double scale);
    void setHorizontal();
    void setVertical();
    void setCurrent(Position& position) const;
    void getLeft(Position& position) const;
    void getRight(Position& position) const;
    void getTopLeft(Position& position) const;
    void getTopRight(Position& position) const;
    void getBotLeft(Position& position) const;
    void getBotRight(Position& position) const;
    int getCenterXPixels() const;
    int getCenterZPixels() const;

    virtual QString toString() const;

    void read(const QJsonArray &json);
    void write(QJsonArray & json) const;

protected:
    int m_layer;
    double m_centerX;
    double m_centerZ;
    double m_angleY;
    double m_angleX;
    double m_angleZ;
    double m_scaleX;
    double m_scaleY;
    double m_scaleZ;

    void getStringLayerYPlus(QString& infos) const;
};

inline uint qHash(const Position& pos)
{
   return (pos.x() + pos.y() + pos.yPlus() + pos.z() + pos.layer()
           + pos.centerX() + pos.centerZ() + pos.angleY() + pos.angleX() + pos
           .angleZ() + pos.scaleX() + pos.scaleY() + pos.scaleZ());
}

#endif // POSITION_H
