var fsm = require("state.js");

var transitions = [
  "submitIdea",
  "fixIdea",
  "approveIdea",
  "submitDraft",
  "approveDraft",
  "approveGraphics",
  "approveLanguage",
  "approveGraphics",
  "approveLanguage"
];

var evaluateAction = function (options) {
  var roles = options.user.roles;
  var action = options.action;
  var state = options.article.state;
  var id = options.article.id;

  // create the state machine model elements
  var model = new fsm.StateMachine("model").setLogger(console);
  var initial = new fsm.PseudoState("initial", model, fsm.PseudoStateKind.Initial);

  var idea = new fsm.State("idea", model);
  var pitch = new fsm.State("pitch", model);
  var inProgress = new fsm.State("inProgress", model);
  var draft = new fsm.State("draft", model);
  var content = new fsm.State("content", model);
  var languageOK = new fsm.State("languageOK", model);
  var graphicsOK = new fsm.State("graphicsOK", model);
  var reviewed = new fsm.State("reviewed", model);
  var scheduled = new fsm.State("scheduled", model);
  var published = new fsm.State("published", model);
  var takenDown = new fsm.State("takenDown", model);
  var rejected = new fsm.State("rejected", model);

  const DEFAULT_REGION = "model.default";

  var states = {idea, pitch, inProgress, draft, content, languageOK, graphicsOK, reviewed, scheduled, published, takenDown, rejected};

  console.log(states[0]);

  function transition(action) {
    return function(message) {
      // if (typeof message === "string") console.log(message);
      return message === action;
    }
  }

  var error = undefined;

  function guardedTransition(requiredRole, action) {
    return function(message) {
      // if (typeof message === "string") console.log(message);
      if (message === action) {
        console.log('guarded!');
        console.log(roles);
        console.log(requiredRole);
        console.log(roles.indexOf(requiredRole));
        if (roles.indexOf(requiredRole) === -1) {
          error = `Insufficient privileges "${roles}" for "${action}", "${requiredRole}" required`;
          return false;
        } else {
          return true;
        }
      }
    }
  }

  function getStateName(instance) {
    return instance.last[DEFAULT_REGION].name;
  }

  idea.to(pitch).when(guardedTransition("writer", "submitIdea"));
  pitch.to(idea).when(guardedTransition("editor", "fixIdea"));
  pitch.to(inProgress).when(guardedTransition("editor", "approveIdea"));
  inProgress.to(draft).when(guardedTransition("writer", "submitDraft"));
  draft.to(content).when(guardedTransition("editor", "approveDraft"));

  content.to(graphicsOK).when(guardedTransition("visual", "approveGraphics"));
  content.to(languageOK).when(guardedTransition("proofreader", "approveLanguage"));
  languageOK.to(reviewed).when(guardedTransition("visual", "approveGraphics"));
  graphicsOK.to(reviewed).when(guardedTransition("proofreader", "approveLanguage"));

  // create a state machine instance
  var instance = new fsm.StateMachineInstance(id);

  // Load initial state
  initial.to(states[state] || idea);

  // initialise the model and instance
  fsm.initialise(model, instance);
  const beforeState = getStateName(instance);
  console.log('Will evaluate ' + action);
  fsm.evaluate(model, instance, action);
  const afterState = getStateName(instance);
  const success = (beforeState !== afterState)
  return {beforeState, afterState, action, success, error};
}

module.exports = {evaluateAction, transitions};