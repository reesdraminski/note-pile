const STORAGE_LOCATION = "sticky-notes";
const DEFAULT_NOTE_HEIGHT = "200px";
const DEFAULT_NOTE_WIDTH = "200px";

const containerEl = document.getElementById("container");
let NOTES = [];
let dragObj = null;

/**
 * Initialize the UI components.
 */
(function initUI() {
    // load notes from memory and add them to the screen
    NOTES = localStorage.getItem(STORAGE_LOCATION) ? JSON.parse(localStorage.getItem(STORAGE_LOCATION)) : [];
    NOTES.forEach(data => createNoteEl(data));

    // detect right click on page to create a note
    containerEl.oncontextmenu = e => {
        // prevent contextmenu from coming up
        e.preventDefault();

        // create a note with default values
        const noteData = {
            x: e.clientX,
            y: e.clientY,
            height: DEFAULT_NOTE_HEIGHT,
            width: DEFAULT_NOTE_WIDTH,
            color: getRandomColor(),
            content: ""
        };

        // save the note to memory
        NOTES.push(noteData);
        saveData();

        // create the note HTML element
        createNoteEl(noteData);
    }

    bindUndragListener();
})();

/**
 * Create a note element at a specfic (x, y) coordinate.
 * @param {Number} x 
 * @param {Number} y 
 */
function createNoteEl(data)
{
    // create an editable note element
    const noteEl = document.createElement("div");
    noteEl.innerHTML = data.content;
    noteEl.className = "note";
    noteEl.contentEditable = true;
    noteEl.draggable = true;

    // create the note where you right clicked
    noteEl.style.position = "absolute";
    noteEl.style.top = data.y;
    noteEl.style.left = data.x;

    // make note resizable
    noteEl.style.resize   = "both";
    noteEl.style.overflow = "auto";

    // make note square sized and get random color
    noteEl.style.height = data.height;
    noteEl.style.width  = data.width;
    noteEl.style.background = data.color;

    // click event is fired when done resizing
    noteEl.onclick = () => {
        data.height = noteEl.style.height;
        data.width  = noteEl.style.width;

        saveData();
    }

    // when the user starts to drag the note element
    noteEl.ondragstart = e => {
        e.preventDefault();
        
        startDrag(e, noteEl, data); 
        
        // prevent default browser drag-n-drop functionality
        return false;
    }

    noteEl.ondblclick = e => {
        console.log(e);
    }

    // debounce note changes to prevent saving too much to localStorage when it's not necessary
    let timeout;
    noteEl.oninput = () => {
        // debounce 300ms
        timeout = setTimeout(() => {
            // clear previous timeout
            if (timeout) clearTimeout(timeout);

            // update note content data item and save
            data.content = noteEl.innerHTML;
            saveData();
        }, 300);
    }
    
    // add the note element to the page
    containerEl.appendChild(noteEl);
}

/**
 * The undrag listener is a onmouseup listener bound at the document level to prevent anything weird from happening.
 * Saves the position after dragging.
 */
function bindUndragListener() {
    document.onmouseup = () => {
        if (dragObj) 
        {
            // stop listening for mouse movement
            window.removeEventListener("mousemove", dragObject, true);

            // save the drag position to the note data item
            dragObj.data.x = dragObj.el.style.left;
            dragObj.data.y = dragObj.el.style.top;
            saveData();

            // stop tracking this object as dragging
            dragObj = null;
        }
    };
}

/**
 * Save the notes data to localStorage.
 */
function saveData() 
{
    localStorage.setItem(STORAGE_LOCATION, JSON.stringify(NOTES));
}

/**
 * Start dragging a note element.
 * From: https://stackoverflow.com/questions/9334084/moveable-draggable-div
 * @param {Event} e 
 * @param {HTMLElement} el 
 */
function startDrag(e, el, data) {
    e.preventDefault();
    e.stopPropagation();

    dragObj = { el: el, data: data };

    // clientX and getBoundingClientRect() both use viewable area adjusted when scrolling aka 'viewport'
    let rect = el.getBoundingClientRect();
    xOffset  = e.clientX - rect.left;
    yOffset  = e.clientY - rect.top;
        
    window.addEventListener("mousemove", dragObject, true);
}

/**
 * Move a note element around the screen via dragging.
 * @param {Event} e 
 */
function dragObject(e) {
    e.preventDefault();
    e.stopPropagation();

    // if there is no object being dragged then do nothing
    if (dragObj == null) 
    {
        return; 
    }

    // adjust location of dragged object so doesn't jump to mouse position
    dragObj.el.style.left = e.clientX - xOffset + "px"; 
    dragObj.el.style.top  = e.clientY - yOffset + "px";
}

/**
 * Returns a random sticky note hex code value.
 * @return {String} randomColor
 */
function getRandomColor()
{
    const colors = [ "#ff7eb9", "#7afcff", "#feff9c" ];

    return colors[Math.floor(Math.random() * colors.length)];
}