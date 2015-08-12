var fsm = require("state.js");
var stateNames = [
  "idea",
  "pitch",
  "inProgress",
  "draft",
  "content",
  "languageOK",
  "graphicsOK",
  "reviewed",
  "scheduled",
  "published",
  "takenDown",
  "rejected"
];

var evaluateAction = function (options) {
  var role = options.user.role;
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
        if (role !== requiredRole) {
          error = `Insufficient privileges "${role}" for "${action}", "${requiredRole}" required`;
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

  idea.to(pitch).when(transition("submitIdea"));
  pitch.to(idea).when(guardedTransition("editor", "fixIdea"));
  pitch.to(inProgress).when(guardedTransition("editor", "approveIdea"));
  inProgress.to(draft).when(transition("submitDraft"));
  draft.to(content).when(guardedTransition("editor", "approveDraft"));

  content.to(graphicsOK).when(transition("approveGraphics"));
  content.to(languageOK).when(transition("approveLanguage"));
  languageOK.to(reviewed).when(transition("approveGraphics"));
  graphicsOK.to(reviewed).when(transition("approveLanguage"));

  // create a state machine instance
  var instance = new fsm.StateMachineInstance(id);

  // Load initial state
  initial.to(states[state]);

  // initialise the model and instance
  fsm.initialise(model, instance);
  const beforeState = getStateName(instance);
  fsm.evaluate(model, instance, action);
  const afterState = getStateName(instance);
  const success = (beforeState !== afterState)
  return {beforeState, afterState, success, error};
}

module.exports = {evaluateAction, stateNames};