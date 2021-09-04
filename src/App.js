import React, { useLayoutEffect, useState } from "react";
import rough from "roughjs/bundled/rough.esm";
import ReactDOM from "react-dom";
import Button from "@material-ui/core/Button";
import axios from "axios";

import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import RestoreIcon from "@material-ui/icons/Restore";
import FavoriteIcon from "@material-ui/icons/Favorite";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import NavigationIcon from "@material-ui/icons/Navigation";
import TextField from "@material-ui/core/TextField";
import PropTypes from "prop-types";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import AccountCircle from "@material-ui/icons/AccountCircle";
import qs from "qs";
import GestureIcon from "@material-ui/icons/Gesture";
import MouseIcon from "@material-ui/icons/Mouse";
import PermMediaIcon from "@material-ui/icons/PermMedia";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

// STYLES CODE BELOW

// Modal Styles

const paperStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

const modalUseStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(15, 20, 18),
  },
}));

// const StyledCanvas = styled.canvas((flex - grow: 1));
const canvasUseStyles = makeStyles((theme) => ({
  canvasRoot: {
    height: "100%",
    width: "100%",
    position: "relative",
  },
}));

// NavBar Styles
const navbarUseStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  drawing: {
    flexGrow: 1,
  },
  customizeToolbar: {
    minHeight: 50,
  },
}));

const navigationUseStyles = makeStyles({
  root: {
    width: 500,
  },
});

const textFieldUseStyles = makeStyles((theme) => ({
  formField: {
    "& > *": {
      margin: theme.spacing(1),
      width: "25",
    },
    input: {
      color: "white",
    },
  },
}));

const loginFormUseStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: "25ch",
  },
}));

// STYLES CODE ABOVE

// CORE APP CODE BELOW

const generator = rough.generator();

function createElement(id, x1, y1, x2, y2, tool, color) {
  const roughElement = generator.rectangle(x1, y1 - 80, x2 - x1, y2 - y1, {
    fill: color,
  });
  return { id, x1, y1, x2, y2, tool, roughElement };
}

const nearPoint = (x, y, x1, y1, name) => {
  return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;
};

// const drawCorner = (element) => {
//   const { x1, y1, x2, y2 } = element;
//   const tl = { id: 1, x1: x1 - 8, y1: y1 - 8, x2: x1 - 1, y2: y1 - 1 };
//   const tr = { id: 2, x1: x1 + 8, y1: y1 + 8, x2: x1 + 1, y2: y1 + 1 };
//   return { tl, tr };
// };

const cursorForPosition = (position) => {
  switch (position) {
    case "tl":
    case "br":
    case "start":
    case "end":
      return "nwse-resize";
    case "tr":
    case "bl":
      return "nesw-resize";
    default:
      return "move";
  }
};

const resizedCoordinates = (clientX, clientY, position, coordinates) => {
  const { x1, y1, x2, y2 } = coordinates;
  switch (position) {
    case "tl":
    case "start":
      return { x1: clientX, y1: clientY, x2, y2 };
    case "tr":
      return { x1, y1: clientY, x2: clientX, y2 };
    case "bl":
      return { x1: clientX, y1, x2, y2: clientY };
    case "br":
    case "end":
      return { x1, y1, x2: clientX, y2: clientY };
    default:
      return null;
  }
};

const isWithinElement = (x, y, element) => {
  const { x1, x2, y1, y2 } = element;
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  return x >= minX && x <= maxX && y >= minY && y <= maxY;
};

const positionWithinElement = (x, y, element) => {
  const { x1, x2, y1, y2, tool } = element;
  // const minX = Math.min(x1, x2);
  // const maxX = Math.max(x1, x2);
  // const minY = Math.min(y1, y2);
  // const maxY = Math.max(y1, y2);
  if (tool === "Select") {
    const isTopLeft = nearPoint(x, y, x1, y1, "tl");
    const isTopRight = nearPoint(x, y, x2, y1, "tr");
    const isBottomLeft = nearPoint(x, y, x1, y2, "bl");
    const isBottomRight = nearPoint(x, y, x2, y2, "br");

    const isInside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
    return isTopLeft || isInside || isTopRight || isBottomLeft || isBottomRight;
  } else {
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x, y };
    const offset = distance(a, b) - (distance(a, c) + distance(b, c));
    const start = nearPoint(x, y, x1, y1, "start");
    const end = nearPoint(x, y, x2, y2, "end");
    const inside = Math.abs(offset) < 1 ? "inside" : null;
    return start || end || inside;
  }
};

const distance = (a, b) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

const getElementAtPosition = (x, y, elements) => {
  // return elements.find((element) => isWithinElement(x, y, element));
  return elements
    .map((element) => ({
      ...element,
      position: positionWithinElement(x, y, element),
    }))
    .find((element) => element.position !== null);
};

// export const [loginStateKey, setLoginStateKey] = useState(null);
const App = () => {
  const [elements, setElements] = useState([]);
  const [action, setAction] = useState("none");
  const [tool, setTool] = useState("Move");
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectModeElements, setSelectModeElements] = useState([]);
  const [savedElements, setSavedElements] = useState([]); // [[saveId, saveName, [cornersObject]]]
  const [drawingName, setDrawingName] = useState(null);
  const [editDrawing, setEditDrawing] = useState(null);
  const [getSaved, setGetSaved] = useState([]); // {saveId, saveName, corners, username}
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [loginStateKey, setLoginStateKey] = useState(() => {
    const keyStorage = localStorage.getItem("userKey");
    return keyStorage !== null ? JSON.parse(keyStorage).key : null;
  });
  const [userPk, setUserPk] = useState(null);

  // UI RELATED BELOW

  // navbar
  const navbarClasses = navbarUseStyles();
  const navigationClasses = navigationUseStyles();
  const [value, setValue] = React.useState(0);
  const [anchorEl, setAnchorEl] = React.useState(null); //Simple Menu
  // Simple Menu
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // modal
  const modalClasses = modalUseStyles();

  // canvas
  const paperClasses = paperStyles();
  const canvasClasses = canvasUseStyles();

  // text field
  const textFieldClasses = textFieldUseStyles();

  // Login or Sign up
  const loginFormClasses = loginFormUseStyles();
  const [openLogin, setOpenLogin] = React.useState(false);
  const [openSignup, setOpenSignup] = React.useState(false);
  const [auth, setAuth] = React.useState(() => {
    const keyStorage = localStorage.getItem("userKey");
    return keyStorage !== null ? true : false;
  });
  const [anchorElProfile, setAnchorElProfile] = React.useState(null);
  const openProfile = Boolean(anchorElProfile);

  // function fetchUserKey() {
  //   // const userAuthKey = JSON.parse(localStorage.getItem("userKey"));
  //   // setLoginStateKey(userAuthKey.key);
  //   setAuth(true);
  // }

  // if (loginStateKey !== null) {
  //   setAuth(true);
  //   setUsername(null);
  //   setPassword(null);
  //   setConfirmPassword(null);
  // }

  const loginClickOpen = () => {
    setOpenLogin(true);
  };

  const loginClickClose = () => {
    setOpenLogin(false);
    setUsername(null);
    setPassword(null);
    setConfirmPassword(null);
  };

  const signupClickOpen = () => {
    setOpenSignup(true);
  };

  const signupClickClose = () => {
    setOpenSignup(false);
    setUsername(null);
    setPassword(null);
    setConfirmPassword(null);
  };

  const handleProfileMenu = (event) => {
    setAnchorElProfile(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorElProfile(null);
  };

  const usernameChange = (e) => {
    setUsername(e.currentTarget.value);
  };

  const passwordChange = (e) => {
    setPassword(e.currentTarget.value);
  };
  const confirmPasswordChange = (e) => {
    setConfirmPassword(e.currentTarget.value);
  };

  // function openLogin() {
  //   loginClickClose();
  // }

  function userSignUp() {
    signupClickClose();
    axios({
      method: "post",
      url: "/api/v1/users/auth/register/",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        email: username,
        password1: password,
        password2: confirmPassword,
      },
    })
      .then(function (response) {
        localStorage.setItem("userKey", JSON.stringify(response.data));
        console.log(response.data);
        const userAuthKey = JSON.parse(localStorage.getItem("userKey"));
        setLoginStateKey(userAuthKey.key);
        setAuth(true);
        // setUsername(null);
        // setPassword(null);
        // setConfirmPassword(null);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  function userLogout() {
    handleProfileClose();
    const authToken = "Token " + loginStateKey;
    // console.log(authToken);
    axios({
      method: "post",
      url: "/api/v1/users/auth/logout/",
      headers: {
        Authorization: authToken,
      },
    })
      .then(function (response) {
        localStorage.removeItem("userKey");
        console.log(response.data);
        setLoginStateKey(null);
        setAuth(false);
        // setUsername(null);
        // setPassword(null);
        // setConfirmPassword(null);
      })
      .catch(function (error) {
        localStorage.removeItem("userKey");
        console.log(error);
      });

    setUserPk(null);
    setSavedElements([]);
    clearElements();
  }

  function userLoggingin() {
    loginClickClose();
    axios({
      method: "post",
      url: "/api/v1/users/auth/login/",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        email: username,
        password: password,
      },
    })
      .then(function (response) {
        localStorage.setItem("userKey", JSON.stringify(response.data));
        console.log(response.data);
        let userAuthKey = JSON.parse(localStorage.getItem("userKey"));
        setLoginStateKey(userAuthKey.key);
        setAuth(true);
        getSavedElements(userAuthKey.key);
        // setUsername(null);
        // setPassword(null);
        // setConfirmPassword(null);
      })
      // .then(function (response) {
      //   console.log(response);
      //   console.log(loginStateKey);
      //   let dataInput = response.data;
      //   let userAuthKey = dataInput.key;
      //   getSavedElements(userAuthKey);
      // })
      .catch(function (error) {
        console.log(error);
      });
  }

  // UI RELATED ABOVE
  // function getSavedElementsAsync(authKey) {
  //   getSavedElements();
  // }
  function getSavedElements(authKey) {
    const authToken = "Token " + authKey;

    axios
      .get("/api/drawings", {
        headers: { Authorization: authToken },
      })
      .then(function (response) {
        setGetSaved(
          response.data.map(({ saveName, corners, saveId }) => [
            saveName,
            corners,
            saveId,
          ])
        );
        console.log(response.data);
      })
      .catch((err) => console.log(err));

    // _callback();
    // console.log(response);
    // const trimmedData = response.data;
    // console.log(trimmedData);
  }

  function loadDrawing(drawName, corners, drawingIndex) {
    // console.log(corners[0]);
    // let drawingIndex = corners[0];
    let mainElements = [];
    corners.forEach((rectangle) => {
      let newElement = createElement(
        rectangle[0],
        rectangle[1],
        rectangle[2],
        rectangle[3],
        rectangle[4],
        "draw",
        ""
      );
      // console.log("newElement: " + newElement);
      mainElements = [...mainElements, newElement];
    });

    setSavedElements((prevState) => [
      ...prevState,
      [drawingIndex, drawName, mainElements],
    ]);
    setElements([]);
  }

  function manualSavedRetrieval() {
    console.log(getSaved);
    // console.log(JSON.parse(getSaved));
    // let jsonSaved = JSON.parse(getSaved);
    // console.log(getSaved[0][1]);
    let cornersArray = null;
    let tempDrawingName = null;
    let saveIndex = null;
    getSaved.forEach((item) => {
      tempDrawingName = item[0];
      saveIndex = item[2];
      console.log(item[0]);
      console.log(item[1]);
      let corners = JSON.parse(item[1]);
      console.log(corners);
      loadDrawing(tempDrawingName, corners, saveIndex);
    });
  }

  function openDrawing(saveId) {
    //open drawing
    clearElements();
    // const saveId = event.currentTarget.getAttribute("value");
    console.log(saveId);
    const retrievedElement = savedElements.find(
      (element) => element[0] === saveId
    );
    console.log(retrievedElement);
    // const saveId = retrievedElement[0];
    // const saveId = event.target.value;
    // console.log(saveId);
    setElements(retrievedElement[2]);
    setSelectedElement(null);
    setEditDrawing(saveId);
  }

  function onClickOpenDrawing(saveId) {
    handleMenuClose();
    openDrawing(saveId);
  }
  const savedItemsMenu = savedElements.map((item, index) => (
    <MenuItem onClick={onClickOpenDrawing.bind(this, item[0])} value={item[0]}>
      {item[1]}
    </MenuItem>
  ));
  const savedItems = savedElements.map((item, index) => (
    <div>
      <li>{item[1]}</li>
      <Button
        variant="contained"
        color="primary"
        type="Button"
        id={index}
        value={item[0]}
        onClick={openDrawing.bind(this, item[0])}
      >
        Open
      </Button>
    </div>
  ));

  function editVisual() {
    if (editDrawing !== null) {
      const saveId = editDrawing;
      const saveName = savedElements[saveId][1];
      return (
        <Button
          variant="contained"
          color="primary"
          type="Button"
          id="saveEdit"
          onClick={saveDrawings}
        >
          Save edit
          {/* Save {saveName} */}
        </Button>
      );
    } else {
      return <div></div>;
    }
  }
  const editModeVisual = editVisual();

  function updateUserPk() {
    const authToken = "Token " + loginStateKey;
    if (userPk === null) {
      axios
        .get("/api/v1/users/auth/user/", {
          headers: { Authorization: authToken },
        })
        .then((res) => {
          setUserPk(res.data.pk);
        })
        .catch((err) => console.log(err));
    }
  }

  function handleInputChange(event) {
    setDrawingName(event.target.value);
  }
  function saveDrawings(event) {
    event.preventDefault();
    const drawingIndex = savedElements.length;
    if (elements && editDrawing === null) {
      setSavedElements((prevState) => [
        ...prevState,
        [drawingIndex, drawingName, elements],
      ]);
    } else if (elements && editDrawing !== null) {
      const saveId = editDrawing;
      savedElements[saveId][2] = elements;
    }

    // const elementsOutput = JSON.stringify(elements);
    let elementsOutput = JSON.stringify(
      elements.map(({ id, x1, y1, x2, y2 }) => [id, x1, y1, x2, y2])
    );
    console.log(elementsOutput);
    // elementsOutput = JSON.parse(elementsOutput);
    // console.log(elementsOutput);

    // setElements(JSON.parse(elementsOutput));
    if (auth) {
      const { x1, y1, x2, y2 } = elements;
      const authToken = "Token " + loginStateKey;
      axios({
        method: "post",
        url: "/api/drawings/",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        data: {
          username: userPk,
          saveId: drawingIndex,
          saveName: drawingName,
          corners: elementsOutput,
        },
      })
        .then(function (response) {
          console.log(response.data);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }

  function clearElements() {
    setElements([]);
    setSelectedElement([]);
    setEditDrawing(null);
  }

  function deleteElement() {
    if (selectedElement && elements && tool === "Select") {
      const { id } = selectedElement;
      const elementsCopy = elements.filter((item) => item.id !== id);
      // elementsCopy = elementsCopy.splice(id, 1);
      setElements(elementsCopy);
    }
  }

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);
    const rect = generator.rectangle(100, 100, 150, 150);
    // roughCanvas.draw(rect);
    elements.forEach(({ roughElement }) => roughCanvas.draw(roughElement));
    selectModeElements.forEach(({ roughElement }) =>
      roughCanvas.draw(roughElement)
    );
  }, [elements]);

  const updateElement = (id, x1, y1, clientX, clientY, color) => {
    const updatedElement = createElement(
      id,
      x1,
      y1,
      clientX,
      clientY,
      tool,
      color
    );
    const elementsCopy = [...elements];
    elementsCopy[id] = updatedElement;
    setElements(elementsCopy);
  };

  const updateSelectElement = (id, x1, y1, clientX, clientY) => {
    const updatedElement = createElement(id, x1, y1, clientX, clientY, tool);
    const elementsCopy = [...selectModeElements];
    elementsCopy[id] = updatedElement;
    setSelectModeElements(elementsCopy);
  };

  const adjustElementCoordinates = (element) => {
    const { x1, y1, x2, y2, tool } = element;
    if (tool === "draw") {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      return { x1: minX, x2: maxX, y1: minY, y2: maxY };
    } else {
      if (x1 < x2 || (x1 === x2 && y1 < y2)) {
        return { x1, y1, x2, y2 };
      } else {
        return { x1: x2, y1: y2, x2: x1, y2: y1 };
      }
    }
  };

  /**
   *
   * Mouse Handler definitions
   */
  const handleMouseDown = (event) => {
    const { clientX, clientY } = event;
    if (selectedElement && elements.length !== 0) {
      const { id } = selectedElement;
      const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[id]);
      updateElement(id, x1, y1, x2, y2, "");
    }
    // if (tool === "Move" || tool === "Select") {
    if (tool === "Select") {
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        const offsetX = clientX - element.x1;
        const offsetY = clientY - element.y1;
        setSelectedElement({ ...element, offsetX, offsetY });

        // if (selectedElement && selectModeElements.length === 0) {
        //   const { id } = selectedElement;
        //   const corners = drawCorner(elements[id]);
        //   console.log(corners);
        //   const newId = selectModeElements.length;
        //   corners.map(({ id, x1, y1, x2, y2 }) =>
        //     setSelectModeElements(
        //       createElement(id, x1, y1, x2, y2, tool, action)
        //     )
        //   );
        //   // const cornerElement = createElement(
        //   //   newId,
        //   //   x1,
        //   //   y1,
        //   //   x2,
        //   //   y2,
        //   //   tool,
        //   //   action
        //   // );
        //   // setSelectModeElements(cornerElement);
        // }
        // setAction("moving");
        if (element.position === "inside") {
          setAction("moving");
        } else {
          setAction("resizing");
          // setSelectModeElements([]);
        }
      } else {
        if (selectedElement) {
          const { id } = selectedElement;
          const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[id]);
          updateElement(id, x1, y1, x2, y2, "");
        }
        setSelectedElement(null);
        // setSelectModeElements([]);
      }

      //moving
    } else if (tool === "draw") {
      setAction("drawing");
      const id = elements.length;
      const element = createElement(
        id,
        clientX,
        clientY,
        clientX,
        clientY,
        tool,
        ""
      );
      setElements((prevState) => [...prevState, element]);
      setSelectedElement(element);
    }
  };
  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;
    if (tool === "Select") {
      const element = getElementAtPosition(clientX, clientY, elements);
      event.target.style.cursor = element
        ? cursorForPosition(element.position)
        : "default";
    }
    if (action === "drawing") {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      updateElement(index, x1, y1, clientX, clientY, "");
    } else if (action === "moving") {
      // move drawed shape
      const { id, x1, x2, y1, y2, offsetX, offsetY } = selectedElement;
      // const {
      //   id_corner,
      //   x1_corner,
      //   x2_corner,
      //   y1_corner,
      //   y2_corner,
      // } = selectModeElements;
      const width = x2 - x1;
      const height = y2 - y1;
      const offsetWidth = clientX - offsetX;
      const offsetHeight = clientY - offsetY;

      updateElement(
        id,
        offsetWidth,
        offsetHeight,
        offsetWidth + width,
        offsetHeight + height,
        "red"
      );

      // const width_corner = x2_corner - x1_corner;
      // const height_corner = y2_corner - y1_corner;
      // updateSelectElement(
      //   id_corner,
      //   offsetWidth,
      //   offsetHeight,
      //   offsetWidth + width_corner,
      //   offsetHeight + height_corner
      // );
    } else if (action === "resizing") {
      const { id, type, position, ...coordinates } = selectedElement;
      const { x1, y1, x2, y2 } = resizedCoordinates(
        clientX,
        clientY,
        position,
        coordinates
      );
      updateElement(id, x1, y1, x2, y2, tool, "red");
    }
  };
  const handleMouseUp = () => {
    if (selectedElement && elements.length !== 0) {
      const { id } = selectedElement;
      // const index = elements.length - 1;
      // const { id } = elements[index];
      if (action === "drawing" || action === "resizing") {
        // if (action === "drawing") {
        // const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
        const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[id]);
        updateElement(id, x1, y1, x2, y2, "");
      }
    }
    // const index = selectedElement.id;
    // const { id } = selectedElement;
    // // const index = elements.length - 1;
    // // const { id } = elements[index];
    // if (action === "drawing" || action === "resizing") {
    //   // if (action === "drawing") {
    //   // const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
    //   const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[id]);
    //   updateElement(id, x1, y1, x2, y2);
    // }
    setAction("none");

    // setSelectedElement(null);
  };

  return (
    <div>
      <div className={navbarClasses.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              className={navbarClasses.menuButton}
              color="inherit"
              aria-label="menu"
              onClick={handleMenuClick}
            >
              <PermMediaIcon />
            </IconButton>
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <div>
                <text style={{ fontWeight: "bold" }}>Your Saved Drawings</text>
                {/* <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                <MenuItem onClick={handleMenuClose}>My account</MenuItem>
                <MenuItem onClick={handleMenuClose}>Logout</MenuItem> */}
                {savedItemsMenu}
              </div>
            </Menu>

            <Typography variant="h6">Draw Your Rectangles</Typography>
            <div className={navbarClasses.title}></div>
            <BottomNavigation
              value={value}
              onChange={(event, newValue) => {
                setValue(newValue);
              }}
              showLabels
              className={(navigationClasses.root, navbarClasses.drawing)}
            >
              <BottomNavigationAction
                label="Select"
                checked={tool === "Select"}
                onClick={() => {
                  setTool("Select");
                  updateUserPk();
                }}
                icon={<MouseIcon />}
              />
              <BottomNavigationAction
                label="Draw"
                checked={tool === "draw"}
                onClick={() => {
                  setTool("draw");
                  updateUserPk();
                }}
                icon={<GestureIcon />}
              />
            </BottomNavigation>
            <div className={navbarClasses.title}></div>
            <div className={navbarClasses.title}>
              <Fab
                variant="extended"
                color="secondary"
                type="Button"
                id="delete"
                onClick={deleteElement}
              >
                Delete
              </Fab>
              <Fab
                variant="extended"
                color="disabled"
                type="Button"
                id="clear"
                onClick={clearElements}
              >
                Clear
              </Fab>
              {editModeVisual}
            </div>
            <div className={navbarClasses.title}>
              <form
                id="form"
                noValidate
                autoComplete="off"
                className={textFieldClasses.root}
                onSubmit={saveDrawings}
              >
                {/* <label htmlFor="text">Drawing name: </label> */}
                <TextField
                  id="filled-disabled"
                  label="File Name"
                  variant="filled"
                  InputPros={{
                    className: textFieldClasses.input,
                  }}
                  value={drawingName}
                  onChange={handleInputChange}
                />
                <Fab
                  variant="extended"
                  // color="primary"
                  type="submit"
                  id="save"
                >
                  Save
                </Fab>
              </form>
            </div>
            {/* {loginButton} */}
            {!auth && (
              <div>
                <Button color="inherit" onClick={loginClickOpen}>
                  Login
                </Button>
                <Dialog
                  open={openLogin}
                  onClose={loginClickClose}
                  aria-labelledby="form-dialog-title"
                >
                  <DialogTitle id="form-dialog-title">Login</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      To save your drawings, please Log in to your account
                    </DialogContentText>
                    <TextField
                      margin="dense"
                      id="name"
                      label="Email Address"
                      type="email"
                      fullWidth
                      onChange={usernameChange}
                    />
                    <TextField
                      margin="dense"
                      id="password"
                      label="Password"
                      type="password"
                      fullWidth
                      onChange={passwordChange}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={loginClickClose} color="primary">
                      Cancel
                    </Button>
                    <Button onClick={userLoggingin} color="primary">
                      Login
                    </Button>
                  </DialogActions>
                </Dialog>
              </div>
            )}
            {/* {signupButton} */}
            {!auth && (
              <div>
                <Button color="inherit" onClick={signupClickOpen}>
                  Sign Up
                </Button>
                <Dialog
                  open={openSignup}
                  onClose={signupClickClose}
                  aria-labelledby="form-dialog-title"
                >
                  <DialogTitle id="form-dialog-title">Register</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      To save your drawings, please create an account
                    </DialogContentText>
                    <TextField
                      margin="dense"
                      id="name"
                      label="Email Address"
                      type="email"
                      fullWidth
                      onChange={usernameChange}
                    />
                    <TextField
                      margin="dense"
                      id="password1"
                      label="Password"
                      type="password"
                      fullWidth
                      onChange={passwordChange}
                    />
                    <TextField
                      margin="dense"
                      id="password2"
                      label="Confirm Password"
                      type="password"
                      fullWidth
                      onChange={confirmPasswordChange}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={signupClickClose} color="primary">
                      Cancel
                    </Button>
                    <Button onClick={userSignUp} color="primary">
                      Register
                    </Button>
                  </DialogActions>
                </Dialog>
              </div>
            )}
            {auth && (
              <div>
                <Button color="inherit" onClick={manualSavedRetrieval}>
                  Load Saved
                </Button>
                <IconButton
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleProfileMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorElProfile}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={openProfile}
                  onClose={handleProfileClose}
                >
                  <MenuItem onClick={userLogout}>Logout</MenuItem>
                </Menu>
              </div>
            )}
          </Toolbar>
        </AppBar>
      </div>
      <div>
        <canvas
          // className={canvasClasses.canvasRoot}
          id="canvas"
          width={window.innerWidth}
          height={window.innerHeight - 80}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {" "}
          Canvas
        </canvas>
      </div>
    </div>
  );
};

export default App;
