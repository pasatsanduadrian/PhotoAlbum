# Photo Album Demo

This repository contains a small demo consisting of a Node.js/React photo album application served inside a Gradio interface.

## Running

1. Install dependencies for the Node.js frontend and backend:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
2. Install the Python dependency:
   ```bash
   pip install gradio
   ```
3. Start the app using the Gradio helper:
   ```bash
   python gradio_app.py
   ```

   To expose the interface publicly (useful in Google Colab), set
   the `GRADIO_SHARE` environment variable:

   ```bash
   GRADIO_SHARE=true python gradio_app.py
   ```

After launching, Gradio prints a **public URL** similar to:

```
Running on public URL: https://xxxx.gradio.live
```

Open that link in your browser to use the photo album. The frontend is hosted inside the Gradio interface and no longer needs direct access to `localhost:3000`.
