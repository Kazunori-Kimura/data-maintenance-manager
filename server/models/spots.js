/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('spots', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    telephone: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    zip: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    parking: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    toilet: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    price_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    access: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lat: {
      type: 'DOUBLE(9,6)',
      allowNull: false
    },
    lng: {
      type: 'DOUBLE(9,6)',
      allowNull: false
    },
    rate: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    category_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    del_flg: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    created: {
      type: DataTypes.DATE,
      allowNull: false
    },
    modified: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'spots',
    freezeTableName: true,
    timestamps: false,
    underscored: true
  });
};
