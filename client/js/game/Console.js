const Constants = require("../../../lib/Constants");
const TextBox = require("./TextBox");

const commands = [
    "Debug_change_speed",
    "toggleLearning"
]

const white = "#FFFFFF"
const red = "#FF0000"

const console_id = "Console"

const error_message_isNan = "Please provide a number"

const autocomplete_div = "autocomplete-list"
const autocomplete_class = "autocomplete-items"
const autocomplete_active = "autocomplete-active"


class Console {
    /**
     * Create a new console
     * @param {HTMLElement} console 
     * @param {TextBox} textbox 
     */
    constructor(console, textbox, socket) {
        this.console = console;
        this.textbox = textbox;
        this.socket = socket;

        this.writeInputToConsole()
        this.autocomplete(console, commands)
    }

    /**
     * Create a new console
     * @param {HTMLElement} console 
     * @param {TextBox} textbox 
     * @returns console
     */
    static create(console, textbox, socket) {
        return new Console(console, textbox, socket);
    }

    /**
     * Write input to the console when pressing enter
     */
    writeInputToConsole() {
        this.console.addEventListener("keyup", (event) => {
            if (event.key == "Enter") {
                this.textbox.addListItem(this.processInput(event.target.value), console_id, white);
                this.console.value = "";
            }
        })
    }

    /**
     * TODO: clean up
     * Process input before writing it to console
     * @param {string} input 
     * @returns input
     */
    processInput(input) {
        let inputArr = input.split(" ")
        let data = {}
        if (inputArr.length > 1) {
            if (inputArr[0] == commands[0]) {
                let number = parseInt(inputArr[1])
                if (isNaN(number)) {
                    this.textbox.addListItem(error_message_isNan, console_id,red)
                } else {
                    Constants.BOT_DEFAULT_SPEED = number;
                }
            }
        }
        if (inputArr.length == 1) {
            if (inputArr[0] == commands[1]) {
                data.toggleTraining = true;
            }
        }
        
        this.sendDebugInfo(data);

        return input
    }

    /**
     * TODO: Send messages to server
     * @param {Object} messages 
     */
    sendMessages(messages) {
        // this.socket.emit()
    }

    /**
     * Send commands to server
     * @param {Object} info 
     */
    sendDebugInfo(info) {
        this.socket.emit(Constants.SOCKET_DEBUG_INFO, info);
    }

    /**
     * Create autocomplete items based on input
     * @param {HTMLElement} console 
     * @param {Array} autoCompleteInput 
     */
    autocomplete(console, autoCompleteInput) {
        /*the autocomplete function takes two arguments,
        the text field element and an array of possible autocompleted values:*/
        var currentFocus;
        /*execute a function when someone writes in the text field:*/
        console.addEventListener("input", function (e) {
            var a, b, i, val = e.target.value;
            /*close any already open lists of autocompleted values*/
            closeAllLists();
            if (!val) { return false; }
            currentFocus = -1;
            /*create a DIV element that will contain the items (values):*/
            a = document.createElement("DIV");
            a.setAttribute("id", console.id + autocomplete_div);
            a.setAttribute("class", autocomplete_class);
            /*append the DIV element as a child of the autocomplete container:*/
            console.parentNode.appendChild(a);
            /*for each item in the array...*/
            for (i = 0; i < autoCompleteInput.length; i++) {
                /*check if the item starts with the same letters as the text field value:*/
                if (autoCompleteInput[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                    /*create a DIV element for each matching element:*/
                    b = document.createElement("DIV");
                    /*make the matching letters bold:*/
                    b.innerHTML = "<strong>" + autoCompleteInput[i].substr(0, val.length) + "</strong>";
                    b.innerHTML += autoCompleteInput[i].substr(val.length);
                    /*insert a input field that will hold the current array item's value:*/
                    b.innerHTML += "<input type='hidden' value='" + autoCompleteInput[i] + "'>";
                    /*execute a function when someone clicks on the item value (DIV element):*/
                    b.addEventListener("click", function (e) {
                        /*insert the value for the autocomplete text field:*/
                        console.value = e.target.getElementsByTagName("input")[0].value;
                        /*close the list of autocompleted values,
                        (or any other open lists of autocompleted values:*/
                        closeAllLists();
                    });
                    a.appendChild(b);
                }
            }
        });
        /*execute a function presses a key on the keyboard:*/
        console.addEventListener("keydown", function (e) {
            var x = document.getElementById(console.id + autocomplete_div);
            if (x) x = x.getElementsByTagName("div");
            if (e.key == "ArrowDown") {
                /*If the arrow DOWN key is pressed,
                increase the currentFocus variable:*/
                currentFocus++;
                /*and and make the current item more visible:*/
                addActive(x);
            } else if (e.key == "ArrowUp") { //up
                /*If the arrow UP key is pressed,
                decrease the currentFocus variable:*/
                currentFocus--;
                /*and and make the current item more visible:*/
                addActive(x);
            } else if (e.key == "Tab") {
                e.preventDefault();
                if (currentFocus > -1) {
                    /*and simulate a click on the "active" item:*/
                    if (x) {
                        console.value = x[currentFocus].getElementsByTagName("input")[0].value;
                    }
                }
            } else if (e.key == "Enter") {
                closeAllLists(x)
            }
        });
        function addActive(x) {
            /*a function to classify an item as "active":*/
            if (!x) return false;
            /*start by removing the "active" class on all items:*/
            removeActive(x);
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
            /*add class "autocomplete-active":*/
            x[currentFocus].classList.add(autocomplete_active);
        }
        function removeActive(x) {
            /*a function to remove the "active" class from all autocomplete items:*/
            for (var i = 0; i < x.length; i++) {
                x[i].classList.remove(autocomplete_active);
            }
        }
        function closeAllLists(elmnt) {
            /*close all autocomplete lists in the document,
            except the one passed as an argument:*/
            var x = document.getElementsByClassName(autocomplete_class);
            for (var i = 0; i < x.length; i++) {
                if (elmnt != x[i] && elmnt != console) {
                    x[i].parentNode.removeChild(x[i]);
                }
            }
        }
        /*execute a function when someone clicks in the document:*/
        document.addEventListener("click", function (e) {
            closeAllLists(e.target);
        });
    }
}

module.exports = Console