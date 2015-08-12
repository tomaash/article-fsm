import {evaluateAction} from "./article-fsm";

var article = {
  id: "article_foo",
  state: "idea",
}

var writerUser = {
  role: "writer"
}

var editorUser = {
  role: "editor"
}

var graphicsUser = {
  role: "graphics"
}

var languageUser = {
  role: "language"
}

var result;

const actionsChain = [
  [writerUser, "submitIdea"],
  [writerUser, "approveIdea"],
  [editorUser, "approveIdea"],
  [writerUser, "submitDraft"],
  [editorUser, "approveDraft"],
  [languageUser, "approveLanguage"],
  [graphicsUser, "approveGraphics"]
];

actionsChain.forEach((act)=>{
  result = evaluateAction({
    article: article,
    user: act[0],
    action: act[1]
  })
  console.log(result);
  article.state = result.afterState
})

