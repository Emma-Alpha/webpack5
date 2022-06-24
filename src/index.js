import React from "react";
import { createRoot } from "react-dom/client"
import { Button, Avatar } from "antd";
import "./index.css"
import User1 from "./user1.jpeg"
import styles from "./index.less"

function HelloMessage({ name }) {

  console.log(styles)
  return <div>
    Hello {name}
    <div className={"demo1"}>
      <Button>测试</Button>
    </div>
    <Avatar src={User1}/>
    <div className={styles["demo1"]}>是不是红色的呢？</div>
  </div>
}


const root = createRoot(
  document.getElementById("root")
)
root.render(<HelloMessage name={"Bob"} />)

