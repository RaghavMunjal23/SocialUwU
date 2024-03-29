import React, { useEffect, useState } from "react";
import "./MiddleStuffDark.css";
import FeedDark from "../FeedDark/FeedDark";
import { Avatar, IconButton, Tooltip } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { createPost, getPosts } from "../../actions/posts";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from "@mui/material/Button";
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import axios from "axios"


const MiddleStuffDark = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(getPosts())
  }, [dispatch])
  const posts = useSelector((posts: any) => posts.posts.postsData);
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const Input = styled('input')({
    display: 'none',
  });

  const [postData, setPostData] = useState({
    caption: "",
    image: ""
  })

  //@ts-ignore
  const imageUpload = async (e) => {
    const data = new FormData()
    data.append("image", e?.target?.files[0])
    await axios.post("https://socialuwu.herokuapp.com/upload", data).then((res) => {
      const data = res?.data
      setPostData({ ...postData, image: `https://socialuwu.herokuapp.com/images/${data?.filename}` })
    })
  }

  //@ts-ignore
  const token = JSON.parse(localStorage.getItem("token"));
  //@ts-ignore  
  const tokenboi = token?.token

  const createPostboi = () => {
    handleClose()
    dispatch(createPost(postData, tokenboi))
  }

  return (
    <div>
      <div className="create-post-div-dark">
        <Avatar src="" alt="" sx={{
          width: 48,
          height: 48,
        }} />
        <Tooltip title="Create post">
          <input type="text" placeholder="Create shitty post ..." onClick={handleClickOpen} onKeyPress={handleClickOpen} />
        </Tooltip>
        <p className="buttonboi">Create</p>
      </div>
      <div className="feeds">
        {posts?.map((post: any, index: React.Key) => (
          <FeedDark key={index} posts={post} />
        ))}
      </div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <p style={{
            color: "black",
            fontSize: "1.4rem",
            fontWeight: "bold"
          }}>Create Post</p>
          <IconButton onClick={handleClose}>
            <i className="uil uil-multiply"></i>
          </IconButton>
        </DialogTitle>
        <DialogContent style={{
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          alignItems: "center",
          gap: "1rem"
        }}>
          <TextField
            id="outlined-textarea"
            placeholder="Caption ..."
            multiline
            rows={4}
            sx={{
              width: "540px"
            }}
            onChange={(e) => {
              setPostData({ ...postData, caption: e.target.value })
            }}
          />
          <label htmlFor="contained-button-file">
            <Input accept="image/*" id="contained-button-file" type="file" onChange={imageUpload} />
            <Button variant="contained" component="span">
              Upload Image
            </Button>
          </label>
          {postData?.image ? <img src={postData?.image} alt="" style={{
            width: "100%",
            height: "auto",
          }} /> : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          {postData?.image && postData?.caption?.trim()?.length > 5 && postData?.caption?.trim()?.length < 100 ? <Button onClick={createPostboi}>
            Create
          </Button> : <Button disabled>
            Create
          </Button>}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MiddleStuffDark;
