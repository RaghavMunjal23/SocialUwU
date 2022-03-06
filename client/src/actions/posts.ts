import * as api from "../api/api";
import { Dispatch } from "redux";
import { toast } from "react-toastify";

export const getPosts = () => async (dispatch: Dispatch) => {
    const { data } = await api.get_posts()
    if (data.error){
        toast.error(data.error, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
        });
    }
    else{
        dispatch({
            type: "GET_POSTS",
            data,
        })
    }
}