'use strict';

var inherits = require('inherits');

var RuleProvider = require('../../../../../lib/features/rules/RuleProvider');

function CreateRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

CreateRules.$inject = [ 'eventBus' ];

inherits(CreateRules, RuleProvider);

module.exports = CreateRules;


CreateRules.prototype.init = function() {
    this.addRule('shape.create', function(context) {
        var parent = context.parent;

        if (/child/.test(parent.id)) {
            return false;
        }

        return true;
    });
};
