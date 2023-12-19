enum Messages {
  REQUEST_FILE_NAME = 'File name: ',
  REPLACE_FILE = 'Do you want to replace the file? (y/n): ',
  INVALID_ANSWER = "Invalid input. Please enter 'y' or 'n'.",
  FILE_SAVED = 'File saved successfully at ',
  FILE_EXISTS = 'That file already exists!',
  INVALID_FILE_NAME = 'The name of the file can only contain alphanumeric characters.',
  UNKNOWN_COMMAND = 'Unknown command. Please check your input.',
  WRONG_NUMBER_OF_PARAMETERS = 'Wrong number of parameters.',
  UNDO_CHANGES = 'Changes undone.',
  REAPPLY_CHANGES = 'Recently undone changes have been restored.',
  EMPTY_HISTORY = 'The command history is empty.',
  NOTHING_TO_RESTORE = 'The command history is empty.',
}

export { Messages };