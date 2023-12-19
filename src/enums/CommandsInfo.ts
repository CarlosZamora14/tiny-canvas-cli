enum CommandsInfo {
  STEPS = "'steps <n>' moves the cursor n steps in the current direction. If no second argument is provided, the cursor will move 1 step.",
  ROTATE = "'rot <n>' rotates the cursor's current direction n times counterclockwise. The available directions are N, NW, W, SW, S, SE, E and NE in that order. If no second argument is provided, the cursor will rotate once.",
  ROTATE_CLOCKWISE = "'rotc <n>' rotates the cursor's current direction n times clockwise. The available directions are N, NE, E, SE, S, SW, W and NW in that order .If no second argument is provided, the cursor will rotate once.",
  HOVER = "'hover' sets the drawing mode to hover, preventing the cursor from altering the canvas.",
  DRAW = "'draw' sets the drawing mode to draw, allowing the cursor to place asterisks on the canvas.",
  ERASER = "'eraser' sets the drawing mode to eraser, making the cursor clear the canvas cells, leaving them blank.",
  POSITION = "'pos' prints the current cursor position in the format (x, y).",
  DIRECTION = "'dir' prints the current cursor direction.",
  DISPLAY = "'display' prints the current canvas.",
  CLEAR = "'clear' resets the canvas without changing the cursor position, direction, or drawing mode.",
  QUIT = "'quit' closes the application.",
  UNDO = "'undo' reverses the most recent cursor or canvas operation.",
  RESTORE = "'restore' reapplies previously undone changes. If the previous command was not 'undo', this operation has no effect.",
  SAVE = "'save' creates a file with the contents of the current canvas.",
  INFO = "'info <command-name>' displays information about a specific command. If no second argument is provided, information about all commands is shown.",
}

export { CommandsInfo };