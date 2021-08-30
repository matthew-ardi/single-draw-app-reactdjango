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

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

// STYLES CODE BELOW

// Modal Styles

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
    padding: theme.spacing(2, 4, 3),
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
}));

// STYLES CODE ABOVE

// CORE APP CODE BELOW

const generator = rough.generator();

function createElement(id, x1, y1, x2, y2, tool, color) {
  const roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1, {
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

  // UI RELATED BELOW

  // navbar
  const navbarClasses = navbarUseStyles();

  // modal
  const modalClasses = modalUseStyles();
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // UI RELATED ABOVE

  function getSavedElements() {
    axios
      .get("api/drawings")
      .then((res) => setGetSaved(res.data))
      .catch((err) => console.log(err));
    console.log(getSaved);
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
          Save {saveName}
        </Button>
      );
    } else {
      return <div></div>;
    }
  }
  const editModeVisual = editVisual();

  // function editModeVisual() {
  //   if (editDrawing) {
  //     return <editVisual />;
  //   }

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
  }

  function clearElements() {
    setElements([]);
    setSelectedElement([]);
    setEditDrawing(null);
  }

  function deleteElement() {
    if (selectedElement && elements) {
      const { id } = selectedElement;
      const elementsCopy = elements.filter((item) => item.id !== id);
      // elementsCopy = elementsCopy.splice(id, 1);
      setElements(elementsCopy);
    }
  }

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);
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
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={navbarClasses.title}>
              Draw Your Rectangles
            </Typography>
            <Button color="inherit" onClick={handleOpen}>
              Login
            </Button>
            <Modal
              aria-labelledby="transition-modal-title"
              aria-describedby="transition-modal-description"
              className={modalClasses.modal}
              open={open}
              onClose={handleClose}
              closeAfterTransition
              BackdropComponent={Backdrop}
              BackdropProps={{
                timeout: 500,
              }}
            >
              <Fade in={open}>
                <div className={modalClasses.paper}>
                  <h2 id="transition-modal-title">Transition modal</h2>
                  <p id="transition-modal-description">
                    react-transition-group animates me.
                  </p>
                </div>
              </Fade>
            </Modal>
            <Button color="inherit" onClick={handleOpen}>
              Sign Up
            </Button>
          </Toolbar>
        </AppBar>
      </div>
      <br />
      <div style={{ position: "fixed" }}>
        <input
          type="radio"
          id="Select"
          checked={tool === "Select"}
          onChange={() => setTool("Select")}
        />
        <label htmlFor="Move">Select</label>
        {/* <input
          type="radio"
          id="Move"
          checked={tool === "Move"}
          onChange={() => setTool("Move")}
        />
        <label htmlFor="Move">Move</label> */}
        <input
          type="radio"
          id="draw"
          checked={tool === "draw"}
          onChange={() => setTool("draw")}
        />
        <label htmlFor="draw">Draw</label>
        <Button
          variant="contained"
          color="primary"
          type="Button"
          id="delete"
          onClick={deleteElement}
        >
          Delete
        </Button>
        <Button
          variant="contained"
          color="primary"
          type="Button"
          id="clear"
          onClick={clearElements}
        >
          Clear
        </Button>

        <form id="form" onSubmit={saveDrawings}>
          <label htmlFor="text">Drawing name:</label>
          <input
            type="text"
            id="text"
            value={drawingName}
            onChange={handleInputChange}
          />
          <Button variant="contained" color="primary" type="submit" id="save">
            Save
          </Button>
        </form>
        <br />
        {/* <div>
          <editModeVisual/>
        </div> */}

        <div>{editModeVisual}</div>
        <br />
        <div>Your saved drawings:</div>
        <ul>{savedItems}</ul>
        <Button
          variant="contained"
          color="primary"
          type="Button"
          id="Get"
          onClick={getSavedElements}
        >
          Get
        </Button>
      </div>
      <canvas
        id="canvas"
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {" "}
        Canvas
      </canvas>
    </div>
  );
};

export default App;
