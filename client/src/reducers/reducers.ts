import { combineReducers } from "redux";
import { user } from "./users";
import { profile } from "./profile";
import { posts } from "./posts";

export default combineReducers({
  user,
  profile,
  posts
});
