'use strict';

var assign = require('lodash/object/assign'),
    forEach = require('lodash/collection/forEach');

var MoveHelper = require('./helper/MoveHelper'),
    Collections = require('../../../util/Collections');


/**
 * A handler that implements reversible moving of shapes.
 */
function MoveShapeHandler(modeling) {
  this._modeling = modeling;

  this._helper = new MoveHelper(modeling);
}

MoveShapeHandler.$inject = [ 'modeling' ];

module.exports = MoveShapeHandler;


MoveShapeHandler.prototype.execute = function(context) {

  var shape = context.shape,
      delta = context.delta,
      newParent = this.getNewParent(context),
      oldParent = shape.parent;

  // save old parent in context
  context.oldParent = oldParent;
  context.oldParentIndex = Collections.indexOf(oldParent.children, shape);

  this.removeAttachment(context);

  // update shape parent + position
  assign(shape, {
    parent: newParent,
    x: shape.x + delta.x,
    y: shape.y + delta.y
  });

  return shape;
};

MoveShapeHandler.prototype.postExecute = function(context) {

  var shape = context.shape,
      delta = context.delta;

  var modeling = this._modeling;

  if (context.hints.updateAnchors !== false) {
    modeling.updateAnchors(shape, delta);
  }

  if (context.hints.layout !== false) {
    forEach(shape.incoming, function(c) {
      modeling.layoutConnection(c, { endChanged: true });
    });

    forEach(shape.outgoing, function(c) {
      modeling.layoutConnection(c, { startChanged: true });
    });
  }

  if (context.hints.recurse !== false) {
    this.moveChildren(context);
  }
};

MoveShapeHandler.prototype.revert = function(context) {

  var shape = context.shape,
      oldParent = context.oldParent,
      oldParentIndex = context.oldParentIndex,
      delta = context.delta;

  // restore previous location in old parent
  Collections.add(oldParent.children, shape, oldParentIndex);

  this.setAttachment(context);

  // revert to old position and parent
  assign(shape, {
    parent: oldParent,
    x: shape.x - delta.x,
    y: shape.y - delta.y
  });

  return shape;
};

MoveShapeHandler.prototype.moveChildren = function(context) {

  var delta = context.delta,
      shape = context.shape;

  this._helper.moveRecursive(shape.children, delta, null);
};

MoveShapeHandler.prototype.getNewParent = function(context) {
  return context.newParent || context.shape.parent;
};

MoveShapeHandler.prototype.removeAttachment = function(context) {
  var shape = context.shape,
      canExecute = context.canExecute,
      host,
      idx;

  if (canExecute !== 'detach') {
      return;
  }

  host = context.host = shape.host;

  idx = host.attachers.indexOf(shape);

  host.splice(idx, 1);

  shape.host = null;
};

MoveShapeHandler.prototype.setAttachment = function(context) {
  var shape = context.shape,
      canExecute = context.canExecute,
      host;

  if (canExecute !== 'detach') {
    return;
  }

  host = context.host;

  host.attachers.push(shape);

  shape.host = host;
};
