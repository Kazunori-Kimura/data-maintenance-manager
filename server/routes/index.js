const express = require('express');
const router = express.Router();
const Action = require('../actions/Action');

const action = new Action();

// GET_LIST
router.get('/:tablename',
  action.validateTableName.bind(action),
  action.getListAsync.bind(action),
  action.sendResponse.bind(action)
);

// GET_ONE
router.get('/:tablename/:id',
  action.validateTableName.bind(action),
  action.validateId.bind(action),
  action.getOneAsync.bind(action),
  action.sendResponse.bind(action)
);

// CREATE
router.post('/:tablename',
  action.validateTableName.bind(action),
  action.createAsync.bind(action),
  action.sendResponse.bind(action)
);

// UPDATE
router.put('/:tablename/:id',
  action.validateTableName.bind(action),
  action.validateId.bind(action),
  action.updateAsync.bind(action),
  action.sendResponse.bind(action)
);

// DELETE
router.delete('/:tablename/:id',
  action.validateTableName.bind(action),
  action.validateId.bind(action),
  action.deleteAsync.bind(action),
  action.sendResponse.bind(action)
);

module.exports = router;
