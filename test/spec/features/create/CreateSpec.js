'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapDiagram, inject */

var Events = require('../../../util/Events');

var modelingModule = require('../../../../lib/features/modeling'),
    createModule = require('../../../../lib/features/create'),
    rulesModule = require('./rules');


describe('features/create - Create', function () {

  beforeEach(bootstrapDiagram({ modules: [ createModule, rulesModule, modelingModule ] }));

  var rootShape, parentShape, childShape, childShape2;

  var createEvent;

  beforeEach(inject(function(canvas, dragging) {
    createEvent = Events.scopedCreate(canvas);

    dragging.setOptions({ manual: true });
  }));

  afterEach(inject(function(dragging) {
    dragging.setOptions({ manual: false });
  }));

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100, width: 200, height: 200
    });

    canvas.addShape(parentShape, rootShape);

    childShape = elementFactory.createShape({
      id: 'childShape',
      x: 150, y: 350, width: 100, height: 100
    });

    canvas.addShape(childShape, parentShape);

    childShape2 = elementFactory.createShape({
      id: 'childShape2',
      x: 0, y: 0, width: 50, height: 50
    });

  }));

  describe('basics', function() {

    it('should create a shape', inject(function(create, elementRegistry, dragging) {
      // given
      var parentGfx = elementRegistry.getGraphics('parentShape');

      // when
      create.start(createEvent({ x: 0, y: 0 }), childShape2);

      dragging.move(createEvent({ x: 125, y: 125 }));
      dragging.hover({ element: parentShape, gfx: parentGfx });
      dragging.move(createEvent({ x: 175, y: 175 }));

      dragging.end();

      var shape = elementRegistry.get('childShape2');

      // then
      expect(shape).to.exist;
    }));


    it('should append a shape', inject(function(create, elementRegistry, dragging) {
      // given
      var rootGfx = elementRegistry.getGraphics('root');

      // when
      create.start(createEvent({ x: 0, y: 0 }), childShape2, parentShape);

      dragging.move(createEvent({ x: 175, y: 175 }));
      dragging.hover({ element: rootShape, gfx: rootGfx });
      dragging.move(createEvent({ x: 400, y: 200 }));

      dragging.end();

      var shape = elementRegistry.get('childShape2');

      // then
      expect(shape).to.exist;
    }));

  });

  describe('visuals', function() {

    it('should add visuals', inject(function(create, elementRegistry, dragging, eventBus) {
      var shapeGfx;

      // when
      create.start(createEvent({ x: 50, y: 50 }), childShape2);

      eventBus.on('create.move', function(evt) {
        var context = evt.context;

        shapeGfx = context.visual;
      });

      dragging.move(createEvent({ x: 50, y: 50 }));

      // then
      expect(shapeGfx.hasClass('djs-drag-group')).to.be.true;
    }));


    it('should remove marker', inject(function(canvas, create, elementRegistry, dragging) {
      // given
      var targetGfx = elementRegistry.getGraphics('parentShape');

      // when
      create.start(createEvent({ x: 0, y: 0 }), childShape2);

      dragging.move(createEvent({ x: 200, y: 50 }));
      dragging.hover({ element: parentShape, gfx: targetGfx});
      dragging.move(createEvent({ x: 200, y: 225 }));

      var hasMarker = canvas.hasMarker(parentShape, 'drop-ok');

      dragging.end();

      expect(canvas.hasMarker(parentShape, 'drop-ok')).to.be.false;
      expect(canvas.hasMarker(parentShape, 'drop-ok')).to.not.eql(hasMarker);
    }));

  });

  describe('rules', function () {

    it('should not allow shape create', inject(function(canvas, create, elementRegistry, dragging) {
      // given
      var targetGfx = elementRegistry.getGraphics('childShape');

      // when
      create.start(createEvent({ x: 0, y: 0 }), childShape2);

      dragging.move(createEvent({ x: 200, y: 375 }));
      dragging.hover({ element: childShape, gfx: targetGfx});
      dragging.move(createEvent({ x: 200, y: 400 }));

      dragging.end();

      expect(elementRegistry.getGraphics('childShape2')).to.not.exist;
    }));


    it('should add OK marker', inject(function(canvas, create, elementRegistry, dragging) {
      // given
      var targetGfx = elementRegistry.getGraphics('parentShape');

      // when
      create.start(createEvent({ x: 0, y: 0 }), childShape2);

      dragging.move(createEvent({ x: 200, y: 50 }));
      dragging.hover({ element: parentShape, gfx: targetGfx});
      dragging.move(createEvent({ x: 200, y: 225 }));

      expect(canvas.hasMarker(parentShape, 'drop-ok')).to.be.true;
    }));


    it('should add NOT-OK marker', inject(function(canvas, create, elementRegistry, dragging) {
      // given
      var targetGfx = elementRegistry.getGraphics('childShape');

      // when
      create.start(createEvent({ x: 0, y: 0 }), childShape2);

      dragging.move(createEvent({ x: 200, y: 375 }));
      dragging.hover({ element: childShape, gfx: targetGfx});
      dragging.move(createEvent({ x: 200, y: 400 }));

      expect(canvas.hasMarker(childShape, 'drop-not-ok')).to.be.true;
    }));

  });

});
