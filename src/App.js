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
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import Divider from "@material-ui/core/Divider";

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
  root: {},
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
  //   () => {
  //   const localElements = localStorage.getItem("elements");
  //   console.log(localElements);
  //   return localElements !== null ? localElements : [];
  // });
  const [action, setAction] = useState("none");
  const [tool, setTool] = useState("Move");
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectModeElements, setSelectModeElements] = useState([]);
  const [savedElements, setSavedElements] = useState(() => {
    const localSavedElements = localStorage.getItem("savedElements");
    return localSavedElements !== null ? JSON.parse(localSavedElements) : [];
  }); // [[saveId, saveName, [cornersObject]]]
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
  const [savedDrawingMenu, setSavedDrawingMenu] = useState(false);

  // Auth Errors
  const [signUpEmailError, setSignUpEmailError] = useState(null);
  const [pass1Error, setPass1Error] = useState(null);
  const [pass2Error, setPass2Error] = useState(null);
  const [loginEmailError, setLoginEmailError] = useState(null);
  const [loginPassError, setLoginPassError] = useState(null);

  // Simple Menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setSavedDrawingMenu(true);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSavedDrawingMenu(false);
  };

  const handleMenuOpenOnly = () => {
    setSavedDrawingMenu(true);
  };

  const handleMenuCloseOnly = () => {
    setSavedDrawingMenu(false);
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
        setUsername(null);
        setPass1Error(null);
        setPass2Error(null);
        setSignUpEmailError(null);
        return userAuthKey;
      })
      .then(function (key) {
        updateUserPk(key);
      })
      .catch(function (error) {
        setPass1Error(error.response.data.password1);
        setSignUpEmailError(error.response.data.email);
        signupClickOpen();
        if (error.response.data.non_field_errors) {
          setPass1Error(error.response.data.non_field_errors);
          setPass2Error(error.response.data.non_field_errors);
          signupClickOpen();
        }
        console.log("error");
        console.log(error.response);
        console.log(error.response.data);
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
      })
      .catch(function (error) {
        localStorage.removeItem("userKey");
        console.log(error);
      });

    setUserPk(null);
    setSavedElements([]);
    localStorage.removeItem("savedElements");
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
        return userAuthKey.key;
      })
      .then(function (key) {
        updateUserPk(key);
        return getSavedElements(key);
      })
      .then(function (parsedSavedElements) {
        console.log("parsedSavedElements: ");
        console.log(parsedSavedElements);
        manualSavedRetrieval(parsedSavedElements);
        setLoginEmailError(null);
        setLoginPassError(null);
        return;
      })
      .catch(function (error) {
        setLoginEmailError(error.response.data.email);
        setLoginPassError(error.response.data.password);
        console.log(error);

        if (error.response.data.non_field_errors) {
          setLoginEmailError(error.response.data.non_field_errors);
          setLoginPassError(error.response.data.non_field_errors);
        }
        loginClickOpen();
      });
  }

  // UI RELATED ABOVE
  // function getSavedElementsAsync(authKey) {
  //   getSavedElements();
  // }
  function deleteSavedElements(saveId) {
    const authToken = "Token " + loginStateKey;
    return axios
      .get("/api/drawings", {
        headers: { Authorization: authToken },
        params: {
          saveId: saveId,
        },
      })
      .then(function (response) {
        console.log("get response below:");
        console.log(response.data);
        return response.data;
      })
      .then(function (data) {
        let rowId = data[0].id;
        console.log("Deleting row with following id: ");
        console.log(rowId);
        console.log("authToken below: ");
        console.log(authToken);
        return axios({
          method: "delete",
          url: "/api/drawings/" + rowId.toString(),
          headers: { Authorization: authToken },
        })
          .then(function (response) {
            const copiedSavedElements = savedElements;
            console.log("copied saved elements:");
            console.log(copiedSavedElements);
            copiedSavedElements.splice(saveId, 1);
            console.log("after splice:");
            console.log(copiedSavedElements);
            return postDeleteIndexFix(copiedSavedElements);
            // savedElements.splice(saveId, 1);
            return;
          })
          .then(function (newSavedElements) {
            setSavedElements(newSavedElements);
            localStorage.setItem(
              "savedElements",
              JSON.stringify(newSavedElements)
            );
          })
          .then(function () {
            handleMenuCloseOnly();
          })
          .then(function () {
            handleMenuOpenOnly();
          })
          .catch(function (error) {
            console.log(error);
          });
      });
  }
  function postDeleteIndexFix(elementsArray) {
    let res = elementsArray;
    res.forEach((drawings, index) => {
      if (drawings[0] !== index) {
        let dbId = drawings[3];
        let drawName = drawings[1];
        const authToken = "Token " + loginStateKey;
        let elementsOutput = JSON.stringify(
          drawings[2].map(({ id, x1, y1, x2, y2 }) => [id, x1, y1, x2, y2])
        );
        axios({
          method: "put",
          url: "/api/drawings/" + dbId,
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken,
          },
          data: {
            username: userPk,
            saveId: index,
            saveName: drawName,
            corners: elementsOutput,
          },
        });
        drawings[0] = index;
      }
    });
    console.log("Fixed array below");
    console.log(res);
    return res;
  }
  function getSavedElements(authKey) {
    const authToken = "Token " + authKey;

    return axios
      .get("/api/drawings", {
        headers: { Authorization: authToken },
      })
      .then(function (response) {
        setGetSaved(
          response.data.map(({ saveName, corners, saveId, id }) => [
            saveName,
            corners,
            saveId,
            id,
          ])
        );
        console.log(response.data);
        return response.data.map(({ saveName, corners, saveId, id }) => [
          saveName,
          corners,
          saveId,
          id,
        ]);
      })
      .catch((err) => console.log(err));

    // _callback();
    // console.log(response);
    // const trimmedData = response.data;
    // console.log(trimmedData);
  }

  function loadDrawing(drawName, corners, drawingIndex, dbId) {
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
      [drawingIndex, drawName, mainElements, dbId],
    ]);
    savedDrawingLocallyWithDbId(drawingIndex, drawName, mainElements, dbId);
    setElements([]);
  }

  function manualSavedRetrieval(parsedRetrievedElements) {
    // console.log("getSavedManual: ");
    // console.log(getSaved);
    // console.log(JSON.parse(getSaved));
    // let jsonSaved = JSON.parse(getSaved);
    // console.log(getSaved[0][1]);
    let cornersArray = null;
    let tempDrawingName = null;
    let saveIndex = null;
    let dbId;
    parsedRetrievedElements.forEach((item) => {
      tempDrawingName = item[0];
      saveIndex = item[2];
      dbId = item[3];
      // console.log(item[0]);
      // console.log(item[1]);
      // console.log(item[3]);
      let corners = JSON.parse(item[1]);
      console.log(corners);
      loadDrawing(tempDrawingName, corners, saveIndex, dbId);
      // localStorage.setItem("savedElements", JSON.stringify(savedElements));
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
    localStorage.setItem("elements", retrievedElement[2]);
    setSelectedElement(null);
    setEditDrawing(saveId);
  }

  function onClickOpenDrawing(saveId) {
    handleMenuClose();
    openDrawing(saveId);
  }
  const savedItemsMenu = savedElements.map((item, index) => (
    <Grid
      container
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Grid item xs={9}>
        <MenuItem
          onClick={onClickOpenDrawing.bind(this, item[0])}
          value={item[0]}
        >
          {item[1]}
        </MenuItem>
      </Grid>
      <Grid item>
        <IconButton
          edge="start"
          className={navbarClasses.menuButton}
          color="inherit"
          onClick={deleteSavedElements.bind(this, item[0])}
        >
          <DeleteForeverIcon />
        </IconButton>
      </Grid>
    </Grid>
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
          onClick={saveEdit}
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

  function checkUserPk() {
    if (userPk === null) {
      updateUserPk(loginStateKey);
    }
  }

  function updateUserPk(key) {
    let authToken = "Token " + key;

    if (key && userPk === null) {
      return axios
        .get("/api/v1/users/auth/user/", {
          headers: { Authorization: authToken },
        })
        .then((res) => {
          setUserPk(res.data.pk);
          return res.data.pk;
        })
        .catch((err) => console.log(err));
    }
  }

  function handleInputChange(event) {
    setDrawingName(event.target.value);
  }

  function savedDrawingLocally(drawingIndex, drawingName, elements) {
    let saveLocal;
    if (savedElements.length === 0) {
      saveLocal = [[drawingIndex, drawingName, elements]];
    } else {
      saveLocal = savedElements.concat([[drawingIndex, drawingName, elements]]);
    }

    localStorage.setItem("savedElements", JSON.stringify(saveLocal));
  }

  function savedDrawingLocallyWithDbId(
    drawingIndex,
    drawingName,
    elements,
    dbId
  ) {
    let saveLocal;
    if (localStorage.getItem("savedElements") === null) {
      saveLocal = [[drawingIndex, drawingName, elements, dbId]];
    } else {
      saveLocal = JSON.parse(localStorage.getItem("savedElements")).concat([
        [drawingIndex, drawingName, elements, dbId],
      ]);
    }
    localStorage.setItem("savedElements", JSON.stringify(saveLocal));
  }

  function saveDrawings(event) {
    event.preventDefault();
    const drawingIndex = savedElements.length;
    if (elements) {
      if (auth) {
        let elementsOutput = JSON.stringify(
          elements.map(({ id, x1, y1, x2, y2 }) => [id, x1, y1, x2, y2])
        );
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
            let rowId = response.data.id;
            savedDrawingLocallyWithDbId(
              drawingIndex,
              drawingName,
              elements,
              rowId
            );
            setSavedElements((prevState) => [
              ...prevState,
              [drawingIndex, drawingName, elements, rowId],
            ]);
          })
          .catch(function (error) {
            console.log(error);
          });
      } else {
        savedDrawingLocally(drawingIndex, drawingName, elements);
      }
    }
  }

  function saveEdit(event) {
    event.preventDefault();
    const drawingIndex = savedElements.length;
    if (elements && editDrawing !== null) {
      const saveId = editDrawing;
      let copiedSavedElements = savedElements;
      copiedSavedElements[saveId][2] = elements;
      let index = savedElements[saveId][0];
      let drawName = savedElements[saveId][1];
      setSavedElements(copiedSavedElements);
      let currentLocalSave = JSON.parse(localStorage.getItem("savedElements"));
      currentLocalSave[saveId] = [index, drawName, elements];
      localStorage.setItem("savedElements", JSON.stringify(currentLocalSave));
      if (auth) {
        let dbId = savedElements[saveId][3];
        const authToken = "Token " + loginStateKey;
        let elementsOutput = JSON.stringify(
          elements.map(({ id, x1, y1, x2, y2 }) => [id, x1, y1, x2, y2])
        );
        axios({
          method: "put",
          url: "/api/drawings/" + dbId,
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken,
          },
          data: {
            username: userPk,
            saveId: index,
            saveName: drawName,
            corners: elementsOutput,
          },
        });
      }
    }
  }

  function clearElements() {
    setElements([]);
    localStorage.setItem("elements", []);
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
    localStorage.setItem("elements", elementsCopy);
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
      localStorage.setItem("elements", (prevState) => [...prevState, element]);
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
              onClick={handleMenuOpen}
            >
              <PermMediaIcon />
            </IconButton>
            <Menu
              id="fade-menu"
              anchorEl={anchorEl}
              keepMounted
              open={savedDrawingMenu}
              onClose={handleMenuClose}
            >
              <div style={{ align: "center" }}>
                <text style={{ fontWeight: "bold", paddingRight: 30 }}>
                  <PermMediaIcon
                    style={{ paddingLeft: 10, paddingRight: 10 }}
                  />
                  My Saved Drawings
                </text>
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
                  checkUserPk();
                }}
                icon={<MouseIcon />}
              />
              <BottomNavigationAction
                label="Draw"
                checked={tool === "draw"}
                onClick={() => {
                  setTool("draw");
                  checkUserPk();
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
                onSubmit={saveDrawings}
              >
                {/* <label htmlFor="text">Drawing name: </label> */}
                <TextField
                  id="standard-disabled"
                  label="New Drawing Name"
                  variant="filled"
                  className={textFieldClasses.root}
                  InputLabelProps={{
                    style: {
                      color: "aliceblue",
                    },
                  }}
                  InputProps={{ style: { color: "aliceblue" } }}
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
                    {loginEmailError && (
                      <TextField
                        error
                        margin="dense"
                        id="name"
                        label="Email Address"
                        type="email"
                        fullWidth
                        helperText={loginEmailError}
                        onChange={usernameChange}
                      />
                    )}
                    {!loginEmailError && (
                      <TextField
                        margin="dense"
                        id="name"
                        label="Email Address"
                        type="email"
                        fullWidth
                        onChange={usernameChange}
                      />
                    )}
                    {loginPassError && (
                      <TextField
                        error
                        margin="dense"
                        id="password"
                        label="Password"
                        type="password"
                        fullWidth
                        helperText={loginPassError}
                        onChange={passwordChange}
                      />
                    )}
                    {!loginPassError && (
                      <TextField
                        margin="dense"
                        id="password"
                        label="Password"
                        type="password"
                        fullWidth
                        onChange={passwordChange}
                      />
                    )}
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
                    {signUpEmailError && (
                      <TextField
                        error
                        margin="dense"
                        id="name"
                        label="Email Address"
                        type="email"
                        fullWidth
                        helperText={signUpEmailError}
                        onChange={usernameChange}
                      />
                    )}
                    {!signUpEmailError && (
                      <TextField
                        margin="dense"
                        id="name"
                        label="Email Address"
                        type="email"
                        fullWidth
                        defaultValue={username}
                        onChange={usernameChange}
                      />
                    )}

                    {pass1Error && (
                      <TextField
                        error
                        margin="dense"
                        id="password1"
                        label="Password"
                        type="password"
                        helperText={pass1Error}
                        fullWidth
                        onChange={passwordChange}
                      />
                    )}
                    {!pass1Error && (
                      <TextField
                        margin="dense"
                        id="password1"
                        label="Password"
                        type="password"
                        fullWidth
                        onChange={passwordChange}
                      />
                    )}
                    {pass2Error && (
                      <TextField
                        error
                        margin="dense"
                        id="password2"
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        helperText={pass2Error}
                        onChange={confirmPasswordChange}
                      />
                    )}
                    {!pass2Error && (
                      <TextField
                        margin="dense"
                        id="password2"
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        defaultValue=""
                        onChange={confirmPasswordChange}
                      />
                    )}
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
                {/* <Button color="inherit" onClick={manualSavedRetrieval}>
                  Load Saved
                </Button> */}
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
