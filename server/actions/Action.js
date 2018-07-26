const Sequelize = require('sequelize');
const Op = Sequelize.Op;

class Action {
  /**
   * テーブル名を取得する
   */
  getTableName(req) {
    return req.params.tablename;
  }

  /**
   * モデルを取得する
   */
  getModel(db, tablename) {
    return db.getModel(tablename);
  }

  /**
   * モデルのrelationを定義する
   */
  getIncludes(db) {
    return null;
  }

  /**
   * tablenameのvalidate middleware
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  validateTableName(req, res, next) {
    try {
      const tablename = this.getTableName(req);
      if (typeof tablename !== 'string') {
        const err = new Error('Not Found');
        err.status = 404;
        throw err;
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  /**
   * idのvalidate middleware
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  validateId(req, res, next) {
    try {
      const id = req.params.id;
      if (!/^[0-9]+$/.test(id)) {
        const err = new Error('Bad Request');
        err.status = 400;
        throw err;
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET_LIST
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async getListAsync(req, res, next) {
    try {
      const db = req.app.get('db');
      // tablename
      const tablename = this.getTableName(req);
      // model
      const model = this.getModel(db, tablename);
      // sort=['title','ASC']
      const sort = req.query.sort;
      let order = null;
      if (sort) {
        order = JSON.parse(sort);
        // orderが配列の配列かどうかを判定する
        if (!Array.isArray(order[0])) {
          order = [order];
        }
      } else {
        if (model.rawAttributes.rank) {
          order = [
            Sequelize.fn('isnull', Sequelize.col('rank')),
            ['rank', 'ASC']
          ];
        }
      }
      // range=[0, 24]
      const range = req.query.range;
      let rangeStart = 0;
      let rangeEnd = DEFAULT_ITEMS;
      if (range) {
        let rangeArr = JSON.parse(range);
        if (rangeArr.length === 2) {
          rangeStart = rangeArr[0];
          rangeEnd = rangeArr[1];
        }
      }
      const offset = rangeStart, limit = rangeEnd - rangeStart + 1;

      // filter={title:'bar'}
      const filter = req.query.filter;
      let where = null;
      if (filter) {
        const obj = JSON.parse(filter);
        where = {};

        Object.keys(obj).forEach((key) => {
          if (Array.isArray(obj[key])) {
            where[key] = {
              [Op.or]: obj[key]
            };
          } else {
            where[key] = obj[key];
          }
        });
      }

      const options = { offset, limit };
      if (where) {
        options.where = where;
      }
      if (order) {
        options.order = order;
      }
      const include = this.getIncludes(db);
      if (include) {
        options.include = include;
      }

      const result = await model.findAndCountAll(options);

      // bodyを生成
      res.body = result.rows.map((row) => {
        return row.get({ plain: true });
      });

      res.header('Content-Range', `${tablename} ${rangeStart}-${rangeEnd}/${result.count}`);
      next();
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET_ONE
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async getOneAsync(req, res, next) {
    try {
      const db = req.app.get('db');
      const tablename = this.getTableName(req);
      const model = this.getModel(db, tablename);
      const id = req.params.id;

      const options = {
        where: {
          id
        }
      };
      const include = this.getIncludes(db);
      if (include) {
        options.include = include;
      }

      // 取得処理
      const entity = await model.findOne(options);

      if (entity) {
        // toJSON
        res.body = entity.get({ plain: true });
        next();
        return;
      }

      // 404
      const err = new Error('Not Found');
      err.status = 404;
      throw err;
    } catch (err) {
      next(err);
    }
  }

  /**
   * CREATE
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async createAsync(req, res, next) {
    try {
      const db = req.app.get('db');
      const tablename = this.getTableName(req);

      // req.bodyをコピーする
      const data = Object.assign({}, req.body);

      // INSERT
      const entity = await this._insertAsync(db, tablename, data);

      if (entity) {
        res.body = entity.get({ plain: true });
        next();
        return;
      }

      // 500 Internal Server Error?
      const err = new Error('Internal Server Error');
      err.status = 500;
      throw err;
    } catch (err) {
      next(err);
    }
  }

  /**
   * 登録処理
   * 
   * @param {*} db 
   * @param {*} tablename 
   * @param {*} data 
   */
  async _insertAsync(db, tablename, data) {
    const model = this.getModel(db, tablename);

    // 作成日時
    if (model.rawAttributes.created) {
      data.created = new Date();
    }
    // 更新日時
    if (model.rawAttributes.modified) {
      data.modified = new Date();
    }

    // INSERT
    const entity = await model.create(data);
    return entity;
  }

  /**
   * UPDATE
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async updateAsync(req, res, next) {
    try {
      const db = req.app.get('db');
      const tablename = this.getTableName(req);
      const id = req.params.id;

      // req.bodyをコピーする
      const data = Object.assign({}, req.body);

      // UPDATE
      const entity = await this._updateAsync(db, tablename, id, data);

      if (entity) {
        res.body = entity.get({ plain: true });
        next();
        return;
      }

      // 404
      const err = new Error('Not Found');
      err.status = 404;
      throw err;
    } catch (err) {
      next(err);
    }
  }

  /**
   * 更新処理
   * 
   * @param {*} db 
   * @param {*} tablename 
   * @param {*} id 
   * @param {*} data 
   */
  async _updateAsync(db, tablename, id, data) {
    const model = this.getModel(db, tablename);

    // 作成日時があればカット
    if (data.created) {
      delete data.created;
    }
    // 更新日時
    if (model.rawAttributes.modified) {
      data.modified = new Date();
    }

    // データ取得
    const entity = await model.findOne({
      where: {
        id
      }
    });

    if (entity) {
      // 更新処理
      await entity.update(data);
      return entity;
    }

    return null;
  }

  /**
   * DELETE
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async deleteAsync(req, res, next) {
    try {
      const db = req.app.get('db');
      const tablename = this.getTableName(req);
      const id = req.params.id;

      // 削除処理
      const data = await this._deleteAsync(db, tablename, id);

      if (data) {
        res.body = data;
        next();
        return;
      }

      // 404
      const err = new Error('Not Found');
      err.status = 404;
      throw err;
    } catch (err) {
      next(err);
    }
  }

  /**
   * 削除処理
   * 
   * @param {*} db 
   * @param {*} tablename 
   * @param {*} id 
   */
  async _deleteAsync(db, tablename, id) {
    const model = this.getModel(db, tablename);

    // データ取得
    const entity = await model.findOne({
      where: {
        id
      }
    });

    if (entity) {
      const data = entity.get({ plain: true });
      // 削除
      await entity.destroy();
      return data;
    }

    return null;
  }

  /**
   * レスポンス送信前に実施するメソッド
   * 
   * @param {*} req 
   * @param {*} res 
   */
  beforeSendResponse(req, res) {
    // デフォルトでは何もしない
  }

  /**
   * レスポンスを返す
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  sendResponse(req, res) {
    this.beforeSendResponse(req, res);

    res.header('Content-Type', 'application/json; charset=utf-8');
    res.status(200);
    res.send(res.body);
  }
}
