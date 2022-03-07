import axios from "axios";

const API = axios.create({
  baseURL: "https://socialuwu.herokuapp.com/",
});

export const login = (data: any) => API.post(`/api/users/login`, data);
export const register = (data: any) => API.post(`/api/users/register`, data);
export const get_user_by_id = (id: string) =>
  API.get(`/api/users/getbyid/${id}`);
export const update_profile = (data: any, token: any) => API.put(`/api/users/update_profile`, data, {
  headers: {
    "token": token
  }
});
export const follow_user = (id: any, token: any) => API.put(`/api/users/follow/${id}`, {}, {
  headers: {
    "token": token
  }
})
export const get_posts = () => API.get(`/api/posts`);
export const get_trending_posts = () => API.get(`/api/posts/trending`);
export const get_user_posts = (id: string) => API.get(`/api/posts/userposts/${id}`)
export const delete_post = (id: string, token: any) => API.delete(`/api/posts/${id}`, {
  headers: {
    "token": token
  }
})
export const like_post = (id: string, token: any) => API.put(`/api/posts/like/${id}`, {}, {
  headers: {
    "token": token
  }
})
export const create_post = (data: any, token: any) => API.post("/api/posts", data, {
  headers: {
    "token": token
  }
})