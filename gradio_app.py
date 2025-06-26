import subprocess
import atexit
import gradio as gr

# Start backend server
backend = subprocess.Popen(["npm", "run", "dev"], cwd="server")
# Start frontend
frontend = subprocess.Popen(["npm", "run", "dev", "--", "--host", "0.0.0.0"], cwd="client")

# Create a tunnel or proxy to access the frontend
try:
    frontend_url = gr.tunneling.create_tunnel(3000)
except Exception:
    frontend_url = f"/proxy/3000"

def cleanup():
    backend.terminate()
    frontend.terminate()

atexit.register(cleanup)

with gr.Blocks() as demo:
    gr.Markdown("# Roma Photo Map")
    gr.HTML(f"<iframe src='{frontend_url}' style='width:100%;height:600px;'></iframe>")

demo.launch()
