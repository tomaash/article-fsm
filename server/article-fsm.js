var _ = require("lodash");
var fsm = require("state.js");

var transitions = [
  "ThumbsUp",
  "Redo",
  "ThumbsDown",
  "RequestDelete",
  "RejectDeleteRequest",
  "Delete",
  "Undelete",
  "MakeUrgent",
  "MakeNotUrgent",
  "PublishUrgently",
  "ThumbsUpLanguage",
  "ThumbsUpVisual",
  "Schedule",
  "Publish",
  "RequestRemove",
  "RejectRemoveRequest",
  "Remove",
  "Publish",
];

var roles = [
  "Writer",
  "Editor",
  "Visual",
  "Proofreader",
  "Scheduler",
  "Admin",
  "System"
];

var evaluateAction = function (options) {
  var roles = options.user.roles;
  var action = options.action;
  var state = options.article.state;
  var id = options.article.id;

  // create the state machine model elements
  var model = new fsm.StateMachine("model").setLogger(console);
  var initial = new fsm.PseudoState("initial", model, fsm.PseudoStateKind.Initial);

  var Deleted = new fsm.State("Deleted", model);
  var Idea = new fsm.State("Idea", model);
  var IdeaUrgent = new fsm.State("IdeaUrgent", model);
  var Rejected = new fsm.State("Rejected", model);
  var Pitch = new fsm.State("Pitch", model);
  var PitchUrgent = new fsm.State("PitchUrgent", model);
  var DeleteRequested = new fsm.State("DeleteRequested", model);
  var InProgress = new fsm.State("InProgress", model);
  var InProgressUrgent = new fsm.State("InProgressUrgent", model);
  var Draft = new fsm.State("Draft", model);
  var DraftUrgent = new fsm.State("DraftUrgent", model);
  var ContentComplete = new fsm.State("ContentComplete", model);
  var LanguageOK = new fsm.State("LanguageOK", model);
  var VisualOK = new fsm.State("VisualOK", model);
  var Reviewed = new fsm.State("Reviewed", model);
  var Scheduled = new fsm.State("Scheduled", model);
  var Published = new fsm.State("Published", model);
  var PublishedDraft = new fsm.State("PublishedDraft", model);
  var PublishedUrgent = new fsm.State("PublishedUrgent", model);
  var LanguageOKUrgent = new fsm.State("LanguageOKUrgent", model);
  var VisualOKUrgent = new fsm.State("VisualOKUrgent", model);
  var RemoveRequested = new fsm.State("RemoveRequested", model);
  var Removed = new fsm.State("Removed", model);

  const DEFAULT_REGION = "model.default";

  var states = {Deleted, Idea, IdeaUrgent, Rejected, Pitch, PitchUrgent, DeleteRequested, InProgress, InProgressUrgent, Draft, DraftUrgent, ContentComplete, LanguageOK, VisualOK, Reviewed, Scheduled, Published, PublishedDraft, PublishedUrgent, LanguageOKUrgent, VisualOKUrgent, RemoveRequested, Removed};

  console.log(states[0]);

  function transition(action) {
    return function(message) {
      // if (typeof message === "string") console.log(message);
      return message === action;
    }
  }

  var error = undefined;

  function guard(requiredRole, action) {
    return function(message) {
      // if (typeof message === "string") console.log(message);
      if (message === action) {
        // console.log('guarded!');
        // console.log(roles);
        // console.log(requiredRole);
        // console.log(roles.indexOf(requiredRole));
        var deny = true;
        if (requiredRole instanceof Array) {
          deny = (_.intersection(requiredRole, roles).length === 0)
        } else {
          deny = roles.indexOf(requiredRole) === -1
        }
        if (deny) {
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

  Idea.to(Pitch).when(guard("Writer", "ThumbsUp"));
  Idea.to(Deleted).when(guard("Writer", "Delete"));
  Idea.to(IdeaUrgent).when(guard("Writer", "MakeUrgent"));
  IdeaUrgent.to(Idea).when(guard("Writer", "MakeNotUrgent"));
  IdeaUrgent.to(PitchUrgent).when(guard("Writer", "ThumbsUp"));
  Deleted.to(Idea).when(guard("Writer", "Undelete"));

  Pitch.to(Idea).when(guard("Editor", "Redo"));
  PitchUrgent.to(IdeaUrgent).when(guard("Editor", "Redo"));
  Pitch.to(Rejected).when(guard("Editor", "ThumbsDown"));
  Pitch.to(InProgress).when(guard("Editor", "ThumbsUp"));
  PitchUrgent.to(InProgressUrgent).when(guard("Editor", "ThumbsUp"));

  InProgress.to(Draft).when(guard("Writer", "ThumbsUp"));
  InProgressUrgent.to(DraftUrgent).when(guard("Writer", "ThumbsUp"));
  InProgressUrgent.to(PublishedUrgent).when(guard("Editor", "PublishUrgently"));
  InProgress.to(DeleteRequested).when(guard("Writer", "RequestDelete"));
  DeleteRequested.to(InProgress).when(guard("Editor", "RejectDeleteRequest"));
  DeleteRequested.to(Deleted).when(guard("Editor", "Delete"));

  Draft.to(ContentComplete).when(guard("Editor", "ThumbsUp"));
  Draft.to(Deleted).when(guard("Editor", "Delete"));
  DraftUrgent.to(PublishedUrgent).when(guard("Editor", "PublishUrgently"));

  ContentComplete.to(VisualOK).when(guard("Visual", "ThumbsUpVisual"));
  ContentComplete.to(LanguageOK).when(guard("Proofreader", "ThumbsUpLanguage"));
  LanguageOK.to(Reviewed).when(guard("Visual", "ThumbsUpVisual"));
  VisualOK.to(Reviewed).when(guard("Proofreader", "ThumbsUpLanguage"));
  Reviewed.to(Scheduled).when(guard("Scheduler", "Schedule"));
  Scheduled.to(Published).when(guard("System", "Publish"));

  PublishedDraft.to(PublishedUrgent).when(guard("Editor", "ThumbsUp"));
  PublishedUrgent.to(PublishedDraft).when(guard(["Visual", "Proofreader"], "ThumbsUp"));

  PublishedUrgent.to(VisualOKUrgent).when(guard("Visual", "ThumbsUpVisual"));
  PublishedUrgent.to(LanguageOKUrgent).when(guard("Proofreader", "ThumbsUpLanguage"));
  LanguageOKUrgent.to(Published).when(guard("Visual", "ThumbsUpVisual"));
  VisualOKUrgent.to(Published).when(guard("Proofreader", "ThumbsUpLanguage"));

  Published.to(RemoveRequested).when(guard("Editor", "RequestRemove"))
  RemoveRequested.to(Published).when(guard("Admin", "RejectRemoveRequest"))
  RemoveRequested.to(Removed).when(guard("Admin", "Remove"))


  // create a state machine instance
  var instance = new fsm.StateMachineInstance(id);

  // Load initial state
  initial.to(states[state] || Idea);

  // initialise the model and instance
  fsm.initialise(model, instance);
  const beforeState = getStateName(instance);
  console.log('Will evaluate ' + action);
  fsm.evaluate(model, instance, action);
  const afterState = getStateName(instance);
  const success = (beforeState !== afterState)
  return {beforeState, afterState, action, success, error};
}

module.exports = {evaluateAction, transitions, roles};