# Roma Photo Map

This project lets you upload photos with EXIF GPS information and view them grouped on an interactive map of Rome. The application consists of a React frontend (Vite) and a Node/Express backend. A small `gradio_app.py` script can launch both services and expose the UI through Gradio.

## Repository Structure

```
client/  - React 18 + TypeScript front‑end
server/  - Node.js Express API and SQLite DB
uploads/ - created at runtime for uploaded images
gradio_app.py - helper to start frontend + backend with a temporary Gradio link
```

## Running Locally

1. Install **Node.js** (18+ recommended) and **Python 3.9+**.
2. Install dependencies for each part:

```bash
npm install --prefix server
npm install --prefix client
pip install gradio
```

3. Optional: build the TypeScript backend

```bash
npx tsc -p server/tsconfig.json
```

4. Start the development servers together using the Gradio helper:

```bash
python gradio_app.py
```

Gradio will print a public `share` URL that you can open in your browser.

## Testing on Google Colab

Below is a minimal sequence of commands for a Colab notebook cell. Replace `YOUR_REPO_URL` with the GitHub clone URL for this project.

```bash
!git clone YOUR_REPO_URL roma-photo-map
%cd roma-photo-map
!sudo apt-get update -y
!sudo apt-get install -y nodejs npm
!npm install --prefix server
!npm install --prefix client
!pip install gradio
!npx tsc -p server/tsconfig.json
!python gradio_app.py
```

Colab already includes Python so only Node and npm are installed via `apt-get`. The commands above install all packages and then launch the application with a temporary Gradio link.
