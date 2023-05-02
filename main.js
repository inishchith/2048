const OPENAI_KEY = "YOUR_OPENAI_KEY";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-3.5-turbo";

const DEBUG_MODE_ENABLED = false;


function getGamePrompt(currentBoard) {
    let PROMPT = `
You are an agent controlling the board for the 2048 game. You are given a 4 by 4 board ("Current Board") where each tile has either numbers or "-' (hypen)

Rules for the 2048 game:

The 2048 game is a puzzle game that is played on a board. The board has 16 squares (4 squares by 4 squares). The goal of the game is to get a tile with the number 2048 on it.

To play the game, you have to issue on the following command to slide the tiles on the board.
		"UP" - move all the tiles in the upward direction
		"DOWN" - move all the tiles in the downward direction
		"LEFT" - move all the tiles in the left direction
		"RIGHT" - move all the tiles in the right direction


When you slide the tiles, they all move in the same direction.

- When two tiles with the same number are moved together, they merge into one tile with a larger number.
- For example, if you slide two tiles with the number 2 together, they will merge into a single tile with the number 4 on it.
- Your goal is to slide the tiles around the board to merge them together and create larger tiles.
- As you play, new tiles will appear on the board with the number 2 or 4 on them.
- The game is over if the board fills up with tiles and you can no longer move them around to merge them.
- You should consider all the moves and issue a command which you think could possibly get the game to a tile with 2048 quicker. 


only respond with your move and nothing else.

Here are some examples:

EXAMPLE 1:
==================================================
Current Board:

8 4 2 8 
4 2 16 4 
4 4 8 2 
- - 4 2 

Command: UP
==================================================
EXAMPLE 2:
==================================================
Current Board:

8 4 2 8 
4 4 16 8 
4 4 - 8 
4 4 - - 

Command: DOWN 
==================================================
Example 3:
==================================================
Current Board:

16 4 4 8 
2 2 16 16 
- 8 8 - 
- 2 2 2 

Command: RIGHT
==================================================
Example 4:
==================================================
Current Board:

16 16 8 4 
16 16 8 2 
- 8 8 - 
- 2 2 2 

Command: LEFT
==================================================

These are just examples, remember you should consider all the moves and issue a command which you think could possibly get the game to a tile with 2048 quicker. 

==========
Current Board:

${currentBoard}

Command:
    `;

    return PROMPT;
}

// 2048.io@keyboard_input_manager.js enable programatic input
KeyboardInputManager.prototype.targetIsInput = function (event) {
    return false;
};

class KeyboardInput {
    constructor(key, keyCode) {
        this.key = key;
        this.keyCode = keyCode;
    }
}


(async function main() {
    document.getElementsByClassName("game-intro")[0].innerHTML = `Now controlled by <strong> GPT</strong> (${OPENAI_MODEL}) 😈`

    const keyMap = {
        "UP": new KeyboardInput("ArrowUp", 38),
        "DOWN": new KeyboardInput("ArrowDown", 40),
        "LEFT": new KeyboardInput("ArrowLeft", 37),
        "RIGHT": new KeyboardInput("ArrowRight", 39),
    }

    // loop over until game not over
    while (document.getElementsByClassName("game-over").length == 0) {
        const N_ROWS = 4;
        const N_COLS = 4;
        let board = new Array(N_ROWS).fill(0).map(() => new Array(N_COLS).fill(0));

        for (let row = 1; row <= N_ROWS; row++) {
            for (let col = 1; col <= N_COLS; col++) {
                let element = document.getElementsByClassName(`tile-position-${col}-${row}`);
                if (element.length > 0) {
                    let value = element[0].children[0].innerHTML;
                    board[row - 1][col - 1] = value;
                } else {
                    board[row - 1][col - 1] = "-";
                }
            }
        }

        let boardString = "";
        for (let row = 0; row < N_ROWS; row++) {
            for (let col = 0; col < N_COLS; col++) {
                boardString += board[row][col];
                boardString += " ";
            }
            boardString += "\n";
        }

        const response = await fetch(OPENAI_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": OPENAI_MODEL,
                "messages": [{"role": "user", "content": getGamePrompt(boardString)}]
            })
        });

        const data = await response.json();
        let nextMove = data.choices[0].message.content.trim().replaceAll("\n", "");

        if (DEBUG_MODE_ENABLED) {
            console.debug(data);
            console.debug(`Move: ${nextMove}`);
        }

        let event = new KeyboardEvent("keydown", {
            code: keyMap[nextMove].key,
            key: keyMap[nextMove].key,
            keyCode: keyMap[nextMove].keyCode,
            which: keyMap[nextMove].keyCode,
            shiftKey: false,
        });
        document.dispatchEvent(event);
    }

    console.debug("GAME OVER!");
})();
