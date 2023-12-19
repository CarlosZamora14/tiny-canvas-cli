<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">

  <h3 align="center">Tiny Canvas CLI</h3>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#features">Features</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
  </ol>
</details>

## About The Project

Tiny Canvas CLI is a command-line application designed for creating simple drawings using a set of basic commands.

### Features:

- Drawing commands: Move the cursor, rotate directions, and switch between hover, drawing, and eraser modes.
- Canvas manipulation: Clear the canvas and display the current drawing.
- Undo and redo: Commands to undo and redo the most recent cursor or canvas operations.
- File saving: Save the current canvas to a .txt file.

### Built With

The technologies used include TypeScript and Node.js

* [![NodeJS][NodeJS]][NodeJS-url]
* [![TypeScript][TypeScript]][TypeScript]

<p align="right"><a href="#readme-top">back to top</a></p>

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

Ensure you have Node.js and npm (Node Package Manager) installed on your machine.

### Installation

To run Tiny Canvas CLI locally on your system, follow these steps:

1. Clone the repo
   ```sh
   git clone https://github.com/CarlosZamora14/tiny-canvas-cli.git
   ```
2. Navigate to the project directory:
   ```sh
   cd tiny-canvas-cli
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Run the application
   ```sh
   npm run start
   ```

<p align="right"><a href="#readme-top">back to top</a></p>

## Usage

Once you run Tiny Canvas CLI, a list of available commands will be displayed along with its explanation. Simply follow the commands to manipulate the virtual canvas. For instance, to create a simple square, you can use the following sequence:

```sh
draw
steps 3
rotc 2
steps 3
rotc 2
steps 3
rotc 2
steps 3
display
```

<details>
  <summary>'Hello world' example</summary>
<pre><code>hover
steps 6
rot 2
steps 9
draw
rot 2
steps 4
rot 4
steps 2
rotc 2
steps 2
rot 2
steps 2
rot 4
steps 4
rot 2
hover
steps 2
rot 2
draw
steps 4
rotc 2
steps 2
rotc 2
hover
steps 2
rotc 2
draw
steps 2
rot 2
steps 2
rot 2
steps 2
hover
steps 2
draw
steps 1
rot 4
steps 1
rotc 2
steps 4
rotc 2
hover
steps 3
draw
rotc 2
steps 4
rot 2
steps 1
hover
steps 3
draw
steps 1
hover
steps 1
rot 2
steps 1
draw
steps 2
hover
steps 1
rot 2
steps 1
draw
steps 1
hover
steps 1
rot 2
steps 1
draw
steps 2
hover
steps 4
rotc 2
steps 17
rot 2
draw
steps 3
hover
steps 1
rot 2
steps 1
draw
steps 0
hover
steps 1
rot 2
steps 1
draw
steps 1
rot 4
hover
steps 2
rot 2
steps 1
draw
steps 0
hover
steps 1
rot 2
steps 1
draw
steps 3
rotc 2
hover
steps 2
rotc 2
steps 1
draw
steps 2
hover
steps 1
rot 2
steps 1
draw
steps 1
hover
steps 1
rot 2
steps 1
draw
steps 2
hover
steps 1
rot 2
steps 1
draw
steps 1
rot 4
hover
steps 4
rotc 2
draw
steps 4
rot 2
hover
steps 3
rot 2
draw
steps 1
rot 1
steps 1
rot 1
steps 1
rot 4
steps 1
rot 1
steps 1
steps 0
rot 2
steps 1
rot 1
steps 1
rot 4
hover
steps 4
rotc 2
draw
steps 4
rot 2
steps 1
hover
steps 2
rot 2
draw
steps 4
rotc 2
steps 1
rotc 1
steps 1
rotc 1
steps 2
rotc 1
steps 1
rot 3
hover
steps 3
draw
steps 0
rot 2
hover
steps 2
draw
steps 2
display
</code>
</pre>
</details>

<p align="right"><a href="#readme-top">back to top</a></p>

<!-- MARKDOWN LINKS & IMAGES -->
[TypeScript-url]: https://www.typescriptlang.org/
[TypeScript]: https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white
[NodeJS-url]: https://nodejs.org/en
[NodeJS]: https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white