import subprocess
import atexit
import gradio as gr

# Start backend server
backend = subprocess.Popen(["npm", "run", "dev"], cwd="server")
# Start frontend
frontend = subprocess.Popen(["npm", "run", "dev", "--", "--host", "0.0.0.0"], cwd="client")

def cleanup():
    backend.terminate()
    frontend.terminate()

atexit.register(cleanup)

with gr.Blocks() as demo:
    gr.Markdown("# Roma Photo Map")
    gr.HTML("<iframe src='http://localhost:3000' style='width:100%;height:600px;'></iframe>")

demo.launch()
